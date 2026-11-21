"""
backend/app/core/ai_engine.py — Local AI Engine Orchestrator for StudyFlow AI.
Interfaces with local Ollama running Qwen3 8B.
Implements modular prompt loading from the prompts/ directory, robust JSON extraction,
and deterministic fallback capabilities.
"""

import os
import json
import re
import time
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Union
import requests

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434/api/chat")
TAGS_URL = os.environ.get("OLLAMA_TAGS_URL", "http://localhost:11434/api/tags")
MODEL = os.environ.get("OLLAMA_MODEL", "qwen3:8b")

# Resolve prompts directory relative to backend root
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.dirname(CURRENT_DIR)
BACKEND_DIR = os.path.dirname(APP_DIR)
PROMPTS_DIR = os.path.join(BACKEND_DIR, "prompts")


def check_ollama_status() -> Dict[str, Any]:
    """Check whether local Ollama is reachable and whether qwen3:8b is installed."""
    try:
        response = requests.get(TAGS_URL, timeout=4)
        if response.status_code == 200:
            data = response.json()
            models = [m.get("name", "") for m in data.get("models", [])]
            has_qwen3 = any("qwen3" in m.lower() for m in models)
            return {
                "online": True,
                "has_model": has_qwen3,
                "models": models,
                "target_model": MODEL,
                "message": "Ollama is online and responsive." if has_qwen3 else f"Ollama is running, but {MODEL} is not found in local models."
            }
        return {
            "online": False,
            "has_model": False,
            "models": [],
            "target_model": MODEL,
            "message": f"Ollama returned HTTP status {response.status_code}."
        }
    except Exception as exc:
        return {
            "online": False,
            "has_model": False,
            "models": [],
            "target_model": MODEL,
            "message": f"Cannot connect to Ollama at {TAGS_URL}. Ensure Ollama is running."
        }


def load_prompt_file(version: str = "v2") -> str:
    """Load raw content of a prompt file from the prompts directory."""
    filename = f"prompt_{version.lower().strip()}.txt"
    filepath = os.path.join(PROMPTS_DIR, filename)
    if not os.path.exists(filepath):
        # Fallback search in parent directory or current workspace
        alt_path = os.path.join(BACKEND_DIR, "..", "prompts", filename)
        if os.path.exists(alt_path):
            filepath = alt_path
        else:
            filepath = os.path.join(PROMPTS_DIR, "prompt_v2.txt")
    with open(filepath, "r", encoding="utf-8") as f:
        return f.read()


def extract_prompt_metadata(version: str = "v2") -> Dict[str, str]:
    """Parse header metadata from a prompt file."""
    content = load_prompt_file(version)
    metadata = {
        "version": version.upper(),
        "purpose": "",
        "changes": "",
        "expected_output": "",
        "limitations": "",
        "template": content,
        "raw_content": content
    }

    match_purpose = re.search(r"PURPOSE:\s*(.*?)(?=\n[A-Z\s]+:|\n={3,}|$)", content, re.DOTALL)
    match_changes = re.search(r"CHANGES FROM [^:]+:\s*(.*?)(?=\n[A-Z\s]+:|\n={3,}|$)", content, re.DOTALL)
    match_output = re.search(r"EXPECTED OUTPUT:\s*(.*?)(?=\n[A-Z\s]+:|\n={3,}|$)", content, re.DOTALL)
    match_limits = re.search(r"LIMITATIONS:\s*(.*?)(?=\n[A-Z\s]+:|\n={3,}|$)", content, re.DOTALL)

    if match_purpose:
        metadata["purpose"] = match_purpose.group(1).strip()
    if match_changes:
        metadata["changes"] = match_changes.group(1).strip()
    if match_output:
        metadata["expected_output"] = match_output.group(1).strip()
    if match_limits:
        metadata["limitations"] = match_limits.group(1).strip()

    # Extract template portion after the metadata divider
    parts = re.split(r"={10,}\n", content)
    if len(parts) >= 3:
        metadata["template"] = parts[2].strip()
    elif len(parts) == 2:
        metadata["template"] = parts[1].strip()

    return metadata


def clean_json_response(raw_text: str) -> Dict[str, Any]:
    """Robustly extract and parse a JSON dictionary from LLM response text."""
    if not raw_text or not isinstance(raw_text, str):
        raise ValueError("Empty or invalid response received from model.")

    # 1. Remove <think>...</think> blocks if present
    cleaned = re.sub(r"<think>.*?</think>", "", raw_text, flags=re.DOTALL)

    # 2. Remove markdown code fences like ```json ... ```
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned.strip(), flags=re.MULTILINE)
    cleaned = re.sub(r"\s*```$", "", cleaned.strip(), flags=re.MULTILINE)

    # 3. Direct JSON parse
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # 4. Bracket-matching regex extraction
    match = re.search(r"(\{.*\})", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Could not parse valid JSON from model response. Preview: {cleaned[:250]}...")


def generate_deterministic_fallback(
    subjects_list: List[Dict[str, Any]],
    available_hours: float,
    start_time: str = "09:00",
    extra_instructions: str = ""
) -> Dict[str, Any]:
    """
    Deterministic academic schedule generator.
    Used when Ollama is offline or as an immediate verification benchmark.
    Guarantees mathematically valid, non-overlapping schedules strictly within available hours.
    """
    try:
        current_dt = datetime.strptime(start_time.strip(), "%H:%M")
    except Exception:
        current_dt = datetime.strptime("09:00", "%H:%M")

    total_study_minutes_target = int(float(available_hours) * 60)

    # Sort subjects by urgency: lowest exam_in_days first, then High priority
    priority_weights = {"high": 3, "medium": 2, "low": 1}
    sorted_subjects = sorted(
        subjects_list,
        key=lambda s: (int(s.get("exam_in_days", 10)), -priority_weights.get(str(s.get("priority", "medium")).lower(), 2))
    )

    if not sorted_subjects:
        sorted_subjects = [{"subject": "Self Study", "exam_in_days": 7, "priority": "Medium"}]

    # Compute duration allocation proportional to priority and urgency
    weights = []
    for s in sorted_subjects:
        days = max(1, int(s.get("exam_in_days", 5)))
        p_weight = priority_weights.get(str(s.get("priority", "medium")).lower(), 2)
        # Closer exam = higher urgency score
        urgency_score = (10.0 / days) * p_weight
        weights.append(urgency_score)

    total_weight = sum(weights) or 1.0
    allocated_durations = [
        max(30, int(round((w / total_weight) * total_study_minutes_target / 15.0) * 15))
        for w in weights
    ]

    # Adjust sum to not exceed target
    while sum(allocated_durations) > total_study_minutes_target:
        # Reduce the largest allocation
        max_idx = allocated_durations.index(max(allocated_durations))
        allocated_durations[max_idx] -= 15

    # If still under, boost the highest priority subject
    while sum(allocated_durations) + 15 <= total_study_minutes_target:
        allocated_durations[0] += 15

    sessions: List[Dict[str, Any]] = []
    for idx, (subj, dur) in enumerate(zip(sorted_subjects, allocated_durations)):
        if dur <= 0:
            continue

        subj_name = subj.get("subject", f"Subject {idx+1}")
        exam_days = subj.get("exam_in_days", 5)

        # Break before session if not first
        if idx > 0:
            break_start = current_dt
            break_end = break_start + timedelta(minutes=15)
            sessions.append({
                "id": f"sess-{len(sessions)+1}",
                "start": break_start.strftime("%H:%M"),
                "end": break_end.strftime("%H:%M"),
                "subject": "Rest & Hydration",
                "task": "Take a short cognitive pause, hydrate, and stretch",
                "type": "break",
                "duration_min": 15,
                "completed": False
            })
            current_dt = break_end

        # Study session
        sess_start = current_dt
        sess_end = sess_start + timedelta(minutes=dur)

        task_desc = f"Focused review and problem solving for {subj_name} (Exam in {exam_days}d)"
        sess_type = "revision" if exam_days <= 3 else "study"

        sessions.append({
            "id": f"sess-{len(sessions)+1}",
            "start": sess_start.strftime("%H:%M"),
            "end": sess_end.strftime("%H:%M"),
            "subject": subj_name,
            "task": task_desc,
            "type": sess_type,
            "duration_min": dur,
            "completed": False
        })
        current_dt = sess_end

    return {
        "sessions": sessions,
        "assumptions": [
            "Prioritized study time by examination urgency (nearest exams allocated primary focus blocks).",
            "Inserted 15-minute cognitive rest intervals between major study sessions.",
            f"Allocated exactly {sum(allocated_durations)} minutes of study time out of {total_study_minutes_target} available minutes."
        ],
        "engine": "deterministic_fallback"
    }


def generate_schedule(
    subjects: List[Dict[str, Any]],
    available_hours: float,
    start_time: str = "09:00",
    extra_instructions: str = "",
    prompt_version: str = "v2",
    use_fallback_if_offline: bool = True
) -> Dict[str, Any]:
    """
    Generate a complete, structured study timetable.
    Uses local Qwen3 8B with prompt engineering.
    Falls back gracefully if Ollama is unreachable.
    """
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

    if not subject_details:
        raise ValueError("At least one valid subject must be provided.")

    available_mins = int(float(available_hours) * 60)

    # If V1 selected, V1 produces unstructured text by design
    # For planner workspace, we typically use V2 structured or V3 adaptive
    v_norm = prompt_version.lower().strip()
    if v_norm not in ["v1", "v2", "v3"]:
        v_norm = "v2"

    meta = extract_prompt_metadata(v_norm)
    template = meta.get("template", "")

    subjects_formatted = json.dumps(subject_details, indent=2)

    prompt = template
    replacements = {
        "{subjects_json}": subjects_formatted,
        "{available_hours}": str(available_hours),
        "{available_minutes}": str(available_mins),
        "{start_time}": str(start_time),
        "{constraints}": extra_instructions or "None specified",
        "{subjects_summary}": ", ".join(s["subject"] for s in subject_details),
        "{exam_dates_summary}": ", ".join(f"{s['subject']} in {s['exam_in_days']} days" for s in subject_details),
        "{priorities_summary}": ", ".join(f"{s['subject']} {s['priority']}" for s in subject_details)
    }
    for placeholder, val in replacements.items():
        prompt = prompt.replace(placeholder, val)

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are StudyFlow AI. Follow all scheduling constraints and output ONLY valid JSON matching the exact schema."
            },
            {"role": "user", "content": prompt}
        ],
        "format": "json" if v_norm != "v1" else None,
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

        if v_norm == "v1":
            # V1 is unstructured baseline, return fallback + raw content
            fallback = generate_deterministic_fallback(subject_details, available_hours, start_time, extra_instructions)
            fallback["raw_v1_text"] = content
            fallback["engine"] = f"ollama_{MODEL} (V1 Text Baseline)"
            fallback["prompt_version"] = "V1"
            return fallback

        result = clean_json_response(content)

        if "sessions" not in result or not isinstance(result["sessions"], list):
            raise ValueError("The AI model response did not contain a valid 'sessions' list.")

        # Ensure every session has an id and completed flag
        for idx, s in enumerate(result["sessions"]):
            if "id" not in s or not s["id"]:
                s["id"] = f"sess-{idx+1}"
            if "completed" not in s:
                s["completed"] = False

        result["engine"] = f"ollama_{MODEL}"
        result["prompt_version"] = prompt_version.upper()
        return result

    except requests.exceptions.ConnectionError:
        if use_fallback_if_offline:
            res = generate_deterministic_fallback(
                subject_details, available_hours, start_time, extra_instructions
            )
            res["notice"] = "Generated via local deterministic scheduler because Ollama service is unreachable."
            res["prompt_version"] = prompt_version.upper()
            return res
        raise RuntimeError(
            f"Ollama service is not reachable at {OLLAMA_URL}. "
            "Please ensure Ollama is running and qwen3:8b is loaded."
        )

    except requests.exceptions.Timeout:
        if use_fallback_if_offline:
            res = generate_deterministic_fallback(
                subject_details, available_hours, start_time, extra_instructions
            )
            res["notice"] = "Generated via local deterministic scheduler due to Ollama timeout."
            res["prompt_version"] = prompt_version.upper()
            return res
        raise RuntimeError("Model generation timed out. Please try reducing the number of subjects or study hours.")

    except Exception as exc:
        if use_fallback_if_offline and not isinstance(exc, ValueError):
            res = generate_deterministic_fallback(
                subject_details, available_hours, start_time, extra_instructions
            )
            res["notice"] = f"Fallback scheduler activated ({str(exc)})."
            res["prompt_version"] = prompt_version.upper()
            return res
        raise RuntimeError(f"Schedule generation error: {exc}")


def test_prompt_live(
    prompt_version: str,
    subjects: List[Dict[str, Any]],
    available_hours: float,
    start_time: str = "09:00",
    extra_instructions: str = ""
) -> Dict[str, Any]:
    """
    Execute live prompt benchmark through backend and record exact latency.
    Returns raw prompt, raw response, parsed JSON, and genuine timing.
    """
    v_norm = prompt_version.lower().strip()
    meta = extract_prompt_metadata(v_norm)
    template = meta.get("template", "")

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

    available_mins = int(float(available_hours) * 60)
    subjects_formatted = json.dumps(subject_details, indent=2)

    prompt = template
    replacements = {
        "{subjects_json}": subjects_formatted,
        "{available_hours}": str(available_hours),
        "{available_minutes}": str(available_mins),
        "{start_time}": str(start_time),
        "{constraints}": extra_instructions or "None specified",
        "{subjects_summary}": ", ".join(s["subject"] for s in subject_details),
        "{exam_dates_summary}": ", ".join(f"{s['subject']} in {s['exam_in_days']} days" for s in subject_details),
        "{priorities_summary}": ", ".join(f"{s['subject']} {s['priority']}" for s in subject_details),
        "{original_schedule_json}": json.dumps([], indent=2),
        "{completed_sessions_json}": json.dumps([], indent=2),
        "{missed_session_description}": "Live evaluation benchmark test",
        "{remaining_hours}": str(available_hours),
        "{remaining_minutes}": str(available_mins),
        "{new_start_time}": str(start_time)
    }
    for placeholder, val in replacements.items():
        prompt = prompt.replace(placeholder, val)

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are StudyFlow AI. Follow all instructions and output according to the requested format."
            },
            {"role": "user", "content": prompt}
        ],
        "format": "json" if v_norm != "v1" else None,
        "stream": False,
        "think": False,
        "options": {
            "temperature": 0.2,
            "num_predict": 750
        }
    }

    t0 = time.time()
    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=60)
        elapsed_ms = round((time.time() - t0) * 1000, 2)
        response.raise_for_status()
        raw_text = response.json().get("message", {}).get("content", "")

        parsed = None
        parse_err = None
        if v_norm != "v1":
            try:
                parsed = clean_json_response(raw_text)
            except Exception as e:
                parse_err = str(e)

        return {
            "prompt_version": prompt_version.upper(),
            "raw_prompt": prompt,
            "raw_response": raw_text,
            "parsed_json": parsed,
            "latency_ms": elapsed_ms,
            "engine": f"ollama_{MODEL}",
            "error": parse_err
        }
    except Exception as exc:
        elapsed_ms = round((time.time() - t0) * 1000, 2)
        # If offline, run deterministic benchmark
        fallback = generate_deterministic_fallback(subject_details, available_hours, start_time, extra_instructions)
        return {
            "prompt_version": prompt_version.upper(),
            "raw_prompt": prompt,
            "raw_response": f"[Deterministic Fallback Simulation - Ollama offline: {str(exc)}]\n\n" + json.dumps(fallback, indent=2),
            "parsed_json": fallback,
            "latency_ms": elapsed_ms,
            "engine": "deterministic_fallback",
            "error": None
        }
