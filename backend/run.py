"""
backend/run.py — Convenient execution entrypoint for StudyFlow AI backend.
"""

import uvicorn
import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "127.0.0.1")
    print(f"Starting StudyFlow AI backend on http://{host}:{port}...")
    uvicorn.run("app.main:app", host=host, port=port, reload=False)
