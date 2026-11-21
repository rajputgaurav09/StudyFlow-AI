import React from 'react';
import { PlanValidation } from '../../types';
import { CheckCircle2, AlertTriangle, XCircle, Info, ShieldCheck } from 'lucide-react';

interface Props {
  validation: PlanValidation | null;
  className?: string;
}

export const ValidationBanner: React.FC<Props> = ({ validation, className = '' }) => {
  if (!validation) return null;

  const {
    valid,
    errors,
    warnings,
    actual_study_minutes,
    available_study_minutes,
    break_minutes,
    session_count,
    subject_breakdown
  } = validation;

  return (
    <div
      className={`rounded-lg border p-4.5 transition-all ${
        valid
          ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950'
          : 'bg-rose-50/70 border-rose-200 text-rose-950'
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {valid ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="flex items-center space-x-2.5">
              <h4 className="font-heading font-bold text-sm tracking-tight">
                {valid ? 'Deterministic Validation: Verified Compliant' : 'Schedule Constraints Violated'}
              </h4>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase ${
                  valid ? 'bg-emerald-200/70 text-emerald-800' : 'bg-rose-200 text-rose-800'
                }`}
              >
                {valid ? 'All Rules Passed' : `${errors.length} Error(s)`}
              </span>
            </div>
            <p className="text-xs text-study-slate mt-1">
              Independent Python rule-engine checked non-overlap, interval math, budget limit, and break exclusion.
            </p>
          </div>
        </div>

        {/* Math summary badges */}
        <div className="hidden sm:flex items-center space-x-3 text-xs">
          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold text-study-slate">Study Time</span>
            <span className="font-semibold text-study-navy">
              {actual_study_minutes}m / {available_study_minutes}m
            </span>
          </div>
          <div className="h-7 w-[1px] bg-study-border" />
          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold text-study-slate">Rest Breaks</span>
            <span className="font-semibold text-study-navy">{break_minutes}m</span>
          </div>
          <div className="h-7 w-[1px] bg-study-border" />
          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold text-study-slate">Sessions</span>
            <span className="font-semibold text-study-navy">{session_count}</span>
          </div>
        </div>
      </div>

      {/* Errors List */}
      {errors.length > 0 && (
        <div className="mt-3.5 pt-3 border-t border-rose-200/80 space-y-1.5">
          <p className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center space-x-1.5">
            <XCircle className="w-3.5 h-3.5" />
            <span>Violations Flagged</span>
          </p>
          <ul className="text-xs space-y-1 text-rose-900 list-disc list-inside">
            {errors.map((e, idx) => (
              <li key={idx} className="leading-relaxed">{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings List */}
      {warnings.length > 0 && (
        <div className="mt-3 pt-3 border-t border-amber-200/60 space-y-1.5">
          <p className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Advisory Warnings ({warnings.length})</span>
          </p>
          <ul className="text-xs space-y-1 text-amber-900 list-disc list-inside">
            {warnings.map((w, idx) => (
              <li key={idx} className="leading-relaxed">{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Subject breakdown pill row */}
      {Object.keys(subject_breakdown).length > 0 && (
        <div className="mt-3 pt-3 border-t border-study-border/60 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-study-slate">Subject Allocations:</span>
          {Object.entries(subject_breakdown).map(([subj, mins]) => (
            <span
              key={subj}
              className="text-xs px-2 py-0.5 rounded bg-study-surface border border-study-border text-study-navy font-medium"
            >
              <strong>{subj}</strong>: {mins}m ({Math.round((mins / (actual_study_minutes || 1)) * 100)}%)
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
