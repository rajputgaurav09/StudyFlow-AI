# StudyFlow AI — Production-Grade Academic Study Planner

> **Registered Academic Capstone**  
> **Course**: Prompt Engineering  
> **Team Name**: Innovex  
> **Team ID**: PE-B25-52  
> **Problem Pool ID**: C20  
> **Product Name**: StudyFlow AI  
> **Team Leader**: Gaurav Singh (`S24CSEU0790`)  
> **Team Member**: Adarsh Dubey (`S24CSEU1579`)  
> **Environment**: Windows 11 &bull; Python 3.13 &bull; React 19 + TypeScript + Vite &bull; Local Ollama (`qwen3:8b`)

---

## Executive Overview

**StudyFlow AI** is a production-quality academic scheduling platform that synthesizes complex student commitments (multiple concurrent courses, approaching examination deadlines, priorities, daily study hours, and cognitive rest rhythm) into mathematically verified daily study timetables.

Built to address the catastrophic failure modes of naive LLM wrappers—hallucinated durations, overlapping slots, and collapse during real-world schedule disruptions—StudyFlow AI implements an end-to-end decoupled architecture:
1. **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS with six interactive workspaces, live progress tracking, and zero decorative or non-functional controls.
2. **Backend**: Python FastAPI with strict Pydantic v2 schemas, REST endpoints, and file export services.
3. **Inference & Constraint Logic**: Fully offline, private local inference via Ollama running `qwen3:8b`, an independent 8-rule deterministic Python validator, and an adaptive rescheduler.

---

## Six Dedicated Academic Workspaces

1. **Overview Dashboard**: System KPIs, nearest deadline countdown, active schedule preview, and 5-step cognitive pipeline.
2. **Study Planner**: Add/Edit/Delete courses, countdown days, priorities, daily hour sliders, prompt version selection, and quick presets.
3. **My Timetable**: Chronological schedule, micro-task assignments, interactive session completion checkboxes, live progress bar, and JSON/Markdown downloads.
4. **Adaptive Rescheduling**: Disruption reporting, revised availability windows, state preservation for completed sessions, and explicit human-readable delta logs.
5. **Prompt Lab**: Academic workbench comparing Prompt V1 (Baseline), Prompt V2 (Schema Enforcement), and Prompt V3 (Adaptive Rescheduling) with live benchmark execution and genuine millisecond latency instrumentation.
6. **About Us & Documentation**: Complete academic credentials, problem statement, architecture specification, validation rules, and testing evidence.

---

## Directory Structure

```text
StudyFlow-AI-Rebuild/
├── backend/                            # FastAPI backend service
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py               # REST API endpoints
│   │   ├── core/
│   │   │   ├── ai_engine.py            # Local Ollama client & prompt loader
│   │   │   ├── validator.py            # Independent deterministic Python validator
│   │   │   └── rescheduler.py          # Adaptive rescheduling & delta tracking
│   │   ├── models/
│   │   │   └── schemas.py              # Pydantic v2 request/response models
│   │   ├── main.py                     # FastAPI application entrypoint & CORS
│   │   └── state.py                    # In-memory plan & session state manager
│   ├── prompts/                        # Tracked Prompt Engineering artifacts
│   │   ├── prompt_v1.txt               # Milestone 1 baseline prompt
│   │   ├── prompt_v2.txt               # Milestone 2 structured JSON schema prompt
│   │   └── prompt_v3.txt               # Milestone 3 adaptive rescheduling prompt
│   ├── tests/                          # Automated compliance test suite
│   │   ├── test_cases.json             # 10 mandatory evaluation test scenarios
│   │   ├── test_suite.py               # Automated runner for 10 compliance scenarios
│   │   ├── test_validator.py           # 10 unit tests for validator constraints
│   │   ├── test_rescheduler.py         # 4 unit tests for adaptive rescheduler
│   │   └── test_api.py                 # 11 integration tests for FastAPI routes
│   ├── requirements.txt                # Python backend dependencies
│   └── run.py                          # Convenient backend runner
├── frontend/                           # React 19 + TypeScript + Vite frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts               # Typed REST API client
│   │   ├── components/
│   │   │   ├── Common/
│   │   │   │   └── ValidationBanner.tsx# Deterministic validation status banner
│   │   │   ├── Layout/
│   │   │   │   ├── Header.tsx          # Brandmark, status, and theme toggle
│   │   │   │   ├── Sidebar.tsx         # 6-workspace navigation rail
│   │   │   │   └── WorkspaceContainer.tsx
│   │   │   └── Workspaces/
│   │   │       ├── OverviewWorkspace.tsx
│   │   │       ├── StudyPlannerWorkspace.tsx
│   │   │       ├── TimetableWorkspace.tsx
│   │   │       ├── ReschedulingWorkspace.tsx
│   │   │       ├── PromptLabWorkspace.tsx
│   │   │       └── AboutDocWorkspace.tsx
│   │   ├── context/
│   │   │   └── PlanContext.tsx         # Global React state management
│   │   ├── types/
│   │   │   └── index.ts                # TypeScript interfaces
│   │   ├── App.tsx                     # Main application component
│   │   └── main.tsx                    # React DOM root
│   ├── package.json                    # Frontend dependencies & scripts
│   ├── tailwind.config.js              # Editorial color system configuration
│   ├── vite.config.ts                  # Vite & Vitest configuration
│   └── vercel.json                     # Vercel deployment configuration
├── documentation/
│   ├── ARCHITECTURE.md                 # System architecture & mermaid diagrams
│   ├── API_DOCUMENTATION.md            # Complete REST API reference
│   ├── DEPLOYMENT_GUIDE.md             # Local setup & Vercel deployment guide
│   └── ACADEMIC_PROMPT_EVALUATION.md   # Prompt engineering evolution analysis
├── TEST_EVIDENCE.md                    # Record of all 43 executed tests
└── README.md                           # Project documentation
```

---

## Installation & Quickstart

### Prerequisites
- Python 3.13 (or 3.10+)
- Node.js 18+ and npm
- Ollama with `qwen3:8b`:
  ```bash
  ollama pull qwen3:8b
  ```

### 1. Launch FastAPI Backend
```bash
cd "C:\Users\GAURAV SINGH\Desktop\StudyFlow-AI-Rebuild\backend"
py -3.13 run.py
```
Backend runs on: `http://localhost:8000` (API Docs: `http://localhost:8000/docs`)

### 2. Launch React Frontend
```bash
cd "C:\Users\GAURAV SINGH\Desktop\StudyFlow-AI-Rebuild\frontend"
npm run dev
```
Frontend runs on: `http://localhost:5173`

---

## Automated Verification Suite

Run all test suites across backend and frontend:

### 1. 10 Mandatory Compliance Scenarios
```bash
cd backend
py -3.13 -u tests/test_suite.py
```
Result: **10 passed, 0 failed**

### 2. Validator & Rescheduler Unit Tests
```bash
cd backend
py -3.13 -m unittest tests/test_validator.py tests/test_rescheduler.py
```
Result: **14 passed, 0 failed**

### 3. FastAPI REST Integration Tests (with live Ollama)
```bash
cd backend
py -3.13 -u tests/test_api.py
```
Result: **11 passed, 0 failed**

### 4. React Frontend Component & Navigation Tests
```bash
cd frontend
npm test
```
Result: **8 passed, 0 failed**

**Total Test Count**: 43 tests executed & passed (100% pass rate).

---

## Vercel Deployment

The React frontend includes a pre-configured `vercel.json` and builds via `npm run build` into `frontend/dist`.  
For full end-to-end cloud deployment details and hybrid tunneling instructions, see [documentation/DEPLOYMENT_GUIDE.md](file:///C:/Users/GAURAV%20SINGH/Desktop/StudyFlow-AI-Rebuild/documentation/DEPLOYMENT_GUIDE.md).
