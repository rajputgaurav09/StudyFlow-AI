"""
backend/app/models/schemas.py — Pydantic schemas for request and response validation.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class SubjectItem(BaseModel):
    subject: str = Field(..., min_length=1, description="Subject or course name")
    exam_in_days: int = Field(..., ge=1, le=365, description="Days remaining until the examination")
    priority: str = Field(default="Medium", description="Subject priority: High, Medium, or Low")


class SessionItem(BaseModel):
    id: str = Field(..., description="Unique session identifier")
    start: str = Field(..., description="Start time in 24-hour HH:MM format")
    end: str = Field(..., description="End time in 24-hour HH:MM format")
    subject: str = Field(..., description="Subject name or break label")
    task: str = Field(..., description="Actionable micro-task description")
    type: str = Field(..., description="Session type: study, revision, practice, or break")
    duration_min: int = Field(..., gt=0, description="Session duration in minutes")
    completed: bool = Field(default=False, description="Completion checkbox state")


class GeneratePlanRequest(BaseModel):
    subjects: List[SubjectItem] = Field(..., min_length=1, description="List of academic subjects")
    available_hours: float = Field(default=4.0, gt=0, le=24, description="Daily available study hours")
    start_time: str = Field(default="09:00", description="Preferred study start time in HH:MM format")
    break_duration: int = Field(default=15, ge=5, le=60, description="Break duration in minutes")
    extra_instructions: Optional[str] = Field(default="", description="Additional constraints or focus areas")
    prompt_version: str = Field(default="V2", description="Prompt version: V1, V2, or V3")


class GeneratePlanResponse(BaseModel):
    sessions: List[SessionItem]
    assumptions: List[str] = []
    engine: str
    prompt_version: str
    notice: Optional[str] = None
    validation: Dict[str, Any]


class ValidatePlanRequest(BaseModel):
    sessions: List[SessionItem]
    available_hours: float = Field(..., gt=0, le=24)
    expected_subjects: Optional[List[str]] = None


class ValidatePlanResponse(BaseModel):
    valid: bool
    errors: List[str] = []
    warnings: List[str] = []
    actual_study_minutes: int
    available_study_minutes: int
    break_minutes: int
    session_count: int
    subject_breakdown: Dict[str, int] = {}


class RescheduleRequest(BaseModel):
    original_schedule: Optional[Dict[str, Any]] = None
    subjects: List[SubjectItem]
    remaining_hours: float = Field(..., gt=0, le=24)
    missed_description: str = Field(..., min_length=2)
    new_start_time: str = Field(default="14:00")


class RescheduleResponse(BaseModel):
    sessions: List[SessionItem]
    delta_summary: List[str]
    assumptions: List[str] = []
    engine: str
    notice: Optional[str] = None
    validation: Dict[str, Any]


class UpdateSessionRequest(BaseModel):
    completed: bool


class PromptTestRequest(BaseModel):
    prompt_version: str = Field(default="V2")
    subjects: List[SubjectItem]
    available_hours: float = Field(default=4.0, gt=0)
    start_time: str = Field(default="09:00")
    extra_instructions: Optional[str] = ""


class PromptTestResponse(BaseModel):
    prompt_version: str
    raw_prompt: str
    raw_response: str
    parsed_json: Optional[Dict[str, Any]] = None
    validation: Optional[Dict[str, Any]] = None
    latency_ms: float
    engine: str
    error: Optional[str] = None


class PromptMetadataItem(BaseModel):
    version: str
    purpose: str
    changes: str
    expected_output: str
    limitations: str
    template: str
    raw_content: str


class HealthResponse(BaseModel):
    status: str
    ollama_online: bool
    has_qwen3: bool
    models: List[str]
    active_plan_available: bool
    current_session_count: int


class PresetItem(BaseModel):
    id: str
    title: str
    description: str
    subjects: List[SubjectItem]
    available_hours: float
    start_time: str
