import React from 'react';
import { usePlan } from '../../context/PlanContext';
import {
  CalendarDays,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Calendar,
  Layers,
  ShieldCheck,
  Coffee
} from 'lucide-react';
import { ValidationBanner } from '../Common/ValidationBanner';

export const OverviewWorkspace: React.FC = () => {
  const {
    currentPlan,
    subjects,
    availableHours,
    validation,
    setActiveWorkspace,
    health
  } = usePlan();

  const sessions = currentPlan?.sessions || [];
  const completedSessions = sessions.filter(s => s.completed);
  const studySessions = sessions.filter(s => s.type !== 'break');
  const breakSessions = sessions.filter(s => s.type === 'break');

  const totalStudyMinutes = studySessions.reduce((sum, s) => sum + s.duration_min, 0);
  const totalBreakMinutes = breakSessions.reduce((sum, s) => sum + s.duration_min, 0);

  const nearestExam = subjects.reduce(
    (min, s) => (s.exam_in_days < min.exam_in_days ? s : min),
    subjects[0] || { subject: 'No active exams', exam_in_days: 0, priority: 'Low' }
  );

  const completionRate = studySessions.length > 0
    ? Math.round((completedSessions.length / studySessions.length) * 100)
    : 0;

  const isDemo = currentPlan?.engine?.toLowerCase().includes('demo') || currentPlan?.engine?.toLowerCase().includes('preset');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Product Hero / Intro Card */}
      <div className="bg-study-navy text-study-ivory rounded-xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-study-navy-light text-study-amber text-xs font-semibold uppercase tracking-wider mb-3 border border-study-amber/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Cognitive Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-study-ivory tracking-tight leading-tight">
            AI-Powered Personalized Study Plan Generator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-study-slate-light leading-relaxed">
            StudyFlow AI synthesizes your courses, upcoming examination deadlines, daily study capacity, and cognitive rest rhythm into mathematically verified timetables. Driven by local Qwen3 8B with deterministic Python constraint verification.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveWorkspace('planner')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-md bg-study-amber hover:bg-study-amber-dark text-study-navy font-semibold text-xs tracking-wide transition-colors shadow-sm"
            >
              <span>Configure Study Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveWorkspace('timetable')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-md bg-study-navy-light hover:bg-study-slate-dark text-study-ivory font-medium text-xs tracking-wide transition-colors border border-study-slate/40"
            >
              <span>View Full Timetable</span>
            </button>
            <button
              onClick={() => setActiveWorkspace('prompts')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-md bg-study-navy-light hover:bg-study-slate-dark text-study-slate-light hover:text-study-ivory font-medium text-xs tracking-wide transition-colors border border-study-slate/30"
            >
              <span>Explore Prompt Lab</span>
            </button>
          </div>
        </div>

        {/* Status watermark */}
        <div className="absolute right-6 bottom-4 hidden lg:block opacity-10 pointer-events-none">
          <span className="font-heading font-black text-8xl text-white">STUDY</span>
        </div>
      </div>

      {/* Honest Data State Label */}
      {isDemo && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-study-amber-light/70 border border-study-amber/40 rounded-lg text-xs text-study-amber-dark font-medium">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-study-amber-dark shrink-0" />
            <span>
              <strong>Demonstration State Active:</strong> The metrics below display the verified Three-Subject Crunch demonstration plan. Configure your courses in Study Planner to generate your personalized schedule.
            </span>
          </div>
          <button
            onClick={() => setActiveWorkspace('planner')}
            className="underline font-bold hover:text-study-navy shrink-0 ml-3"
          >
            Create Your Plan &rarr;
          </button>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Nearest Exam Card */}
        <div className="bg-study-surface border border-study-border rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-study-slate text-xs font-semibold uppercase tracking-wider">
            <span>Nearest Exam</span>
            <Calendar className="w-4 h-4 text-study-amber-dark" />
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-heading font-extrabold text-study-navy truncate">
              {nearestExam.exam_in_days} {nearestExam.exam_in_days === 1 ? 'Day' : 'Days'}
            </p>
            <p className="text-xs font-medium text-study-slate truncate mt-0.5">
              {nearestExam.subject}
            </p>
          </div>
        </div>

        {/* Daily Study Budget */}
        <div className="bg-study-surface border border-study-border rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-study-slate text-xs font-semibold uppercase tracking-wider">
            <span>Daily Budget</span>
            <Clock className="w-4 h-4 text-study-navy" />
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-heading font-extrabold text-study-navy">
              {availableHours} Hours
            </p>
            <p className="text-xs font-medium text-study-slate mt-0.5">
              {Math.round(availableHours * 60)} minutes maximum
            </p>
          </div>
        </div>

        {/* Scheduled Study Minutes */}
        <div className="bg-study-surface border border-study-border rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-study-slate text-xs font-semibold uppercase tracking-wider">
            <span>Scheduled Time</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-heading font-extrabold text-study-navy">
              {totalStudyMinutes}m
            </p>
            <p className="text-xs font-medium text-emerald-700 mt-0.5">
              {(totalStudyMinutes / 60).toFixed(1)}h planned study
            </p>
          </div>
        </div>

        {/* Rest Breaks Scheduled */}
        <div className="bg-study-surface border border-study-border rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-study-slate text-xs font-semibold uppercase tracking-wider">
            <span>Rest Breaks</span>
            <Coffee className="w-4 h-4 text-study-sage-dark" />
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-heading font-extrabold text-study-navy">
              {breakSessions.length} Blocks
            </p>
            <p className="text-xs font-medium text-study-slate mt-0.5">
              {totalBreakMinutes}m cognitive pause
            </p>
          </div>
        </div>

        {/* Study Completion */}
        <div className="bg-study-surface border border-study-border rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-study-slate text-xs font-semibold uppercase tracking-wider">
            <span>Progress</span>
            <CheckCircle2 className="w-4 h-4 text-study-navy" />
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-heading font-extrabold text-study-navy">
              {completionRate}%
            </p>
            <p className="text-xs font-medium text-study-slate mt-0.5">
              {completedSessions.length} of {studySessions.length} sessions done
            </p>
          </div>
        </div>
      </div>

      {/* Validation Status Banner */}
      {validation && <ValidationBanner validation={validation} />}

      {/* Main Workspace Dual Column Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Timetable Preview */}
        <div className="lg:col-span-2 bg-study-surface border border-study-border rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-study-border">
            <div>
              <h3 className="font-heading font-bold text-base text-study-navy">
                Today's Scheduled Sessions
              </h3>
              <p className="text-xs text-study-slate mt-0.5">
                Chronological timeline with active completion tracking
              </p>
            </div>
            <button
              onClick={() => setActiveWorkspace('timetable')}
              className="text-xs font-semibold text-study-amber-dark hover:text-study-navy flex items-center space-x-1"
            >
              <span>Full Timetable</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-12 text-study-slate">
              <CalendarDays className="w-8 h-8 mx-auto text-study-slate-light mb-2" />
              <p className="font-semibold text-sm text-study-navy">No Timetable Generated Yet</p>
              <p className="text-xs mt-1">Configure subjects in the Study Planner to create your day's schedule.</p>
              <button
                onClick={() => setActiveWorkspace('planner')}
                className="mt-4 px-4 py-2 rounded bg-study-navy text-study-ivory text-xs font-medium"
              >
                Go to Planner
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {sessions.slice(0, 5).map(session => (
                <div
                  key={session.id}
                  className={`p-3 rounded-md border text-xs flex items-center justify-between transition-colors ${
                    session.type === 'break'
                      ? 'bg-study-sage-light/40 border-study-sage/40 text-study-sage-dark'
                      : session.completed
                      ? 'bg-study-ivory/60 border-study-border text-study-slate line-through'
                      : 'bg-study-surface border-study-border text-study-navy hover:border-study-navy/40'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="font-mono font-semibold text-[11px] text-study-navy shrink-0">
                      {session.start} – {session.end}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold shrink-0 ${
                        session.type === 'break'
                          ? 'bg-study-sage text-study-sage-dark'
                          : session.type === 'revision'
                          ? 'bg-study-amber-light text-study-amber-dark border border-study-amber/30'
                          : 'bg-study-ivory text-study-navy border border-study-border'
                      }`}
                    >
                      {session.type}
                    </span>
                    <div className="truncate">
                      <span className="font-bold text-study-navy mr-2">{session.subject}</span>
                      <span className="text-study-slate truncate hidden sm:inline">{session.task}</span>
                    </div>
                  </div>

                  <span className="shrink-0 text-[11px] font-semibold text-study-slate ml-3">
                    {session.duration_min}m
                  </span>
                </div>
              ))}

              {sessions.length > 5 && (
                <p className="text-center text-xs text-study-slate pt-2 font-medium">
                  + {sessions.length - 5} more sessions scheduled in full timetable.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right 1 Col: Active Subjects & Quick Navigation */}
        <div className="space-y-6">
          {/* Active Subjects Summary Card */}
          <div className="bg-study-surface border border-study-border rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-study-border">
              <h3 className="font-heading font-bold text-sm text-study-navy">
                Course Subjects ({subjects.length})
              </h3>
              <button
                onClick={() => setActiveWorkspace('planner')}
                className="text-xs font-semibold text-study-amber-dark hover:text-study-navy"
              >
                Edit
              </button>
            </div>

            <div className="space-y-2">
              {subjects.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded bg-study-ivory border border-study-border text-xs"
                >
                  <div className="truncate pr-2">
                    <p className="font-bold text-study-navy truncate">{s.subject}</p>
                    <p className="text-[10px] text-study-slate mt-0.5">
                      Exam in <strong className="text-study-navy">{s.exam_in_days}</strong> days
                    </p>
                  </div>
                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      s.priority === 'High'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : s.priority === 'Medium'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}
                  >
                    {s.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Workflow Stepper */}
          <div className="bg-study-surface border border-study-border rounded-lg p-5 shadow-xs">
            <h3 className="font-heading font-bold text-sm text-study-navy mb-3 pb-2 border-b border-study-border">
              Core System Pipeline
            </h3>
            <ol className="relative border-l border-study-border space-y-3.5 ml-2">
              <li className="ml-3 text-xs">
                <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-study-navy border border-white" />
                <strong className="text-study-navy">1. Academic Input</strong>
                <p className="text-[11px] text-study-slate">Courses, priorities, and daily study hours.</p>
              </li>
              <li className="ml-3 text-xs">
                <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-study-amber-dark border border-white" />
                <strong className="text-study-navy">2. Structured Prompt Engineering</strong>
                <p className="text-[11px] text-study-slate">Negative constraints & cognitive rest bounds.</p>
              </li>
              <li className="ml-3 text-xs">
                <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-study-navy border border-white" />
                <strong className="text-study-navy">3. Local Ollama Qwen3 8B</strong>
                <p className="text-[11px] text-study-slate">Zero external telemetry, 100% private inference.</p>
              </li>
              <li className="ml-3 text-xs">
                <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-emerald-600 border border-white" />
                <strong className="text-study-navy">4. Deterministic Python Validator</strong>
                <p className="text-[11px] text-study-slate">Independent verification of time intervals & non-overlap.</p>
              </li>
              <li className="ml-3 text-xs">
                <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-study-navy border border-white" />
                <strong className="text-study-navy">5. Adaptive Rescheduler</strong>
                <p className="text-[11px] text-study-slate">Preserves completed work and computes deltas.</p>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
