# StudyFlow AI — Academic Prompt Engineering Evaluation

> **Registered Academic Project**  
> **Course**: Prompt Engineering  
> **Team**: Innovex | **Team ID**: PE-B25-52 | **Problem Pool**: C20  
> **Product Name**: StudyFlow AI

---

## 1. Executive Summary & Prompt Engineering Trajectory

Prompt Engineering is the primary scientific discipline governing this project. StudyFlow AI demonstrates how intentional prompt evolution transforms an unpredictable language model into a deterministic, production-grade scheduling engine.

The project traces three distinct evolutionary milestones:
- **Prompt V1 (Milestone 1 Baseline)**: Standard role-based prompting requesting Markdown/tabular output. Demonstrates failure modes of unconstrained generation.
- **Prompt V2 (Milestone 2 Schema Enforcement)**: Structured JSON output with explicit negative constraint bounding and mathematical duration invariants.
- **Prompt V3 (Milestone 3 Adaptive Rescheduling)**: Context-injected dynamic re-planning with completed-task preservation and delta computation.

---

## 2. Comparative Evaluation Matrix

| Metric / Dimension | Prompt V1 (Milestone 1) | Prompt V2 (Milestone 2) | Prompt V3 (Milestone 3) |
| :--- | :--- | :--- | :--- |
| **Output Paradigm** | Unstructured text / markdown table | Strict JSON Schema | Strict JSON + Delta Summary |
| **Schema Compliance** | 0% (Fails Python JSON parsing) | 100% Valid JSON | 100% Valid JSON |
| **Time Mathematics** | Frequent slot interval mismatches | Strict `end - start == duration` | Strict duration + new start time |
| **Negative Constraints** | Absent | Non-overlap & break exclusion | Non-overlap, non-duplication |
| **Pedagogical Quality** | Generic chapter/topic labels | Actionable micro-tasks | Prioritized catch-up tasks |
| **State Retention** | No context awareness | Single-shot generation | 100% completed task preservation |
| **Validation Pass Rate** | 0% (Unparseable) | 100% (All 8 constraints pass) | 100% (All 8 constraints pass) |

---

## 3. Deep-Dive: Version Evolution

### Prompt V1: Milestone 1 Baseline
```text
Act as a student study planner. Create a realistic daily study timetable using the following inputs:
Subjects: {subjects_summary}
Exam dates: {exam_dates_summary}
Available study time: {available_hours} hours daily
Priority: {priorities_summary}
```
**Identified Academic Limitations**:
1. Tabular output cannot be consumed reliably by automated verification software.
2. The model frequently creates overlapping time windows (e.g. 09:00–10:30 followed by 10:00–11:00).
3. Breaks are often counted as study hours, violating daily capacity limits.
4. Tasks are vague (e.g., "Study Physics") rather than actionable.

### Prompt V2: Structured Schema Enforcement & Negative Bounding
**Techniques Applied**:
- **Strict JSON Schema Instruction**: `RETURN ONLY VALID JSON WITH NO SURROUNDING MARKDOWN OR PROSE`.
- **Negative Constraints**:
  - `TIME BUDGET: The sum of durations for all 'study', 'revision', and 'practice' sessions MUST NOT exceed {available_minutes} minutes.`
  - `BREAK POLICY: Include 10-15 minute 'break' sessions... Breaks DO NOT count toward the study limit.`
  - `CHRONOLOGICAL CONTINUITY: Sessions must be strictly consecutive and non-overlapping.`
  - `TIME MATHEMATICS: For every session, duration_min must exactly equal the minutes between start and end.`
  - `SUBJECT FIDELITY: Schedule ONLY subjects provided in the input list. Do not invent subjects.`
- **Few-Shot Schema Exemplar**: Provides a concrete two-session demonstration showing expected syntax.

### Prompt V3: Adaptive Rescheduling & Execution Delta Tracking
**Techniques Applied**:
- **Multi-Context Ingestion**: Ingests original schedule, completed work array, disruption description, and revised available hours.
- **State Preservation Invariant**: `PRESERVE COMPLETED WORK: Any session marked as completed in the context must remain in the schedule with a completed flag.`
- **Non-Duplication Rule**: `DO NOT DUPLICATE: Do not schedule study tasks that were already completed.`
- **Delta Computation**: `Provide a concise 'delta_summary' explaining specifically which sessions were retained, shifted, or compressed.`
