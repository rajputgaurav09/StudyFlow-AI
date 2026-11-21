"""
backend/app/core/validator.py — Intelligent Schedule Validator for StudyFlow AI.
Performs deterministic, rule-based verification of generated study schedules.
Independent of language models to guarantee academic constraint compliance.
"""

from datetime import datetime, time
from typing import List, Dict, Any, Optional, Set, Union


VALID_STUDY_TYPES = {"study", "revision", "practice"}
VALID_BREAK_TYPES = {"break", "rest", "pause"}
ALL_VALID_TYPES = VALID_STUDY_TYPES | VALID_BREAK_TYPES


def parse_time_str(time_val: Union[str, time]) -> Optional[datetime]:
    """Parse various time formats into a datetime object for arithmetic."""
    if isinstance(time_val, time):
        return datetime.combine(datetime.today(), time_val)
    if not isinstance(time_val, str):
        return None

    cleaned = time_val.strip().upper()
    formats = ["%H:%M", "%I:%M %p", "%I:%M%p", "%H:%M:%S"]
    for fmt in formats:
        try:
            return datetime.strptime(cleaned, fmt)
        except ValueError:
            continue
    return None


def validate_schedule(
    sessions: Any,
    available_hours: float,
    expected_subjects: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Validate a generated timetable against academic scheduling constraints.

    Constraints verified:
    1. Total study duration does not exceed available study hours.
    2. Sessions do not overlap.
    3. End time is strictly later than start time.
    4. Session duration_min strictly equals the mathematical (end - start) interval.
    5. Session type is valid ('study', 'break', 'revision', 'practice').
    6. Breaks are strictly excluded from actual study minutes.
    7. Subject names correspond to user-provided input subjects.
    8. Missing or malformed data is identified.
    9. Unused study time is surfaced as a constructive warning.
    10. Gaps between sessions are monitored.
    """
    errors: List[str] = []
    warnings: List[str] = []
    study_minutes = 0
    break_minutes = 0
    subject_breakdown: Dict[str, int] = {}
    previous_end_dt: Optional[datetime] = None

    # Normalise expected subjects if provided
    expected_set: Set[str] = set()
    if expected_subjects:
        expected_set = {str(s).strip().lower() for s in expected_subjects if str(s).strip()}

    # Base type checking
    if not isinstance(sessions, list):
        return {
            "valid": False,
            "errors": ["Schedule format error: 'sessions' must be a list."],
            "warnings": [],
            "actual_study_minutes": 0,
            "available_study_minutes": int(float(available_hours or 0) * 60),
            "break_minutes": 0,
            "session_count": 0,
            "subject_breakdown": {}
        }

    if len(sessions) == 0:
        return {
            "valid": False,
            "errors": ["Schedule is empty: no study or break sessions were generated."],
            "warnings": [],
            "actual_study_minutes": 0,
            "available_study_minutes": int(float(available_hours or 0) * 60),
            "break_minutes": 0,
            "session_count": 0,
            "subject_breakdown": {}
        }

    scheduled_subjects: Set[str] = set()

    for idx, session in enumerate(sessions, start=1):
        if not isinstance(session, dict):
            errors.append(f"Session #{idx}: Invalid structure (expected JSON dictionary).")
            continue

        # Extract fields
        start_raw = session.get("start")
        end_raw = session.get("end")
        duration_raw = session.get("duration_min")
        raw_type = session.get("type", "study")
        subject_raw = session.get("subject", "")
        task_raw = session.get("task", "")

        # 1. Type validation
        session_type = str(raw_type).strip().lower()
        if session_type not in ALL_VALID_TYPES:
            errors.append(
                f"Session #{idx} ('{subject_raw}'): Invalid type '{raw_type}'. "
                f"Allowed types: study, revision, practice, break."
            )
            continue

        # 2. Time parsing
        start_dt = parse_time_str(start_raw)
        end_dt = parse_time_str(end_raw)

        if not start_dt or not end_dt:
            errors.append(
                f"Session #{idx}: Malformed time string (start: '{start_raw}', end: '{end_raw}'). "
                "Expected HH:MM (24-hour) format."
            )
            continue

        # 3. Chronological validity
        if end_dt <= start_dt:
            errors.append(
                f"Session #{idx} ('{subject_raw}'): End time ({end_raw}) must be later than start time ({start_raw})."
            )
            continue

        # 4. Duration calculation and verification
        expected_duration = int((end_dt - start_dt).total_seconds() / 60)
        try:
            declared_duration = int(duration_raw)
        except (ValueError, TypeError):
            errors.append(
                f"Session #{idx}: 'duration_min' must be an integer, got '{duration_raw}'."
            )
            declared_duration = expected_duration

        if declared_duration != expected_duration:
            errors.append(
                f"Session #{idx} ('{subject_raw}'): Duration mismatch. "
                f"Declared {declared_duration} min, but {start_raw} to {end_raw} is {expected_duration} min."
            )

        # 5. Overlap detection
        if previous_end_dt:
            if start_dt < previous_end_dt:
                overlap_mins = int((previous_end_dt - start_dt).total_seconds() / 60)
                errors.append(
                    f"Session #{idx} ('{subject_raw}') starts at {start_raw}, overlapping prior session "
                    f"which ends at {previous_end_dt.strftime('%H:%M')} by {overlap_mins} minute(s)."
                )
            elif start_dt > previous_end_dt:
                gap_mins = int((start_dt - previous_end_dt).total_seconds() / 60)
                if gap_mins > 60:
                    warnings.append(
                        f"Unscheduled gap of {gap_mins} minutes before session #{idx} ({previous_end_dt.strftime('%H:%M')} to {start_raw})."
                    )

        previous_end_dt = end_dt

        # 6. Break vs Study accounting
        if session_type in VALID_BREAK_TYPES:
            break_minutes += expected_duration
        else:
            study_minutes += expected_duration
            subj_name = str(subject_raw).strip() or "General Study"
            subject_breakdown[subj_name] = subject_breakdown.get(subj_name, 0) + expected_duration
            scheduled_subjects.add(subj_name.lower())

            # Subject correspondence check (Constraint 7)
            if expected_set and subj_name.lower() not in expected_set:
                warnings.append(
                    f"Session #{idx}: Subject '{subj_name}' was not in your original subject list."
                )

        # Task quality check
        if session_type in VALID_STUDY_TYPES and (not task_raw or len(str(task_raw).strip()) < 5):
            warnings.append(
                f"Session #{idx} ('{subject_raw}'): Task description is vague or missing. Specific tasks improve study effectiveness."
            )

    # 7. Total study hours check (Constraint 1)
    try:
        available_limit_minutes = int(float(available_hours) * 60)
    except (ValueError, TypeError):
        available_limit_minutes = 240

    if study_minutes > available_limit_minutes:
        exceeded = study_minutes - available_limit_minutes
        errors.append(
            f"Total study duration ({study_minutes} min / {study_minutes/60:.1f}h) exceeds your "
            f"available limit ({available_limit_minutes} min / {available_hours}h) by {exceeded} minute(s)."
        )

    # 8. Unused study capacity warning
    elif available_limit_minutes > 0 and study_minutes < (available_limit_minutes * 0.65):
        underused = available_limit_minutes - study_minutes
        warnings.append(
            f"Underutilized capacity: Planned study time ({study_minutes}m) leaves "
            f"{underused} minutes ({underused/60:.1f}h) of available study time unassigned."
        )

    # 9. Verify all input subjects received scheduled time
    if expected_set:
        missing_subjects = [s for s in expected_set if s not in scheduled_subjects]
        if missing_subjects:
            warnings.append(
                f"Unscheduled subjects: {', '.join(s.title() for s in missing_subjects)} did not receive any study sessions."
            )

    # 10. Check break presence for long plans
    if study_minutes >= 120 and break_minutes == 0:
        warnings.append(
            "No breaks scheduled: Incorporating short 10-15 minute breaks prevents cognitive fatigue during multi-hour sessions."
        )

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "actual_study_minutes": study_minutes,
        "available_study_minutes": available_limit_minutes,
        "break_minutes": break_minutes,
        "session_count": len(sessions),
        "subject_breakdown": subject_breakdown
    }
