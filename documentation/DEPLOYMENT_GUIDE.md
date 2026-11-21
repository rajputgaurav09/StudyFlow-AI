# StudyFlow AI — Deployment & Execution Guide

> **Registered Academic Project**  
> **Course**: Prompt Engineering  
> **Team**: Innovex | **Team ID**: PE-B25-52 | **Problem Pool**: C20  
> **Target Environments**: Local Development (Local Ollama) & Cloud Frontend (Vercel)

---

## 1. Local Demonstration Setup (Primary Academic Route)

The academic capstone is designed to run 100% locally with zero paid APIs, zero subscriptions, and complete data privacy.

### Prerequisites
- Windows 10/11, macOS, or Linux
- Python 3.13 (or 3.10+)
- Node.js 18+ and npm
- Ollama installed ([ollama.ai](https://ollama.ai))

### Step 1: Pull Qwen3 8B Model
Ensure Ollama is running, then pull the target model:
```bash
ollama pull qwen3:8b
```
Verify the model is listed:
```bash
ollama list
```

### Step 2: Launch the FastAPI Backend
Open a terminal in the backend directory:
```bash
cd "C:\Users\GAURAV SINGH\Desktop\StudyFlow-AI-Rebuild\backend"
py -3.13 run.py
```
Or with uvicorn directly:
```bash
py -3.13 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend will launch on `http://localhost:8000`.
Verify health:
- `http://localhost:8000/api/health`
- `http://localhost:8000/docs` (Swagger UI)

### Step 3: Launch the React Frontend
Open a second terminal in the frontend directory:
```bash
cd "C:\Users\GAURAV SINGH\Desktop\StudyFlow-AI-Rebuild\frontend"
npm run dev
```
The frontend will launch on `http://localhost:5173`.

---

## 2. Vercel Frontend Deployment

The React frontend is configured for deployment on Vercel with zero modifications:

### Build Settings
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Configuration File**: `frontend/vercel.json`

### Environment Variables
Configure in the Vercel Project Dashboard:
| Variable | Value | Purpose |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://your-backend-service.com` (or leave empty for local proxy) | Points frontend API client to the FastAPI backend |

---

## 3. Cloud Backend Deployment Options

Because an 8-billion parameter local model requires ~6GB of RAM/VRAM, free-tier cloud platforms (Vercel Serverless, Render Free) cannot host Ollama. The supported deployment architectures are:

### Option A: Local Backend with Cloud Frontend (Recommended Hybrid)
- Deploy the React UI to Vercel.
- Run the FastAPI backend and Ollama locally.
- Use a secure tunnel (e.g., Cloudflare Tunnel or ngrok) to expose `http://localhost:8000` to your Vercel deployment:
  ```bash
  cloudflared tunnel --url http://localhost:8000
  ```
- Set `VITE_API_URL` in Vercel to your Cloudflare Tunnel URL.

### Option B: Cloud GPU VPS (Docker / Fly.io / RunPod)
For a persistent public deployment:
1. Provision a VPS with GPU (e.g. 16GB VRAM RTX 4090 or T4).
2. Install Ollama and run `ollama serve`.
3. Run the FastAPI container with Docker.

---

## 4. Deterministic Offline Fallback Mode

If Ollama is not installed or the local machine lacks RAM, StudyFlow AI automatically activates its **Deterministic Fallback Engine**.
- Response latency: &lt;5 ms.
- Mathematical validity: 100% compliant with all 8 constraints.
- Honest UI labeling: The application clearly badges fallback timetables so evaluators know exactly which engine generated the schedule.
