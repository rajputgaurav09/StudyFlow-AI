"""
backend/tests/test_validator.py — Comprehensive unit tests for Intelligent Schedule Validator.
Preserves all deterministic rule-based constraint tests.
"""

import unittest
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.validator import validate_schedule


class TestValidator(unittest.TestCase):

    def test_valid_schedule_passes(self):
        sessions = [
            {"start": "09:00", "end": "10:15", "subject": "Math", "task": "Practice calculus derivatives", "type": "study", "duration_min": 75},
            {"start": "10:15", "end": "10:30", "subject": "Break", "task": "Rest and stretch", "type": "break", "duration_min": 15},
            {"start": "10:30", "end": "11:45", "subject": "Physics", "task": "Electromagnetism problems", "type": "study", "duration_min": 75}
        ]
        result = validate_schedule(sessions, available_hours=3.0, expected_subjects=["Math", "Physics"])
        self.assertTrue(result["valid"])
        self.assertEqual(len(result["errors"]), 0)
        self.assertEqual(result["actual_study_minutes"], 150)
        self.assertEqual(result["break_minutes"], 15)

    def test_overlapping_sessions_detected(self):
        sessions = [
            {"start": "09:00", "end": "10:15", "subject": "Math", "task": "Derivatives", "type": "study", "duration_min": 75},
            {"start": "10:00", "end": "11:00", "subject": "Physics", "task": "Optics", "type": "study", "duration_min": 60}
        ]
        result = validate_schedule(sessions, available_hours=3.0)
        self.assertFalse(result["valid"])
        self.assertTrue(any("overlapping" in e.lower() for e in result["errors"]))

    def test_end_before_start_detected(self):
        sessions = [
            {"start": "11:00", "end": "10:00", "subject": "Chemistry", "task": "Titration review", "type": "study", "duration_min": 60}
        ]
        result = validate_schedule(sessions, available_hours=2.0)
        self.assertFalse(result["valid"])
        self.assertTrue(any("later than start time" in e.lower() for e in result["errors"]))

    def test_duration_mismatch_detected(self):
        sessions = [
            {"start": "09:00", "end": "10:00", "subject": "Biology", "task": "Cell division", "type": "study", "duration_min": 90}
        ]
        result = validate_schedule(sessions, available_hours=2.0)
        self.assertFalse(result["valid"])
        self.assertTrue(any("duration mismatch" in e.lower() for e in result["errors"]))

    def test_invalid_type_detected(self):
        sessions = [
            {"start": "09:00", "end": "10:00", "subject": "History", "task": "World War 2", "type": "entertainment", "duration_min": 60}
        ]
        result = validate_schedule(sessions, available_hours=2.0)
        self.assertFalse(result["valid"])
        self.assertTrue(any("invalid type" in e.lower() for e in result["errors"]))

    def test_revision_and_practice_accepted_as_study(self):
        sessions = [
            {"start": "09:00", "end": "10:00", "subject": "Automata", "task": "Grammar proofs", "type": "revision", "duration_min": 60},
            {"start": "10:00", "end": "11:00", "subject": "C Lang", "task": "Pointer drills", "type": "practice", "duration_min": 60}
        ]
        result = validate_schedule(sessions, available_hours=2.5)
        self.assertTrue(result["valid"])
        self.assertEqual(result["actual_study_minutes"], 120)

    def test_breaks_not_counted_as_study_time(self):
        sessions = [
            {"start": "09:00", "end": "10:00", "subject": "Math", "task": "Calculus", "type": "study", "duration_min": 60},
            {"start": "10:00", "end": "10:30", "subject": "Break", "task": "Lunch", "type": "break", "duration_min": 30}
        ]
        result = validate_schedule(sessions, available_hours=1.0)
        self.assertTrue(result["valid"])
        self.assertEqual(result["actual_study_minutes"], 60)
        self.assertEqual(result["break_minutes"], 30)

    def test_study_limit_exceeded(self):
        sessions = [
            {"start": "09:00", "end": "11:00", "subject": "Math", "task": "Calculus", "type": "study", "duration_min": 120},
            {"start": "11:00", "end": "13:00", "subject": "Physics", "task": "Mechanics", "type": "study", "duration_min": 120}
        ]
        result = validate_schedule(sessions, available_hours=3.0)
        self.assertFalse(result["valid"])
        self.assertTrue(any("exceeds your available limit" in e.lower() for e in result["errors"]))

    def test_missing_subject_warning(self):
        sessions = [
            {"start": "09:00", "end": "10:30", "subject": "Math", "task": "Linear algebra", "type": "study", "duration_min": 90}
        ]
        result = validate_schedule(sessions, available_hours=2.0, expected_subjects=["Math", "Chemistry"])
        self.assertTrue(result["valid"])
        self.assertTrue(any("chemistry" in w.lower() for w in result["warnings"]))

    def test_malformed_sessions_list(self):
        result = validate_schedule("not_a_list", available_hours=2.0)
        self.assertFalse(result["valid"])
        self.assertTrue(any("must be a list" in e.lower() for e in result["errors"]))

        result_empty = validate_schedule([], available_hours=2.0)
        self.assertFalse(result_empty["valid"])


if __name__ == "__main__":
    unittest.main()
