"""
backend/app/state.py — In-memory state manager for the active StudyFlow plan.
Synchronizes plan data across frontend workspaces and export utilities.
"""

from typing import Dict, Any, List, Optional
import json


class PlanStateManager:
    def __init__(self):
        self.current_plan: Optional[Dict[str, Any]] = None
        self.current_subjects: List[Dict[str, Any]] = []
        self.available_hours: float = 4.0
        self.start_time: str = "09:00"
        self.validation_result: Optional[Dict[str, Any]] = None

        # Initialize with standard preset demonstration data
        self.initialize_demo_data()

    def initialize_demo_data(self):
        self.current_subjects = [
            {"subject": "Automata Theory", "exam_in_days": 3, "priority": "High"},
            {"subject": "C Programming", "exam_in_days": 5, "priority": "Medium"},
            {"subject": "AI/ML Systems", "exam_in_days": 7, "priority": "Medium"}
        ]
        self.available_hours = 4.0
        self.start_time = "09:00"
        self.current_plan = {
            "sessions": [
                {
                    "id": "sess-1",
                    "start": "09:00",
                    "end": "10:30",
                    "subject": "Automata Theory",
                    "task": "Construct DFA, NFA conversion, and solve regular expression minimization problems",
                    "type": "revision",
                    "duration_min": 90,
                    "completed": False
                },
                {
                    "id": "sess-2",
                    "start": "10:30",
                    "end": "10:45",
                    "subject": "Rest & Hydration",
                    "task": "Step away from screen, hydrate, and brief cognitive rest",
                    "type": "break",
                    "duration_min": 15,
                    "completed": False
                },
                {
                    "id": "sess-3",
                    "start": "10:45",
                    "end": "12:00",
                    "subject": "C Programming",
                    "task": "Dynamic memory allocation drills, pointer arithmetic, and linked list debugs",
                    "type": "study",
                    "duration_min": 75,
                    "completed": False
                },
                {
                    "id": "sess-4",
                    "start": "12:00",
                    "end": "12:15",
                    "subject": "Rest & Hydration",
                    "task": "Cognitive pause and light posture stretching",
                    "type": "break",
                    "duration_min": 15,
                    "completed": False
                },
                {
                    "id": "sess-5",
                    "start": "12:15",
                    "end": "13:30",
                    "subject": "AI/ML Systems",
                    "task": "Gradient descent mathematics, loss functions, and backpropagation walkthrough",
                    "type": "study",
                    "duration_min": 75,
                    "completed": False
                }
            ],
            "assumptions": [
                "Allocated 90m primary focus block to Automata Theory due to 3-day exam deadline.",
                "Inserted mandatory 15-minute cognitive rest intervals after every 75-90 minutes of study.",
                "Total study minutes: 240m (4.0 hours) exactly matching student availability."
            ],
            "engine": "StudyFlow Demonstration Preset",
            "prompt_version": "V2"
        }
        self.validation_result = {
            "valid": True,
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

    def set_plan(
        self,
        plan: Dict[str, Any],
        subjects: List[Dict[str, Any]],
        available_hours: float,
        start_time: str,
        validation: Optional[Dict[str, Any]] = None
    ):
        self.current_plan = plan
        self.current_subjects = subjects
        self.available_hours = available_hours
        self.start_time = start_time
        self.validation_result = validation

    def update_session(self, session_id: str, completed: bool) -> bool:
        if not self.current_plan or "sessions" not in self.current_plan:
            return False
        for s in self.current_plan["sessions"]:
            if s.get("id") == session_id:
                s["completed"] = completed
                return True
        return False

    def export_markdown(self) -> str:
        if not self.current_plan:
            return "# StudyFlow AI Timetable\n\nNo active study timetable found."

        sessions = self.current_plan.get("sessions", [])
        engine = self.current_plan.get("engine", "StudyFlow AI")
        prompt_ver = self.current_plan.get("prompt_version", "V2")

        md = []
        md.append("# StudyFlow AI — Academic Study Timetable")
        md.append(f"> **Engine**: {engine} | **Prompt Version**: {prompt_ver}")
        md.append(f"> **Available Budget**: {self.available_hours} hours | **Start Time**: {self.start_time}\n")
        md.append("## Daily Schedule\n")
        md.append("| Time Window | Duration | Type | Subject | Task | Status |")
        md.append("| :--- | :--- | :--- | :--- | :--- | :--- |")

        for s in sessions:
            status = "Completed [x]" if s.get("completed") else "Pending [ ]"
            type_label = s.get("type", "study").capitalize()
            md.append(f"| {s.get('start')} – {s.get('end')} | {s.get('duration_min')} min | {type_label} | {s.get('subject')} | {s.get('task')} | {status} |")

        md.append("\n## Assumptions & Cognitive Notes\n")
        for a in self.current_plan.get("assumptions", []):
            md.append(f"- {a}")

        if self.validation_result:
            md.append("\n## Mathematical Validation Summary\n")
            md.append(f"- **Validation Status**: {'VALID' if self.validation_result.get('valid') else 'INVALID'}")
            md.append(f"- **Actual Study Duration**: {self.validation_result.get('actual_study_minutes', 0)} minutes")
            md.append(f"- **Rest / Breaks**: {self.validation_result.get('break_minutes', 0)} minutes")
            if self.validation_result.get("errors"):
                md.append("\n### Validation Errors")
                for e in self.validation_result["errors"]:
                    md.append(f"- {e}")
            if self.validation_result.get("warnings"):
                md.append("\n### Advisory Notes")
                for w in self.validation_result["warnings"]:
                    md.append(f"- {w}")

        return "\n".join(md)

    def export_json(self) -> Dict[str, Any]:
        return {
            "application": "StudyFlow AI",
            "academic_metadata": {
                "project_title": "AI-Powered Personalized Study Plan Generator",
                "team": "Innovex",
                "team_id": "PE-B25-52",
                "problem_pool_id": "C20",
                "course": "Prompt Engineering",
                "members": [
                    {"name": "Gaurav Singh", "enrollment": "S24CSEU0790", "role": "Team Leader"},
                    {"name": "Adarsh Dubey", "enrollment": "S24CSEU1579", "role": "Team Member"}
                ]
            },
            "parameters": {
                "available_hours": self.available_hours,
                "start_time": self.start_time,
                "subjects": self.current_subjects
            },
            "schedule": self.current_plan,
            "validation": self.validation_result
        }


# Global singleton state
state_manager = PlanStateManager()
