"""
backend/tests/test_suite.py — Automated Execution of All 10 Required Compliance Scenarios.
Preserves all academic compliance scenarios:
1. Normal three-subject study plan.
2. One high-priority examination approaching.
3. Multiple examinations on nearby dates.
4. Four-hour daily limit.
5. Insufficient available time.
6. Overlapping AI-generated sessions.
7. Invalid time intervals.
8. Missed study session.
9. Reduced availability after rescheduling.
10. Empty or malformed AI response.
"""

import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.validator import validate_schedule
from app.core.ai_engine import generate_deterministic_fallback, clean_json_response
from app.core.rescheduler import deterministic_reschedule


def run_all_scenarios():
    print("=" * 80)
    print("STUDYFLOW AI — AUTOMATED COMPLIANCE TEST SUITE (REBUILD)")
    print("=" * 80)

    results = []

    # Scenario 1: Normal three-subject study plan
    print("\n[Scenario 1] Normal three-subject study plan...")
    s1_subjects = [
        {"subject": "Automata Theory", "exam_in_days": 3, "priority": "High"},
        {"subject": "C Programming", "exam_in_days": 5, "priority": "Medium"},
        {"subject": "AI/ML", "exam_in_days": 7, "priority": "Medium"}
    ]
    s1_plan = generate_deterministic_fallback(s1_subjects, available_hours=4.0, start_time="09:00")
    s1_val = validate_schedule(s1_plan["sessions"], available_hours=4.0, expected_subjects=["Automata Theory", "C Programming", "AI/ML"])
    assert s1_val["valid"], f"Scenario 1 validation failed: {s1_val['errors']}"
    assert s1_val["actual_study_minutes"] <= 240, "Scenario 1 exceeded 240 minutes"
    print(f"  ✓ Passed: Generated {len(s1_plan['sessions'])} sessions. Total study: {s1_val['actual_study_minutes']}m / 240m.")
    results.append(("Scenario 1: Normal 3-subject plan", True))

    # Scenario 2: One high-priority examination approaching
    print("\n[Scenario 2] One high-priority examination approaching...")
    s2_subjects = [
        {"subject": "Operating Systems", "exam_in_days": 1, "priority": "High"},
        {"subject": "Web Tech", "exam_in_days": 12, "priority": "Low"}
    ]
    s2_plan = generate_deterministic_fallback(s2_subjects, available_hours=3.5, start_time="08:30")
    s2_val = validate_schedule(s2_plan["sessions"], available_hours=3.5)
    assert s2_val["valid"], f"Scenario 2 failed: {s2_val['errors']}"
    os_time = s2_val["subject_breakdown"].get("Operating Systems", 0)
    web_time = s2_val["subject_breakdown"].get("Web Tech", 0)
    assert os_time > web_time, f"High priority subject did not receive more time: OS={os_time}m, Web={web_time}m"
    print(f"  ✓ Passed: OS allocated {os_time}m vs Web Tech {web_time}m. Total: {s2_val['actual_study_minutes']}m.")
    results.append(("Scenario 2: High-priority urgent exam", True))

    # Scenario 3: Multiple examinations on nearby dates
    print("\n[Scenario 3] Multiple examinations on nearby dates...")
    s3_subjects = [
        {"subject": "Discrete Mathematics", "exam_in_days": 2, "priority": "High"},
        {"subject": "Computer Networks", "exam_in_days": 3, "priority": "High"},
        {"subject": "Database Management", "exam_in_days": 4, "priority": "High"}
    ]
    s3_plan = generate_deterministic_fallback(s3_subjects, available_hours=5.0, start_time="08:00")
    s3_val = validate_schedule(s3_plan["sessions"], available_hours=5.0)
    assert s3_val["valid"], f"Scenario 3 failed: {s3_val['errors']}"
    assert len(s3_val["subject_breakdown"]) == 3, "Not all subjects received study time"
    print(f"  ✓ Passed: Balanced allocation across 3 urgent exams. Study: {s3_val['actual_study_minutes']}m, Breaks: {s3_val['break_minutes']}m.")
    results.append(("Scenario 3: Multiple nearby exams", True))

    # Scenario 4: Four-hour daily limit
    print("\n[Scenario 4] Four-hour daily limit strictly enforced...")
    s4_subjects = [
        {"subject": "Linear Algebra", "exam_in_days": 4, "priority": "High"},
        {"subject": "Software Engg", "exam_in_days": 6, "priority": "Medium"}
    ]
    s4_plan = generate_deterministic_fallback(s4_subjects, available_hours=4.0, start_time="10:00")
    s4_val = validate_schedule(s4_plan["sessions"], available_hours=4.0)
    assert s4_val["valid"], f"Scenario 4 failed: {s4_val['errors']}"
    assert s4_val["actual_study_minutes"] <= 240, f"Exceeded limit: {s4_val['actual_study_minutes']}m > 240m"
    print(f"  ✓ Passed: Actual study minutes = {s4_val['actual_study_minutes']}m <= 240m limit.")
    results.append(("Scenario 4: 4-hour daily limit", True))

    # Scenario 5: Insufficient available time
    print("\n[Scenario 5] Insufficient available time (1.0 hour for 3 subjects)...")
    s5_subjects = [
        {"subject": "Data Structures", "exam_in_days": 2, "priority": "High"},
        {"subject": "Algorithms", "exam_in_days": 4, "priority": "High"},
        {"subject": "Computer Architecture", "exam_in_days": 5, "priority": "Medium"}
    ]
    s5_plan = generate_deterministic_fallback(s5_subjects, available_hours=1.0, start_time="18:00")
    s5_val = validate_schedule(s5_plan["sessions"], available_hours=1.0)
    assert s5_val["valid"], f"Scenario 5 failed: {s5_val['errors']}"
    assert s5_val["actual_study_minutes"] <= 60, "Study minutes exceeded 60m"
    print(f"  ✓ Passed: Successfully compressed to {s5_val['actual_study_minutes']}m within 1.0 hour window.")
    results.append(("Scenario 5: Insufficient available time", True))

    # Scenario 6: Overlapping AI-generated sessions
    print("\n[Scenario 6] Overlapping AI-generated sessions detection...")
    s6_sessions = [
        {"start": "09:00", "end": "10:30", "subject": "Math", "task": "Calculus", "type": "study", "duration_min": 90},
        {"start": "10:00", "end": "11:15", "subject": "Physics", "task": "Optics", "type": "study", "duration_min": 75}
    ]
    s6_val = validate_schedule(s6_sessions, available_hours=4.0)
    assert not s6_val["valid"], "Validator failed to flag overlapping sessions"
    assert any("overlapping" in e.lower() for e in s6_val["errors"]), "Error message missing 'overlapping'"
    print(f"  ✓ Passed: Overlap detected correctly: '{s6_val['errors'][0]}'")
    results.append(("Scenario 6: Overlapping session detection", True))

    # Scenario 7: Invalid time intervals
    print("\n[Scenario 7] Invalid time intervals and duration mismatch...")
    s7_sessions = [
        {"start": "11:00", "end": "10:00", "subject": "Chemistry", "task": "Organic chem", "type": "study", "duration_min": 60},
        {"start": "11:15", "end": "12:15", "subject": "Biology", "task": "Genetics", "type": "study", "duration_min": 90}
    ]
    s7_val = validate_schedule(s7_sessions, available_hours=4.0)
    assert not s7_val["valid"], "Validator failed to flag invalid time intervals"
    print(f"  ✓ Passed: Errors flagged: {s7_val['errors']}")
    results.append(("Scenario 7: Invalid intervals & mismatch", True))

    # Scenario 8: Missed study session
    print("\n[Scenario 8] Adaptive rescheduling after missed session...")
    s8_orig = [
        {"start": "09:00", "end": "10:00", "subject": "Automata Theory", "task": "DFA design", "type": "study", "duration_min": 60, "completed": False},
        {"start": "10:00", "end": "10:15", "subject": "Break", "task": "Rest", "type": "break", "duration_min": 15},
        {"start": "10:15", "end": "11:15", "subject": "C Programming", "task": "Pointers", "type": "study", "duration_min": 60, "completed": False}
    ]
    s8_revised = deterministic_reschedule(
        original_sessions=s8_orig,
        subjects_list=s1_subjects,
        remaining_hours=3.0,
        missed_description="Missed Automata Theory due to morning delay",
        new_start_time="13:00"
    )
    s8_val = validate_schedule(s8_revised["sessions"], available_hours=3.0)
    assert s8_val["valid"], f"Rescheduled plan failed validation: {s8_val['errors']}"
    assert len(s8_revised["delta_summary"]) > 0, "No delta summary produced"
    print(f"  ✓ Passed: Rescheduled {len(s8_revised['sessions'])} sessions starting at 13:00. Deltas: {s8_revised['delta_summary'][0]}")
    results.append(("Scenario 8: Missed session rescheduling", True))

    # Scenario 9: Reduced availability after rescheduling
    print("\n[Scenario 9] Reduced availability after rescheduling (completed preserved)...")
    s9_orig = [
        {"start": "09:00", "end": "10:15", "subject": "Automata Theory", "task": "DFA design", "type": "study", "duration_min": 75, "completed": True},
        {"start": "10:15", "end": "10:30", "subject": "Break", "task": "Rest", "type": "break", "duration_min": 15, "completed": True},
        {"start": "10:30", "end": "12:00", "subject": "C Programming", "task": "Pointers", "type": "study", "duration_min": 90, "completed": False}
    ]
    s9_revised = deterministic_reschedule(
        original_sessions=s9_orig,
        subjects_list=s1_subjects,
        remaining_hours=1.5,
        missed_description="Afternoon commitment reduced remaining study window to 1.5h",
        new_start_time="15:00"
    )
    completed_in_revised = [s for s in s9_revised["sessions"] if s.get("completed")]
    assert len(completed_in_revised) == 2, f"Completed sessions lost: {len(completed_in_revised)}"
    print(f"  ✓ Passed: Preserved {len(completed_in_revised)} completed sessions. Remaining budget: 1.5h.")
    results.append(("Scenario 9: Reduced availability & preservation", True))

    # Scenario 10: Empty or malformed AI response handling
    print("\n[Scenario 10] Empty or malformed AI response resilience...")
    try:
        clean_json_response("")
        assert False, "Should have raised ValueError on empty string"
    except ValueError:
        pass

    thinking_response = """
<think>
Evaluating priority of Automata Theory and allocating 75 minutes.
</think>
```json
{
  "sessions": [
    {"start": "09:00", "end": "10:15", "subject": "Automata Theory", "task": "Turing machine", "type": "study", "duration_min": 75}
  ],
  "assumptions": []
}
```
"""
    cleaned = clean_json_response(thinking_response)
    assert "sessions" in cleaned and len(cleaned["sessions"]) == 1, "Failed to clean thinking tags & markdown"

    prose_response = "Here is your requested study plan:\n{\"sessions\": [], \"assumptions\": []}\nHope this helps!"
    cleaned_prose = clean_json_response(prose_response)
    assert "sessions" in cleaned_prose, "Failed to extract JSON from surrounding prose"

    print("  ✓ Passed: Successfully extracted JSON across thinking tags, markdown fences, and conversational prose.")
    results.append(("Scenario 10: Parser resilience on malformed AI text", True))

    print("\n" + "=" * 80)
    print("COMPLIANCE SUMMARY: ALL 10 REQUIRED SCENARIOS EXECUTED & PASSED")
    print("=" * 80)
    for name, status in results:
        print(f"  [{'PASS' if status else 'FAIL'}] {name}")
    print("=" * 80)
    return results


if __name__ == "__main__":
    run_all_scenarios()
