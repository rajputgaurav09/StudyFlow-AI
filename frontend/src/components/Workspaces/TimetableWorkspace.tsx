import { useState } from 'react';
import { usePlan } from '../../context/PlanContext';
import { api } from '../../api/client';
import {
  CheckCircle2,
  FileText,
  FileCode,
  Coffee,
  Filter,
  CheckSquare,
  Square,
  CalendarDays,
  Info
} from 'lucide-react';
import { ValidationBanner } from '../Common/ValidationBanner';

export const TimetableWorkspace: React.FC = () => {
  const {
    currentPlan,
    validation,
    toggleSessionCompletion,
    setActiveWorkspace
  } = usePlan();

  const [typeFilter, setTypeFilter] = useState<string>('all');

  const sessions = currentPlan?.sessions || [];
  const completedCount = sessions.filter(s => s.completed).length;
  const studySessions = sessions.filter(s => s.type !== 'break');
  const progressPercent = studySessions.length > 0
    ? Math.round((completedCount / studySessions.length) * 100)
    : 0;

  const filteredSessions = sessions.filter(s => {
    if (typeFilter === 'all') return true;
    if (typeFilter === 'study') return s.type === 'study';
    if (typeFilter === 'revision') return s.type === 'revision';
    if (typeFilter === 'break') return s.type === 'break';
    return true;
  });

  const handleDownloadJson = () => {
    window.open(api.getExportJsonUrl(), '_blank');
  };

  const handleDownloadMarkdown = () => {
    window.open(api.getExportMarkdownUrl(), '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Export Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-study-surface border border-study-border p-6 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-study-navy" />
            <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-study-navy tracking-tight">
              My Timetable & Session Tracker
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-study-slate mt-1">
            Chronological daily study slots with active task verification and independent constraint validation.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadJson}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-md bg-study-ivory hover:bg-study-amber-light border border-study-border text-study-navy text-xs font-semibold transition-colors"
            title="Download complete schedule and academic metadata in JSON format"
          >
            <FileCode className="w-4 h-4 text-study-amber-dark" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handleDownloadMarkdown}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-md bg-study-ivory hover:bg-study-amber-light border border-study-border text-study-navy text-xs font-semibold transition-colors"
            title="Download clean Markdown formatted timetable"
          >
            <FileText className="w-4 h-4 text-study-navy" />
            <span>Export Markdown</span>
          </button>
          <button
            onClick={() => setActiveWorkspace('reschedule')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-md bg-study-navy hover:bg-study-navy-light text-study-ivory text-xs font-semibold transition-colors shadow-xs"
          >
            <span>Report Disruption</span>
          </button>
        </div>
      </div>

      {/* Live Study Progress Bar Card */}
      <div className="bg-study-surface border border-study-border rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-heading font-bold text-study-navy">
              Execution Progress: {completedCount} of {studySessions.length} Study Sessions Completed
            </span>
          </div>
          <span className="font-mono font-extrabold text-study-navy text-sm">
            {progressPercent}%
          </span>
        </div>
        <div className="w-full bg-study-ivory border border-study-border rounded-full h-3 overflow-hidden">
          <div
            className="bg-study-amber-dark h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-study-slate mt-2">
          <span>Tick checkboxes below as you complete each session block.</span>
          <span>Engine: <strong className="text-study-navy">{currentPlan?.engine || 'Local Scheduler'}</strong></span>
        </div>
      </div>

      {/* Validation Banner */}
      {validation && <ValidationBanner validation={validation} />}

      {/* Filter and Session Count Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-study-slate" />
          <span className="font-semibold text-study-slate">Filter Sessions:</span>
          {['all', 'study', 'revision', 'break'].map(filterKey => (
            <button
              key={filterKey}
              onClick={() => setTypeFilter(filterKey)}
              className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                typeFilter === filterKey
                  ? 'bg-study-navy text-study-ivory shadow-xs'
                  : 'bg-study-surface border border-study-border text-study-slate hover:text-study-navy'
              }`}
            >
              {filterKey}
            </button>
          ))}
        </div>
        <div className="text-study-slate text-xs font-medium">
          Showing <strong className="text-study-navy">{filteredSessions.length}</strong> of {sessions.length} sessions
        </div>
      </div>

      {/* Chronological Timetable Cards & Table */}
      {sessions.length === 0 ? (
        <div className="bg-study-surface border border-study-border rounded-xl p-12 text-center text-study-slate">
          <CalendarDays className="w-10 h-10 mx-auto text-study-slate-light mb-3" />
          <h3 className="font-heading font-bold text-base text-study-navy">No Timetable Active</h3>
          <p className="text-xs text-study-slate max-w-md mx-auto mt-1">
            Configure your courses in the Study Planner to synthesize a personalized schedule.
          </p>
          <button
            onClick={() => setActiveWorkspace('planner')}
            className="mt-4 px-4 py-2 rounded bg-study-navy text-study-ivory text-xs font-semibold"
          >
            Open Study Planner
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session, idx) => {
            const isBreak = session.type === 'break';
            const isCompleted = session.completed;

            return (
              <div
                key={session.id || idx}
                className={`p-4 rounded-xl border transition-all ${
                  isBreak
                    ? 'bg-study-sage-light/30 border-study-sage/40'
                    : isCompleted
                    ? 'bg-study-ivory/50 border-study-border/70 opacity-75'
                    : 'bg-study-surface border-study-border hover:border-study-navy/50 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Left: Checkbox + Time + Badges */}
                  <div className="flex items-start sm:items-center space-x-3.5 min-w-0">
                    {/* Completion Checkbox */}
                    {!isBreak ? (
                      <button
                        onClick={() => toggleSessionCompletion(session.id)}
                        className="p-1 rounded text-study-navy hover:text-study-amber-dark shrink-0 transition-transform active:scale-95"
                        title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
                        aria-label={`Toggle completion for ${session.subject}`}
                      >
                        {isCompleted ? (
                          <CheckSquare className="w-5 h-5 text-emerald-700" />
                        ) : (
                          <Square className="w-5 h-5 text-study-slate hover:text-study-navy" />
                        )}
                      </button>
                    ) : (
                      <div className="p-1 shrink-0">
                        <Coffee className="w-5 h-5 text-study-sage-dark" />
                      </div>
                    )}

                    {/* Time Window */}
                    <div className="font-mono font-bold text-xs sm:text-sm text-study-navy shrink-0 min-w-[105px]">
                      {session.start} – {session.end}
                    </div>

                    {/* Type Tag */}
                    <span
                      className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded tracking-wider shrink-0 ${
                        isBreak
                          ? 'bg-study-sage text-study-sage-dark'
                          : session.type === 'revision'
                          ? 'bg-study-amber-light text-study-amber-dark border border-study-amber/30'
                          : 'bg-study-ivory text-study-navy border border-study-border'
                      }`}
                    >
                      {session.type}
                    </span>

                    {/* Subject & Task */}
                    <div className="min-w-0 truncate">
                      <div className="flex items-center space-x-2">
                        <h4
                          className={`font-heading font-bold text-sm tracking-tight text-study-navy truncate ${
                            isCompleted ? 'line-through text-study-slate' : ''
                          }`}
                        >
                          {session.subject}
                        </h4>
                        {isCompleted && (
                          <span className="text-[10px] font-bold text-emerald-800 uppercase px-1.5 py-0.2 rounded bg-emerald-100">
                            Completed
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs mt-0.5 truncate ${
                          isCompleted ? 'line-through text-study-slate/70' : 'text-study-slate'
                        }`}
                      >
                        {session.task}
                      </p>
                    </div>
                  </div>

                  {/* Right: Duration pill */}
                  <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
                    <span className="text-xs font-mono font-semibold text-study-slate px-2.5 py-1 rounded bg-study-ivory border border-study-border">
                      {session.duration_min} min
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assumptions Footer Card */}
      {currentPlan?.assumptions && currentPlan.assumptions.length > 0 && (
        <div className="bg-study-surface border border-study-border rounded-xl p-5 shadow-xs">
          <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-study-slate flex items-center space-x-1.5 mb-2.5">
            <Info className="w-3.5 h-3.5 text-study-navy" />
            <span>Scheduling Assumptions & Cognitive Notes</span>
          </h4>
          <ul className="text-xs text-study-slate space-y-1 list-disc list-inside">
            {currentPlan.assumptions.map((a, idx) => (
              <li key={idx} className="leading-relaxed">{a}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
