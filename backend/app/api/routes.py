"""
backend/app/api/routes.py — FastAPI route definitions for StudyFlow AI.
Handles study plan generation, validation, rescheduling, session tracking,
prompt benchmarking, and timetable exports.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import PlainTextResponse

from app.models.schemas import (
    GeneratePlanRequest,
    GeneratePlanResponse,
    ValidatePlanRequest,
    ValidatePlanResponse,
    RescheduleRequest,
    RescheduleResponse,
    UpdateSessionRequest,
    PromptTestRequest,
    PromptTestResponse,
    PromptMetadataItem,
    HealthResponse,
    PresetItem,
    SubjectItem
)
from app.core.ai_engine import (
    generate_schedule,
    check_ollama_status,
    extract_prompt_metadata,
    test_prompt_live
)
from app.core.validator import validate_schedule
from app.core.rescheduler import reschedule
from app.state import state_manager

router = APIRouter(prefix="/api", tags=["StudyFlow API"])


@router.get("/health", response_model=HealthResponse)
def get_health():
    """Health check endpoint: verifies Ollama reachability, installed models, and plan state."""
    ollama_info = check_ollama_status()
    current_plan = state_manager.current_plan
    session_count = len(current_plan.get("sessions", [])) if current_plan else 0

    return HealthResponse(
        status="healthy",
        ollama_online=ollama_info.get("online", False),
        has_qwen3=ollama_info.get("has_model", False),
        models=ollama_info.get("models", []),
        active_plan_available=current_plan is not None,
        current_session_count=session_count
    )


@router.post("/plan/generate", response_model=GeneratePlanResponse)
def generate_study_plan(payload: GeneratePlanRequest):
    """
    Generate a study plan using local Ollama Qwen3 8B or deterministic fallback.
    Automatically validates the generated schedule deterministically.
    """
    subjects_dict = [s.model_dump() for s in payload.subjects]

    try:
        plan = generate_schedule(
            subjects=subjects_dict,
            available_hours=payload.available_hours,
            start_time=payload.start_time,
            extra_instructions=payload.extra_instructions or "",
            prompt_version=payload.prompt_version,
            use_fallback_if_offline=True
        )

        sessions = plan.get("sessions", [])

        # Validate schedule deterministically
        validation = validate_schedule(
            sessions=sessions,
            available_hours=payload.available_hours,
            expected_subjects=[s.subject for s in payload.subjects]
        )

        # Store in global state manager
        state_manager.set_plan(
            plan=plan,
            subjects=subjects_dict,
            available_hours=payload.available_hours,
            start_time=payload.start_time,
            validation=validation
        )

        return GeneratePlanResponse(
            sessions=sessions,
            assumptions=plan.get("assumptions", []),
            engine=plan.get("engine", "Ollama Qwen3 8B"),
            prompt_version=plan.get("prompt_version", payload.prompt_version),
            notice=plan.get("notice"),
            validation=validation
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/plan/validate", response_model=ValidatePlanResponse)
def validate_plan_endpoint(payload: ValidatePlanRequest):
    """Deterministically validates any study timetable against the 8+ academic constraints."""
    sessions_dict = [s.model_dump() for s in payload.sessions]
    result = validate_schedule(
        sessions=sessions_dict,
        available_hours=payload.available_hours,
        expected_subjects=payload.expected_subjects
    )
    return ValidatePlanResponse(**result)


@router.get("/plan/current")
def get_current_plan():
    """Retrieve the currently active plan, subjects, availability, and validation."""
    return {
        "schedule": state_manager.current_plan,
        "subjects": state_manager.current_subjects,
        "available_hours": state_manager.available_hours,
        "start_time": state_manager.start_time,
        "validation": state_manager.validation_result
    }


@router.post("/plan/reschedule", response_model=RescheduleResponse)
def reschedule_study_plan(payload: RescheduleRequest):
    """
    Adaptively reschedule the timetable after missed sessions or disruption.
    Preserves all previously completed sessions and generates explicit deltas.
    """
    subjects_dict = [s.model_dump() for s in payload.subjects]

    # Use provided schedule or fall back to current active plan
    orig_schedule = payload.original_schedule or state_manager.current_plan or {"sessions": []}

    try:
        revised = reschedule(
            original_schedule=orig_schedule,
            subjects=subjects_dict,
            remaining_hours=payload.remaining_hours,
            missed_description=payload.missed_description,
            new_start_time=payload.new_start_time,
            use_fallback_if_offline=True
        )

        sessions = revised.get("sessions", [])

        # Validate newly scheduled sessions
        new_sessions = [s for s in sessions if not s.get("completed")]
        validation = validate_schedule(
            sessions=new_sessions,
            available_hours=payload.remaining_hours
        )

        # Update active plan in state
        state_manager.set_plan(
            plan=revised,
            subjects=subjects_dict,
            available_hours=payload.remaining_hours,
            start_time=payload.new_start_time,
            validation=validation
        )

        return RescheduleResponse(
            sessions=sessions,
            delta_summary=revised.get("delta_summary", []),
            assumptions=revised.get("assumptions", []),
            engine=revised.get("engine", "StudyFlow Rescheduler"),
            notice=revised.get("notice"),
            validation=validation
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/sessions/{session_id}")
def update_session_status(session_id: str, payload: UpdateSessionRequest):
    """Update completion state of a specific session in the active plan."""
    success = state_manager.update_session(session_id, payload.completed)
    if not success:
        raise HTTPException(status_code=404, detail=f"Session with ID '{session_id}' not found.")
    return {"status": "success", "session_id": session_id, "completed": payload.completed}


@router.get("/prompts", response_model=List[PromptMetadataItem])
def get_prompt_versions():
    """Retrieve metadata, descriptions, changes, and templates for Prompt V1, V2, and V3."""
    versions = ["v1", "v2", "v3"]
    results = []
    for v in versions:
        meta = extract_prompt_metadata(v)
        results.append(PromptMetadataItem(**meta))
    return results


@router.post("/prompts/test", response_model=PromptTestResponse)
def test_prompt_endpoint(payload: PromptTestRequest):
    """Run live benchmark test with exact latency measurement for a selected prompt version."""
    subjects_dict = [s.model_dump() for s in payload.subjects]
    result = test_prompt_live(
        prompt_version=payload.prompt_version,
        subjects=subjects_dict,
        available_hours=payload.available_hours,
        start_time=payload.start_time,
        extra_instructions=payload.extra_instructions or ""
    )

    # If parsed JSON contains sessions, validate them
    validation = None
    if result.get("parsed_json") and isinstance(result["parsed_json"], dict) and "sessions" in result["parsed_json"]:
        validation = validate_schedule(
            sessions=result["parsed_json"]["sessions"],
            available_hours=payload.available_hours,
            expected_subjects=[s.subject for s in payload.subjects]
        )

    return PromptTestResponse(
        prompt_version=result["prompt_version"],
        raw_prompt=result["raw_prompt"],
        raw_response=result["raw_response"],
        parsed_json=result["parsed_json"],
        validation=validation,
        latency_ms=result["latency_ms"],
        engine=result["engine"],
        error=result.get("error")
    )


@router.get("/export/json")
def export_json_endpoint():
    """Download the current timetable and academic metadata as JSON."""
    data = state_manager.export_json()
    return data


@router.get("/export/markdown", response_class=PlainTextResponse)
def export_markdown_endpoint():
    """Download the current timetable formatted as clean Markdown."""
    content = state_manager.export_markdown()
    return PlainTextResponse(
        content=content,
        headers={"Content-Disposition": "attachment; filename=studyflow_timetable.md"}
    )


@router.get("/presets", response_model=List[PresetItem])
def get_presets():
    """Return academic preset scenarios for rapid evaluation and testing."""
    return [
        PresetItem(
            id="preset-crunch",
            title="Three-Subject Crunch",
            description="3 imminent subjects with exam deadlines in 3, 5, and 7 days. Designed for intensive 4.0h daily prep.",
            subjects=[
                SubjectItem(subject="Automata Theory", exam_in_days=3, priority="High"),
                SubjectItem(subject="C Programming", exam_in_days=5, priority="Medium"),
                SubjectItem(subject="AI/ML Systems", exam_in_days=7, priority="Medium")
            ],
            available_hours=4.0,
            start_time="09:00"
        ),
        PresetItem(
            id="preset-urgent",
            title="Urgent High-Priority Exam",
            description="1 urgent High-priority exam in 24 hours paired with 1 distant subject. Tests priority weighting.",
            subjects=[
                SubjectItem(subject="Operating Systems", exam_in_days=1, priority="High"),
                SubjectItem(subject="Web Technologies", exam_in_days=12, priority="Low")
            ],
            available_hours=3.5,
            start_time="08:30"
        ),
        PresetItem(
            id="preset-multi-exam",
            title="Multiple Nearby Exams",
            description="3 critical subjects with exams back-to-back in 2, 3, and 4 days. 5.0h balanced allocation.",
            subjects=[
                SubjectItem(subject="Discrete Mathematics", exam_in_days=2, priority="High"),
                SubjectItem(subject="Computer Networks", exam_in_days=3, priority="High"),
                SubjectItem(subject="Database Management", exam_in_days=4, priority="High")
            ],
            available_hours=5.0,
            start_time="08:00"
        )
    ]
