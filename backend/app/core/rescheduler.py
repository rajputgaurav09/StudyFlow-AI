"""
backend/app/core/rescheduler.py — Adaptive Schedule Rescheduler for StudyFlow AI.
Intelligently handles schedule disruptions, missed sessions, and altered availability.
Preserves completed work, prevents duplicate tasks, re-balances subject priorities,
and generates explicit delta summaries explaining all modifications.
"""

import os
import json
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Union
import requests

from app.core.ai_engine import (
    OLLAMA_URL, MODEL, extract_prompt_metadata, clean_json_response,
    generate_deterministic_fallback
)
from app.core.validator import validate_schedule, parse_time_str


def compute_schedule_deltas(
    original_sessions: List[Dict[str, Any]],
    revised_sessions: List[Dict[str, Any]],
    missed_description: str
) -> List[str]:
    """Compute explicit human-readable differences between original and revised plans."""
    deltas = []

    orig_study = [s for s in original_sessions if s.get("type") in ("study", "revision", "practice")]
    rev_study = [s for s in revised_sessions if s.get("type") in ("study", "revision", "practice")]

    completed = [s for s in revised_sessions if s.get("completed", False)]
    if completed:
        deltas.append(f"Preserved {len(completed)} previously completed study session(s).")

    orig_total = sum(int(s.get("duration_min", 0)) for s in orig_study)
    rev_total = sum(int(s.get("duration_min", 0)) for s in rev_study)

    if rev_total != orig_total:
        diff = rev_total - orig_total
        direction = "increased" if diff > 0 else "reduced"
        deltas.append(f"Total study commitment {direction} from {orig_total}m to {rev_total}m ({abs(diff):+d}m adjustment).")

    if missed_description:
        deltas.append(f"Re-balanced schedule to accommodate disruption: '{missed_description.strip()}'.")

    # Check start time changes
    if original_sessions and revised_sessions:
        if original_sessions[0].get("start") != revised_sessions[0].get("start"):
            deltas.append(f"Timetable start shifted from {original_sessions[0].get('start')} to {revised_sessions[0].get('start')}.")

    if not deltas:
        deltas.append("Re-aligned study intervals and refreshed task focus areas.")

    return deltas


def deterministic_reschedule(
    original_sessions: List[Dict[str, Any]],
    subjects_list: List[Dict[str, Any]],
    remaining_hours: float,
    missed_description: str,
    new_start_time: str = "14:00"
) -> Dict[str, Any]:
    """
    Deterministic adaptive rescheduling algorithm.
    Guarantees state preservation of completed work and reallocates the remaining window.
    """
    completed_sessions = [s for s in original_sessions if s.get("completed", False)]
    completed_minutes = sum(int(s.get("duration_min", 0)) for s in completed_sessions if s.get("type") != "break")

    # Time available for remaining sessions
    target_remaining_minutes = int(float(remaining_hours) * 60)

    # Determine remaining uncompleted subjects
    completed_subjects = {s.get("subject", "").lower() for s in completed_sessions}
    remaining_subjects = [s for s in subjects_list if s.get("subject", "").lower() not in completed_subjects]
    if not remaining_subjects:
        remaining_subjects = subjects_list

    # Generate plan for remaining hours starting from new_start_time
    remaining_plan = generate_deterministic_fallback(
        subjects_list=remaining_subjects,
        available_hours=remaining_hours,
        start_time=new_start_time,
        extra_instructions=f"Rescheduled adaptation after: {missed_description}"
    )

    # Combine completed sessions and new remaining sessions
    revised_sessions = []
    for s in completed_sessions:
        s_copy = dict(s)
        s_copy["completed"] = True
        if "id" not in s_copy or not s_copy["id"]:
            s_copy["id"] = f"sess-comp-{len(revised_sessions)+1}"
        revised_sessions.append(s_copy)

    for idx, s in enumerate(remaining_plan.get("sessions", [])):
        s_copy = dict(s)
        s_copy["completed"] = False
        s_copy["id"] = f"sess-rev-{len(revised_sessions)+1}"
        revised_sessions.append(s_copy)

    deltas = compute_schedule_deltas(original_sessions, revised_sessions, missed_description)

    return {
        "sessions": revised_sessions,
        "delta_summary": deltas,
        "assumptions": [
            f"Preserved all work previously marked as completed ({completed_minutes} minutes).",
            f"Redistributed remaining {target_remaining_minutes} study minutes beginning at {new_start_time}.",
            f"Factored in reported disruption: '{missed_description}'."
        ],
        "engine": "deterministic_rescheduler"
    }


def reschedule(
    original_schedule: Dict[str, Any],
    subjects: List[Dict[str, Any]],
    remaining_hours: float,
    missed_description: str,
    new_start_time: str = "14:00",
    use_fallback_if_offline: bool = True
) -> Dict[str, Any]:
    """
    Adaptive rescheduling engine.
    Orchestrates prompt v3 with Ollama Qwen3 8B, falling back to deterministic rescheduling if offline.
    """
    orig_sessions = original_schedule.get("sessions", []) if original_schedule else []

    # Normalize subjects
    subject_details = []
    for item in subjects:
        name = str(item.get("subject") or item.get("Subject") or "").strip()
        if not name:
            continue
        try:
            days = int(item.get("exam_in_days") if "exam_in_days" in item else item.get("Exam in days", 7))
        except (ValueError, TypeError):
            days = 7
        priority = str(item.get("priority") or item.get("Priority") or "Medium").strip()
        subject_details.append({
            "subject": name,
            "exam_in_days": days,
            "priority": priority
        })

    completed_sessions = [s for s in orig_sessions if s.get("completed", False)]
    remaining_minutes = int(float(remaining_hours) * 60)

    # Load Prompt V3 template
    meta = extract_prompt_metadata("v3")
    template = meta.get("template", "")

    prompt = template
    replacements = {
        "{original_schedule_json}": json.dumps(orig_sessions, indent=2),
        "{completed_sessions_json}": json.dumps(completed_sessions, indent=2),
        "{missed_session_description}": missed_description or "General schedule interruption",
        "{remaining_hours}": str(remaining_hours),
        "{remaining_minutes}": str(remaining_minutes),
        "{new_start_time}": str(new_start_time),
        "{subjects_json}": json.dumps(subject_details, indent=2)
    }
    for placeholder, val in replacements.items():
        prompt = prompt.replace(placeholder, val)

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are StudyFlow AI's Adaptive Rescheduling Engine. Output ONLY valid JSON matching the schema."
            },
            {"role": "user", "content": prompt}
        ],
        "format": "json",
        "stream": False,
        "think": False,
        "options": {
            "temperature": 0.2,
            "num_predict": 750
        }
    }

    try:
        response = requests.post(
            OLLAMA_URL,
            json=payload,
            timeout=180
        )
        response.raise_for_status()

        resp_data = response.json()
        content = resp_data.get("message", {}).get("content", "")
        result = clean_json_response(content)

        if "sessions" not in result or not isinstance(result["sessions"], list):
            raise ValueError("The model response did not contain a valid 'sessions' list.")

        # Ensure IDs on sessions
        for idx, s in enumerate(result["sessions"]):
            if "id" not in s or not s["id"]:
                s["id"] = f"sess-{idx+1}"

        # If model did not generate delta_summary, compute it deterministically
        if "delta_summary" not in result or not result["delta_summary"]:
            result["delta_summary"] = compute_schedule_deltas(
                orig_sessions, result["sessions"], missed_description
            )

        result["engine"] = f"ollama_{MODEL}"
        result["prompt_version"] = "V3"
        return result

    except requests.exceptions.ConnectionError:
        if use_fallback_if_offline:
            res = deterministic_reschedule(
                orig_sessions, subject_details, remaining_hours, missed_description, new_start_time
            )
            res["notice"] = "Generated via adaptive deterministic rescheduler because Ollama is unreachable."
            return res
        raise RuntimeError(f"Ollama service unreachable at {OLLAMA_URL}. Ensure Ollama is running.")

    except Exception as exc:
        if use_fallback_if_offline:
            res = deterministic_reschedule(
                orig_sessions, subject_details, remaining_hours, missed_description, new_start_time
            )
            res["notice"] = f"Adaptive fallback activated ({str(exc)})."
            return res
        raise RuntimeError(f"Rescheduling failed: {exc}")
