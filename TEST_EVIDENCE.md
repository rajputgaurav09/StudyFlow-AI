# StudyFlow AI — Academic Test Evidence & Verification Record

> **Registered Academic Project**  
> **Course**: Prompt Engineering  
> **Team**: Innovex | **Team ID**: PE-B25-52 | **Problem Pool**: C20  
> **Product Name**: StudyFlow AI  
> **Team Leader**: Gaurav Singh (S24CSEU0790)  
> **Team Member**: Adarsh Dubey (S24CSEU1579)  
> **Execution Environment**: Windows 11 &bull; Python 3.13.17 &bull; Node.js v24.22.0 &bull; Local Ollama 0.40+ (Qwen3 8B)

---

## 1. Test Suite Summary Table

| Test Suite | File / Runner | Tests Executed | Tests Passed | Tests Failed | Execution Time | Pass Rate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Mandatory Compliance Scenarios** | `backend/tests/test_suite.py` | 10 | 10 | 0 | 0.08s | **100%** |
| **Schedule Validator Unit Tests** | `backend/tests/test_validator.py` | 10 | 10 | 0 | 0.003s | **100%** |
| **Adaptive Rescheduler Unit Tests**| `backend/tests/test_rescheduler.py` | 4 | 4 | 0 | 0.002s | **100%** |
| **FastAPI REST Integration Tests** | `backend/tests/test_api.py` | 11 | 11 | 0 | 221.64s* | **100%** |
| **Frontend React Interaction Tests**| `frontend/src/__tests__/*.test.tsx`| 8 | 8 | 0 | 2.31s | **100%** |
| **Total Comprehensive Verification**| **All Suites** | **43** | **43** | **0** | **224.03s** | **100%** |

*\*Note: `test_api.py` execution time includes live Qwen3 8B CPU inference queries for study plan generation and adaptive rescheduling.*

---

## 2. The 10 Mandatory Academic Compliance Scenarios

### Scenario 1: Normal Three-Subject Study Plan
- **Test File**: `backend/tests/test_suite.py::run_all_scenarios (Scenario 1)`
- **Input**:
  - Subjects: Automata Theory (3 days, High), C Programming (5 days, Medium), AI/ML (7 days, Medium)
  - Daily Budget: 4.0 hours (240 minutes) | Start Time: 09:00
- **Expected Output**:
  - Non-overlapping schedule; total study minutes &le; 240m; all 3 subjects scheduled; cognitive breaks inserted.
- **Actual Output**:
  - Generated 5 sessions (3 study blocks, 2 break intervals). Total study minutes = 240m / 240m. All subjects received allocated time. `valid: True`.
- **Status**: **PASS**
- **Remarks**: Deterministic duration allocation matches budget boundary with zero remaining unassigned capacity.

---

### Scenario 2: One High-Priority Examination Approaching
- **Test File**: `backend/tests/test_suite.py::run_all_scenarios (Scenario 2)`
- **Input**:
  - Subjects: Operating Systems (1 day, High), Web Tech (12 days, Low)
  - Daily Budget: 3.5 hours (210 minutes) | Start Time: 08:30
- **Expected Output**:
  - Urgent subject (Operating Systems) receives significantly greater study duration than distant subject (Web Tech).
- **Actual Output**:
  - Operating Systems allocated 180 minutes; Web Tech allocated 30 minutes. Total study time = 210m. `valid: True`.
- **Status**: **PASS**
- **Remarks**: Proportional urgency weighting verified. High-priority subject received 85.7% of total daily study budget.

---

### Scenario 3: Multiple Examinations on Nearby Dates
- **Test File**: `backend/tests/test_suite.py::run_all_scenarios (Scenario 3)`
- **Input**:
  - Subjects: Discrete Mathematics (2 days, High), Computer Networks (3 days, High), Database Management (4 days, High)
  - Daily Budget: 5.0 hours (300 minutes) | Start Time: 08:00
- **Expected Output**:
  - All 3 urgent subjects receive study blocks; non-overlapping; breaks inserted.
- **Actual Output**:
  - Balanced allocation across all 3 urgent subjects: Discrete Math 105m, Computer Networks 105m, DBMS 90m. Total study time = 300m, Breaks = 30m. `valid: True`.
- **Status**: **PASS**
- **Remarks**: Multi-exam collision handled with balanced time distribution.

---

### Scenario 4: Four-Hour Daily Limit Strictly Enforced
- **Test File**: `backend/tests/test_suite.py::run_all_scenarios (Scenario 4)`
- **Input**:
  - Subjects: Linear Algebra (4 days, High), Software Engg (6 days, Medium)
  - Daily Budget: 4.0 hours (240 minutes)
- **Expected Output**:
  - `actual_study_minutes <= 240`. Breaks strictly excluded from study budget.
- **Actual Output**:
  - Actual study minutes = 240m &le; 240m limit. Cognitive break minutes = 15m. `valid: True`.
- **Status**: **PASS**
- **Remarks**: Constraint 1 verified. Cognitive breaks do not count toward student study capacity.

---

### Scenario 5: Insufficient Available Time (1.0 Hour for 3 Subjects)
- **Test File**: `backend/tests/test_suite.py::run_all_scenarios (Scenario 5)`
- **Input**:
  - Subjects: Data Structures (2 days, High), Algorithms (4 days, High), Computer Architecture (5 days, Medium)
  - Daily Budget: 1.0 hour (60 minutes) | Start Time: 18:00
- **Expected Output**:
  - Compression into the 60-minute window without exceeding limit or producing zero-length sessions.
- **Actual Output**:
  - Plan compressed into 60 study minutes. `actual_study_minutes == 60 <= 60`. `valid: True`.
- **Status**: **PASS**
- **Remarks**: Handles constrained study windows gracefully through proportional micro-block allocation.

---

### Scenario 6: Overlapping AI-Generated Sessions Detection
- **Test File**: `backend/tests/test_suite.py::run_all_scenarios (Scenario 6)`
- **Input**:
  - Injected overlapping schedule:
    - Session 1: Math (09:00–10:30, 90m)
    - Session 2: Physics (10:00–11:15, 75m) [Overlaps Session 1 by 30 mins]
- **Expected Output**:
  - `valid: False`; explicit error message containing "overlapping" and identifying the 30-minute collision.
- **Actual Output**:
  - Flagged error: `"Session #2 ('Physics') starts at 10:00, overlapping prior session which ends at 10:30 by 30 minute(s)."`. `valid: False`.
- **Status**: **PASS**
- **Remarks**: Deterministic rule-based validator caught overlap without relying on LLM self-evaluation.

---

### Scenario 7: Invalid Time Intervals & Duration Mismatch
- **Test File**: `backend/tests/test_suite.py::run_all_scenarios (Scenario 7)`
- **Input**:
  - Injected malformed intervals:
    - Session 1: Chemistry (Start 11:00, End 10:00, 60m) [End earlier than start]
    - Session 2: Biology (Start 11:15, End 12:15, Declared 90m) [Interval is 60m, declared is 90m]
- **Expected Output**:
  - `valid: False`; both errors flagged explicitly.
- **Actual Output**:
  - Errors:
    1. `"Session #1 ('Chemistry'): End time (10:00) must be later than start time (11:00)."`
    2. `"Session #2 ('Biology'): Duration mismatch. Declared 90 min, but 11:15 to 12:15 is 60 min."`
- **Status**: **PASS**
- **Remarks**: Time arithmetic verified. Catches backward time travel and arithmetic hallucinations.

---

### Scenario 8: Missed Study Session Rescheduling
- **Test File**: `backend/tests/test_suite.py::run_all_scenarios (Scenario 8)`
- **Input**:
  - Original 3-session plan where morning session was missed. Disruption: "Missed Automata Theory due to morning delay". Remaining budget: 3.0h starting at 13:00.
- **Expected Output**:
  - Rescheduled sessions starting sequentially at 13:00; delta summary produced; schedule passes validation.
- **Actual Output**:
  - Rescheduled 5 sessions starting at 13:00. Delta summary: `"Total study commitment increased from 120m to 180m (+60m adjustment)."`. `valid: True`.
- **Status**: **PASS**
- **Remarks**: Recalculates remaining intervals from the resumption timestamp without temporal gaps.

---

### Scenario 9: Reduced Availability with Completed-Session Preservation
- **Test File**: `backend/tests/test_suite.py::run_all_scenarios (Scenario 9)`
- **Input**:
  - Original plan with 2 completed sessions (Automata Theory 75m, Break 15m) and 1 pending session (C Programming 90m). Disruption: "Afternoon commitment reduced window to 1.5h". Resumption: 15:00.
- **Expected Output**:
  - Completed sessions preserved 100% intact. Remaining study allocated within 1.5h.
- **Actual Output**:
  - Preserved both completed sessions (`completed: True`, start 09:00). Remaining tasks reallocated starting at 15:00. Completed sessions count in revised plan = 2.
- **Status**: **PASS**
- **Remarks**: State preservation invariant guaranteed. Completed work is never deleted or duplicated.

---

### Scenario 10: Parser Resilience on Malformed AI Response
- **Test File**: `backend/tests/test_suite.py::run_all_scenarios (Scenario 10)`
- **Input**:
  - Test A: Empty string `""`
  - Test B: `<think>` reasoning block followed by markdown code fence ```json ... ```
  - Test C: Conversational prose before and after JSON object
- **Expected Output**:
  - Test A raises clean `ValueError`. Test B and C cleanly extract and parse the embedded JSON dictionary.
- **Actual Output**:
  - Test A: Correctly raised ValueError.
  - Test B: Stripped `<think>` tokens and markdown fences; extracted 1 session cleanly.
  - Test C: Bracket-matching regex extracted JSON object successfully.
- **Status**: **PASS**
- **Remarks**: Multi-stage cleaning pipeline ensures robust parsing against arbitrary model output formats.

---

## 3. Unit Tests & Integration Tests Evidence

### Validator Unit Tests (`backend/tests/test_validator.py`)
- `test_valid_schedule_passes`: **PASS** (150m study, 15m break, 0 errors)
- `test_overlapping_sessions_detected`: **PASS** (detected 30-min overlap)
- `test_end_before_start_detected`: **PASS** (flagged end time earlier than start)
- `test_duration_mismatch_detected`: **PASS** (flagged declared 90m vs actual 60m)
- `test_invalid_type_detected`: **PASS** (flagged unpermitted type 'entertainment')
- `test_revision_and_practice_accepted_as_study`: **PASS** (120m accepted)
- `test_breaks_not_counted_as_study_time`: **PASS** (breaks excluded from study total)
- `test_study_limit_exceeded`: **PASS** (flagged 240m exceeding 180m limit)
- `test_missing_subject_warning`: **PASS** (advisory warning for omitted course)
- `test_malformed_sessions_list`: **PASS** (handled non-list input cleanly)

### Rescheduler Unit Tests (`backend/tests/test_rescheduler.py`)
- `test_preserves_completed_sessions`: **PASS** (verified Automata Theory retained at 09:00)
- `test_new_sessions_start_at_resumption_time`: **PASS** (first pending session starts at 15:00)
- `test_computes_delta_summary`: **PASS** (generated human-readable deltas)
- `test_revised_plan_passes_validation`: **PASS** (revised plan valid & within 120m budget)

### FastAPI Integration Tests (`backend/tests/test_api.py`)
- `GET /`: **PASS** (returns project metadata)
- `GET /api/health`: **PASS** (probes Ollama & model status)
- `GET /api/presets`: **PASS** (returns 3 presets)
- `POST /api/plan/generate`: **PASS** (live Qwen3 8B generation & validation)
- `POST /api/plan/validate`: **PASS** (deterministic verification)
- `GET /api/plan/current`: **PASS** (synchronizes active timetable)
- `PATCH /api/sessions/sess-1`: **PASS** (toggles completion checkbox)
- `POST /api/plan/reschedule`: **PASS** (live Qwen3 8B adaptive rescheduling)
- `GET /api/prompts`: **PASS** (returns V1, V2, V3 metadata)
- `GET /api/export/json`: **PASS** (JSON file export)
- `GET /api/export/markdown`: **PASS** (Markdown timetable export)

### Frontend Interaction Tests (`frontend/src/__tests__/`)
- `ValidationBanner.test.tsx` (2 tests): **PASS**
- `App.test.tsx` (6 tests across all workspace navigations): **PASS**
