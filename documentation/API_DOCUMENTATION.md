# StudyFlow AI — REST API Documentation

> **Registered Academic Project**  
> **Course**: Prompt Engineering  
> **Team**: Innovex | **Team ID**: PE-B25-52 | **Problem Pool**: C20  
> **Backend Framework**: Python FastAPI + Pydantic v2 + Uvicorn

The StudyFlow AI backend exposes documented, type-validated REST endpoints for schedule synthesis, deterministic constraint validation, adaptive disruption rescheduling, session state tracking, prompt benchmarking, and file exports.

---

## Base URL & Interactive Docs
- Base URL: `http://localhost:8000`
- Swagger UI Documentation: `http://localhost:8000/docs`
- ReDoc Documentation: `http://localhost:8000/redoc`

---

## 1. System Health & Ollama Probe

### `GET /api/health`
Checks backend status, Ollama service availability, installed LLM models, and active plan state.

**Response `200 OK`**:
```json
{
  "status": "healthy",
  "ollama_online": true,
  "has_qwen3": true,
  "models": ["qwen3:8b"],
  "active_plan_available": true,
  "current_session_count": 5
}
```

---

## 2. Study Plan Synthesis

### `POST /api/plan/generate`
Generates a structured daily timetable using local Qwen3 8B or local deterministic fallback.

**Request Body**:
```json
{
  "subjects": [
    { "subject": "Automata Theory", "exam_in_days": 3, "priority": "High" },
    { "subject": "C Programming", "exam_in_days": 5, "priority": "Medium" },
    { "subject": "AI/ML Systems", "exam_in_days": 7, "priority": "Medium" }
  ],
  "available_hours": 4.0,
  "start_time": "09:00",
  "break_duration": 15,
  "extra_instructions": "Prioritize DFA problems",
  "prompt_version": "V2"
}
```

**Response `200 OK`**:
```json
{
  "sessions": [
    {
      "id": "sess-1",
      "start": "09:00",
      "end": "10:30",
      "subject": "Automata Theory",
      "task": "Construct DFA, NFA conversion, and solve regular expression minimization problems",
      "type": "revision",
      "duration_min": 90,
      "completed": false
    },
    {
      "id": "sess-2",
      "start": "10:30",
      "end": "10:45",
      "subject": "Rest & Hydration",
      "task": "Step away from screen, hydrate, and brief cognitive rest",
      "type": "break",
      "duration_min": 15,
      "completed": false
    }
  ],
  "assumptions": ["Allocated 90m primary focus block to Automata Theory"],
  "engine": "ollama_qwen3:8b",
  "prompt_version": "V2",
  "notice": null,
  "validation": {
    "valid": true,
    "errors": [],
    "warnings": [],
    "actual_study_minutes": 240,
    "available_study_minutes": 240,
    "break_minutes": 30,
    "session_count": 5,
    "subject_breakdown": {
      "Automata Theory": 90,
      "C Programming": 75,
      "AI/ML Systems": 75
    }
  }
}
```

---

## 3. Independent Schedule Validator

### `POST /api/plan/validate`
Validates any timetable against the 8 academic scheduling constraints.

**Request Body**:
```json
{
  "sessions": [
    {
      "id": "1",
      "start": "09:00",
      "end": "10:30",
      "subject": "Math",
      "task": "Calculus derivatives",
      "type": "study",
      "duration_min": 90
    }
  ],
  "available_hours": 2.0,
  "expected_subjects": ["Math"]
}
```

**Response `200 OK`**:
```json
{
  "valid": true,
  "errors": [],
  "warnings": [],
  "actual_study_minutes": 90,
  "available_study_minutes": 120,
  "break_minutes": 0,
  "session_count": 1,
  "subject_breakdown": { "Math": 90 }
}
```

---

## 4. Active Plan Management

### `GET /api/plan/current`
Returns the currently active timetable, subjects, availability budget, and mathematical validation state.

### `PATCH /api/sessions/{session_id}`
Updates completion state of a specific session.
```json
{
  "completed": true
}
```

---

## 5. Adaptive Rescheduling

### `POST /api/plan/reschedule`
Adaptively recalculates remaining study intervals after missed sessions or altered availability, guaranteeing 100% preservation of completed sessions.

**Request Body**:
```json
{
  "subjects": [
    { "subject": "Automata Theory", "exam_in_days": 3, "priority": "High" },
    { "subject": "C Programming", "exam_in_days": 5, "priority": "Medium" }
  ],
  "remaining_hours": 2.5,
  "missed_description": "Delayed by doctor appointment",
  "new_start_time": "14:00"
}
```

**Response `200 OK`**:
```json
{
  "sessions": [...],
  "delta_summary": [
    "Preserved 1 previously completed study session(s).",
    "Total study commitment reduced from 240m to 150m (-90m adjustment).",
    "Re-balanced schedule to accommodate disruption: 'Delayed by doctor appointment'.",
    "Timetable start shifted from 09:00 to 14:00."
  ],
  "assumptions": [...],
  "engine": "ollama_qwen3:8b",
  "validation": { "valid": true, "errors": [], "warnings": [] }
}
```

---

## 6. Prompt Engineering Lab

### `GET /api/prompts`
Returns version metadata, evolution notes, expected output schema, and raw templates for V1, V2, and V3.

### `POST /api/prompts/test`
Runs a live benchmark test for a given prompt version, returning the formatted prompt, raw model response, parsed JSON, validation result, and genuine latency in milliseconds.

---

## 7. Timetable Exports

### `GET /api/export/json`
Returns full structured timetable and academic project metadata as a JSON file download.

### `GET /api/export/markdown`
Returns clean Markdown-formatted study timetable with GFM table format.

### `GET /api/presets`
Returns predefined evaluation scenarios (Three-Subject Crunch, Urgent Single Exam, Multiple Back-to-Back Exams).
