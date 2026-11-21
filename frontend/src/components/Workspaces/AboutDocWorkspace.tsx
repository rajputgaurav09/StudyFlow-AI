import React from 'react';
import {
  GraduationCap,
  Users,
  Layers,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export const AboutDocWorkspace: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Academic Identity Header Card */}
      <div className="bg-study-navy text-study-ivory rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded bg-study-navy-light text-study-amber border border-study-amber/30">
              Registered Academic Capstone
            </span>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-study-ivory tracking-tight mt-2">
              StudyFlow AI &bull; Team Innovex
            </h1>
            <p className="text-xs sm:text-sm text-study-slate-light mt-1">
              AI-Powered Personalized Study Plan Generator &bull; Course: Prompt Engineering
            </p>
          </div>

          <div className="flex flex-col sm:items-end text-xs text-study-slate-light space-y-1">
            <span className="px-2.5 py-1 rounded bg-study-navy-light border border-study-slate/30 font-mono text-[11px]">
              Team ID: <strong>PE-B25-52</strong>
            </span>
            <span className="px-2.5 py-1 rounded bg-study-navy-light border border-study-slate/30 font-mono text-[11px]">
              Problem Pool: <strong>C20</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Team Members Grid */}
      <div>
        <h2 className="font-heading font-bold text-lg text-study-navy mb-4 flex items-center space-x-2">
          <Users className="w-5 h-5 text-study-amber-dark" />
          <span>Team Innovex Profiles</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Member 1: Gaurav Singh */}
          <div className="bg-study-surface border border-study-border rounded-xl p-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-study-amber-dark">
                  Team Leader
                </span>
                <h3 className="text-base font-heading font-extrabold text-study-navy mt-0.5">
                  Gaurav Singh
                </h3>
                <p className="text-xs font-mono font-semibold text-study-slate mt-1">
                  Enrollment: <strong className="text-study-navy">S24CSEU0790</strong>
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-study-navy text-study-ivory flex items-center justify-center font-heading font-bold text-sm">
                GS
              </div>
            </div>
            <p className="text-xs text-study-slate mt-3 pt-3 border-t border-study-border leading-relaxed">
              System architecture, FastAPI backend design, Prompt Engineering V1/V2/V3 formulation, Ollama local orchestration, and deterministic constraint engine.
            </p>
          </div>

          {/* Member 2: Adarsh Dubey */}
          <div className="bg-study-surface border border-study-border rounded-xl p-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-study-slate">
                  Team Member
                </span>
                <h3 className="text-base font-heading font-extrabold text-study-navy mt-0.5">
                  Adarsh Dubey
                </h3>
                <p className="text-xs font-mono font-semibold text-study-slate mt-1">
                  Enrollment: <strong className="text-study-navy">S24CSEU1579</strong>
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-study-ivory border border-study-border text-study-navy flex items-center justify-center font-heading font-bold text-sm">
                AD
              </div>
            </div>
            <p className="text-xs text-study-slate mt-3 pt-3 border-t border-study-border leading-relaxed">
              Frontend application architecture, React interaction state management, compliance scenario execution, UI design system implementation, and verification testing.
            </p>
          </div>
        </div>
      </div>

      {/* Official Problem Statement & Objectives */}
      <div className="bg-study-surface border border-study-border rounded-xl p-6 shadow-xs space-y-4">
        <h2 className="font-heading font-bold text-lg text-study-navy flex items-center space-x-2">
          <GraduationCap className="w-5 h-5 text-study-navy" />
          <span>Problem Statement & Academic Objectives</span>
        </h2>

        <div className="p-4 rounded-lg bg-study-ivory border border-study-border text-xs text-study-navy leading-relaxed">
          <p className="font-bold text-[11px] uppercase tracking-wider text-study-slate mb-1">
            Registered Problem Statement (Pool C20)
          </p>
          <p className="text-sm font-serif italic text-study-navy">
            &ldquo;Students face immense challenges in organizing study schedules when multiple exams collide on near dates with differing priorities. Naive language models hallucinate impossible time durations, produce overlapping study blocks, ignore cognitive fatigue, and completely collapse when a student misses a planned session. StudyFlow AI provides a reliable, mathematically bounded, offline-capable study synthesizer with dynamic disruption rescheduling.&rdquo;
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-3 rounded-lg border border-study-border bg-study-surface">
            <h4 className="font-bold text-study-navy mb-1">1. Negative Bounding</h4>
            <p className="text-study-slate leading-relaxed">
              Prompt schema design preventing overlapping slots, impossible durations, and unverified extra subjects.
            </p>
          </div>
          <div className="p-3 rounded-lg border border-study-border bg-study-surface">
            <h4 className="font-bold text-study-navy mb-1">2. Local Inference</h4>
            <p className="text-study-slate leading-relaxed">
              Complete student privacy with zero paid external APIs or subscriptions via local Qwen3 8B.
            </p>
          </div>
          <div className="p-3 rounded-lg border border-study-border bg-study-surface">
            <h4 className="font-bold text-study-navy mb-1">3. State Invariance</h4>
            <p className="text-study-slate leading-relaxed">
              Adaptive rescheduling preserves 100% of completed work without accidental loss or duplication.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack & Architecture */}
      <div className="bg-study-surface border border-study-border rounded-xl p-6 shadow-xs space-y-5">
        <h2 className="font-heading font-bold text-lg text-study-navy flex items-center space-x-2">
          <Layers className="w-5 h-5 text-study-navy" />
          <span>Production Technology Stack</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-lg border border-study-border bg-study-ivory">
            <span className="font-bold text-study-amber-dark uppercase text-[10px]">Frontend</span>
            <p className="font-heading font-bold text-sm text-study-navy mt-1">React 19 + Vite</p>
            <p className="text-[11px] text-study-slate mt-0.5">TypeScript, Tailwind CSS, Lucide React, Recharts.</p>
          </div>

          <div className="p-3.5 rounded-lg border border-study-border bg-study-ivory">
            <span className="font-bold text-study-navy uppercase text-[10px]">Backend</span>
            <p className="font-heading font-bold text-sm text-study-navy mt-1">Python FastAPI</p>
            <p className="text-[11px] text-study-slate mt-0.5">Pydantic validation schemas, Uvicorn ASGI server.</p>
          </div>

          <div className="p-3.5 rounded-lg border border-study-border bg-study-ivory">
            <span className="font-bold text-emerald-700 uppercase text-[10px]">AI Inference</span>
            <p className="font-heading font-bold text-sm text-study-navy mt-1">Ollama + Qwen3 8B</p>
            <p className="text-[11px] text-study-slate mt-0.5">Local loopback HTTP inference with deterministic fallback.</p>
          </div>

          <div className="p-3.5 rounded-lg border border-study-border bg-study-ivory">
            <span className="font-bold text-study-slate uppercase text-[10px]">Testing & QA</span>
            <p className="font-heading font-bold text-sm text-study-navy mt-1">Pytest & Unittest</p>
            <p className="text-[11px] text-study-slate mt-0.5">14 Unit Tests + 10 Compliance Scenarios + API integration.</p>
          </div>
        </div>
      </div>

      {/* Deterministic Validation Rules */}
      <div className="bg-study-surface border border-study-border rounded-xl p-6 shadow-xs space-y-4">
        <h2 className="font-heading font-bold text-lg text-study-navy flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <span>Independent Deterministic Validator Rules</span>
        </h2>
        <p className="text-xs text-study-slate">
          Implemented in <code className="text-xs font-mono bg-study-ivory px-1 py-0.5 rounded border border-study-border">backend/app/core/validator.py</code>, operating completely independently of LLM weights:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded border border-study-border bg-study-ivory/50">
            <strong className="text-study-navy">Rule 1: Time Budget Boundary</strong>
            <p className="text-[11px] text-study-slate mt-0.5">
              Sum of study durations &le; available daily study hours limit.
            </p>
          </div>
          <div className="p-3 rounded border border-study-border bg-study-ivory/50">
            <strong className="text-study-navy">Rule 2: Chronological Continuity</strong>
            <p className="text-[11px] text-study-slate mt-0.5">
              Sessions are strictly non-overlapping (start_N &ge; end_N-1).
            </p>
          </div>
          <div className="p-3 rounded border border-study-border bg-study-ivory/50">
            <strong className="text-study-navy">Rule 3: Positive Time Flow</strong>
            <p className="text-[11px] text-study-slate mt-0.5">
              End time strictly later than start time (end &gt; start).
            </p>
          </div>
          <div className="p-3 rounded border border-study-border bg-study-ivory/50">
            <strong className="text-study-navy">Rule 4: Mathematical Equality</strong>
            <p className="text-[11px] text-study-slate mt-0.5">
              Declared duration_min == (end_time - start_time) in minutes.
            </p>
          </div>
          <div className="p-3 rounded border border-study-border bg-study-ivory/50">
            <strong className="text-study-navy">Rule 5: Allowed Session Types</strong>
            <p className="text-[11px] text-study-slate mt-0.5">
              Strictly restricted to 'study', 'revision', 'practice', or 'break'.
            </p>
          </div>
          <div className="p-3 rounded border border-study-border bg-study-ivory/50">
            <strong className="text-study-navy">Rule 6: Rest Break Exclusion</strong>
            <p className="text-[11px] text-study-slate mt-0.5">
              Cognitive rest intervals are never counted against study budget.
            </p>
          </div>
          <div className="p-3 rounded border border-study-border bg-study-ivory/50">
            <strong className="text-study-navy">Rule 7: Course Fidelity</strong>
            <p className="text-[11px] text-study-slate mt-0.5">
              Flags any hallucinated subject not present in the user input.
            </p>
          </div>
          <div className="p-3 rounded border border-study-border bg-study-ivory/50">
            <strong className="text-study-navy">Rule 8: Underutilization Detection</strong>
            <p className="text-[11px] text-study-slate mt-0.5">
              Constructive advisory warning if &gt;35% of planned time is unassigned.
            </p>
          </div>
        </div>
      </div>

      {/* Limitations & Real Deployment Note */}
      <div className="bg-study-surface border border-study-border rounded-xl p-6 shadow-xs space-y-3">
        <h2 className="font-heading font-bold text-base text-study-navy flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-study-amber-dark" />
          <span>Hardware Requirements & Cloud Hosting Limitations</span>
        </h2>
        <div className="text-xs text-study-slate space-y-2 leading-relaxed">
          <p>
            <strong>Local Hardware Requirement:</strong> Running Qwen3 8B locally via Ollama requires ~6GB of system RAM/VRAM. On standard CPU systems, generation requires approximately 30 to 90 seconds per complete timetable. The built-in deterministic scheduler provides instantaneous (&lt;5ms) responses when immediate output is required.
          </p>
          <p>
            <strong>Zero-Cost Hosting Policy:</strong> Static frontend hosts (such as Vercel) cannot host an 8-billion parameter LLM runtime for free. For live academic evaluation, the backend runs locally on <code className="bg-study-ivory px-1 rounded font-mono text-study-navy">http://localhost:8000</code> and the React frontend on <code className="bg-study-ivory px-1 rounded font-mono text-study-navy">http://localhost:5173</code> with complete Ollama connectivity.
          </p>
        </div>
      </div>
    </div>
  );
};
