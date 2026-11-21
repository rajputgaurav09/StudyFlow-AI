"""
backend/tests/test_rescheduler.py — Comprehensive unit tests for Adaptive Rescheduler.
Preserves tests for state preservation, delta tracking, and time re-allocation.
"""

import unittest
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.rescheduler import deterministic_reschedule, compute_schedule_deltas
from app.core.validator import validate_schedule


class TestRescheduler(unittest.TestCase):

    def setUp(self):
        self.original_sessions = [
            {"start": "09:00", "end": "10:15", "subject": "Automata Theory", "task": "DFA design", "type": "study", "duration_min": 75, "completed": True},
            {"start": "10:15", "end": "10:30", "subject": "Break", "task": "Rest", "type": "break", "duration_min": 15, "completed": True},
            {"start": "10:30", "end": "12:00", "subject": "C Programming", "task": "Pointers", "type": "study", "duration_min": 90, "completed": False}
        ]
        self.subjects = [
            {"subject": "Automata Theory", "exam_in_days": 3, "priority": "High"},
            {"subject": "C Programming", "exam_in_days": 5, "priority": "Medium"}
        ]

    def test_preserves_completed_sessions(self):
        revised = deterministic_reschedule(
            original_sessions=self.original_sessions,
            subjects_list=self.subjects,
            remaining_hours=2.0,
            missed_description="Missed C Programming at 10:30",
            new_start_time="14:00"
        )
        sessions = revised["sessions"]

        # Check completed session is preserved
        completed_sessions = [s for s in sessions if s.get("completed")]
        self.assertGreaterEqual(len(completed_sessions), 1)
        self.assertEqual(completed_sessions[0]["subject"], "Automata Theory")
        self.assertEqual(completed_sessions[0]["start"], "09:00")

    def test_new_sessions_start_at_resumption_time(self):
        revised = deterministic_reschedule(
            original_sessions=self.original_sessions,
            subjects_list=self.subjects,
            remaining_hours=1.5,
            missed_description="Doctor appointment",
            new_start_time="15:00"
        )
        new_sessions = [s for s in revised["sessions"] if not s.get("completed")]
        self.assertGreater(len(new_sessions), 0)
        self.assertEqual(new_sessions[0]["start"], "15:00")

    def test_computes_delta_summary(self):
        revised = deterministic_reschedule(
            original_sessions=self.original_sessions,
            subjects_list=self.subjects,
            remaining_hours=2.0,
            missed_description="Missed morning session",
            new_start_time="14:00"
        )
        deltas = revised.get("delta_summary", [])
        self.assertGreater(len(deltas), 0)
        self.assertTrue(any("preserved" in d.lower() for d in deltas))

    def test_revised_plan_passes_validation(self):
        revised = deterministic_reschedule(
            original_sessions=self.original_sessions,
            subjects_list=self.subjects,
            remaining_hours=2.0,
            missed_description="Missed session",
            new_start_time="14:00"
        )
        # Validate only the newly scheduled portion against remaining hours
        new_sessions = [s for s in revised["sessions"] if not s.get("completed")]
        validation = validate_schedule(new_sessions, available_hours=2.0)
        self.assertTrue(validation["valid"])
        self.assertLessEqual(validation["actual_study_minutes"], 120)


if __name__ == "__main__":
    unittest.main()
