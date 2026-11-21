"""
backend/app/main.py — FastAPI Application Entrypoint for StudyFlow AI.
Configures CORS, routes, lifecycle events, and academic metadata.
"""

import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure app package is discoverable
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from app.api.routes import router

app = FastAPI(
    title="StudyFlow AI — Academic API",
    description="Backend API for AI-Powered Personalized Study Plan Generator (Team Innovex, Problem Pool C20)",
    version="2.0.0"
)

# Configure CORS for local development and production deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes under /api
app.include_router(router)


@app.get("/")
def root():
    return {
        "project": "StudyFlow AI",
        "title": "AI-Powered Personalized Study Plan Generator",
        "team": "Innovex",
        "team_id": "PE-B25-52",
        "problem_pool_id": "C20",
        "course": "Prompt Engineering",
        "members": [
            {"name": "Gaurav Singh", "enrollment": "S24CSEU0790", "role": "Team Leader"},
            {"name": "Adarsh Dubey", "enrollment": "S24CSEU1579", "role": "Team Member"}
        ],
        "api_docs": "/docs",
        "health_check": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
