"""
backend/tests/test_api.py — Integration tests for FastAPI endpoints.
Verifies all routes: health, generate, validate, current, reschedule, update session, prompts, export.
"""

import sys
import os
import unittest
from fastapi.testclient import TestClient

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)


class TestAPIEndpoints(unittest.TestCase):

    def test_root_endpoint(self):
        response = client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["project"], "StudyFlow AI")
        self.assertEqual(data["team"], "Innovex")

    def test_health_endpoint(self):
        response = client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("ollama_online", data)
        self.assertIn("models", data)

    def test_presets_endpoint(self):
        response = client.get("/api/presets")
        self.assertEqual(response.status_code, 200)
        presets = response.json()
        self.assertGreaterEqual(len(presets), 3)
        self.assertEqual(presets[0]["id"], "preset-crunch")

    def test_generate_plan_endpoint(self):
        payload = {
            "subjects": [
                {"subject": "Automata Theory", "exam_in_days": 3, "priority": "High"},
                {"subject": "C Programming", "exam_in_days": 5, "priority": "Medium"}
            ],
            "available_hours": 3.0,
            "start_time": "09:00",
            "prompt_version": "V2"
        }
        response = client.post("/api/plan/generate", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("sessions", data)
        self.assertGreater(len(data["sessions"]), 0)
        self.assertIn("validation", data)
        self.assertTrue(data["validation"]["valid"])

    def test_validate_plan_endpoint(self):
        payload = {
            "sessions": [
                {"id": "1", "start": "09:00", "end": "10:00", "subject": "Math", "task": "Calculus", "type": "study", "duration_min": 60, "completed": False},
                {"id": "2", "start": "10:00", "end": "10:15", "subject": "Break", "task": "Rest", "type": "break", "duration_min": 15, "completed": False}
            ],
            "available_hours": 2.0,
            "expected_subjects": ["Math"]
        }
        response = client.post("/api/plan/validate", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["valid"])
        self.assertEqual(data["actual_study_minutes"], 60)
        self.assertEqual(data["break_minutes"], 15)

    def test_current_plan_endpoint(self):
        response = client.get("/api/plan/current")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("schedule", data)
        self.assertIn("subjects", data)

    def test_update_session_endpoint(self):
        # Update session sess-1 in current demo plan
        response = client.patch("/api/sessions/sess-1", json={"completed": True})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["completed"], True)

    def test_reschedule_endpoint(self):
        payload = {
            "subjects": [
                {"subject": "Automata Theory", "exam_in_days": 3, "priority": "High"},
                {"subject": "C Programming", "exam_in_days": 5, "priority": "Medium"}
            ],
            "remaining_hours": 2.0,
            "missed_description": "Delayed due to doctor appointment",
            "new_start_time": "14:00"
        }
        response = client.post("/api/plan/reschedule", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("sessions", data)
        self.assertIn("delta_summary", data)
        self.assertGreater(len(data["delta_summary"]), 0)

    def test_prompts_endpoint(self):
        response = client.get("/api/prompts")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 3)
        versions = [p["version"] for p in data]
        self.assertEqual(versions, ["V1", "V2", "V3"])

    def test_export_json_endpoint(self):
        response = client.get("/api/export/json")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("academic_metadata", data)
        self.assertEqual(data["academic_metadata"]["team"], "Innovex")

    def test_export_markdown_endpoint(self):
        response = client.get("/api/export/markdown")
        self.assertEqual(response.status_code, 200)
        text = response.text
        self.assertIn("StudyFlow AI", text)
        self.assertIn("Daily Schedule", text)


if __name__ == "__main__":
    unittest.main()
