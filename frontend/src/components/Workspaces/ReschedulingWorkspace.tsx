import React, { useState } from 'react';
import { usePlan } from '../../context/PlanContext';
import { RescheduleResult } from '../../types';
import {
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  GitCompare,
  ListPlus
} from 'lucide-react';
import { ValidationBanner } from '../Common/ValidationBanner';

export const ReschedulingWorkspace: React.FC = () => {
  const {
    currentPlan,
    reschedulePlan,
    rescheduling,
    error,
    validation,
    setActiveWorkspace
  } = usePlan();

  const [missedDesc, setMissedDesc] = useState('Missed morning study session due to sudden department meeting');
  const [revisedHours, setRevisedHours] = useState(2.5);
  const [resumptionTime, setResumptionTime] = useState('14:00');
  const [lastResult, setLastResult] = useState<RescheduleResult | null>(null);

  const sessions = currentPlan?.sessions || [];
  const completedSessions = sessions.filter(s => s.completed);

  const handleExecuteReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!missedDesc.trim()) return;

    const res = await reschedulePlan(revisedHours, missedDesc.trim(), resumptionTime);
    if (res) {
      setLastResult(res);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="bg-study-surface border border-study-border p-6 rounded-xl shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-study-amber-dark" />
          <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-study-navy tracking-tight">
            Adaptive Schedule Rescheduler & Delta Engine
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-study-slate mt-1 max-w-3xl">
          When reality disrupts your planned day, StudyFlow AI adaptively recalculates your timetable. Completed sessions are locked and preserved without loss or duplication, while uncompleted topics are redistributed into your revised time window.
        </p>
      </div>

      {/* Disruption Form & Parameter Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form (1 Col) */}
        <div className="bg-study-surface border border-study-border rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-base text-study-navy pb-2 border-b border-study-border">
            Report Disruption & Adjust Availability
          </h3>

          <form onSubmit={handleExecuteReschedule} className="space-y-4 text-xs">
            {/* Disruption Description */}
            <div>
              <label className="block font-semibold text-study-navy mb-1">
                Disruption Event / Reason
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe what interrupted your schedule (e.g. Traffic delay, doctor appointment, urgent meeting)"
                value={missedDesc}
                onChange={e => setMissedDesc(e.target.value)}
                className="w-full px-3 py-2 rounded border border-study-border bg-study-ivory text-xs text-study-navy focus:outline-none focus:border-study-navy resize-none"
              />
            </div>

            {/* Remaining Hours Slider */}
            <div>
              <div className="flex items-center justify-between font-semibold mb-1">
                <span className="text-study-navy">Remaining Study Window</span>
                <span className="text-study-amber-dark font-extrabold font-mono text-sm">
                  {revisedHours}h ({Math.round(revisedHours * 60)} min)
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="8.0"
                step="0.5"
                value={revisedHours}
                onChange={e => setRevisedHours(parseFloat(e.target.value))}
                className="w-full accent-study-amber-dark cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-study-slate mt-1">
                <span>0.5h</span>
                <span>2.0h</span>
                <span>4.0h</span>
                <span>8.0h</span>
              </div>
            </div>

            {/* Resumption Time */}
            <div>
              <label className="block font-semibold text-study-navy mb-1">
                Resumption Start Time
              </label>
              <input
                type="time"
                value={resumptionTime}
                onChange={e => setResumptionTime(e.target.value)}
                className="w-full px-3 py-2 rounded border border-study-border bg-study-ivory text-xs text-study-navy font-mono focus:outline-none focus:border-study-navy"
              />
            </div>

            {/* Invariant Guarantee Box */}
            <div className="p-3 rounded-lg bg-study-sage-light/50 border border-study-sage/50 text-study-sage-dark space-y-1">
              <div className="flex items-center space-x-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>State Preservation Guarantee</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Currently <strong className="text-study-navy">{completedSessions.length} session(s)</strong> marked completed. These will remain permanently preserved at their original timestamps.
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {error}
              </div>
            )}

            {/* Action CTA */}
            <button
              type="submit"
              disabled={rescheduling}
              className={`w-full py-3 px-4 rounded-md font-heading font-bold text-sm tracking-wide transition-all shadow-sm flex items-center justify-center space-x-2 ${
                rescheduling
                  ? 'bg-study-slate-light text-study-slate cursor-not-allowed'
                  : 'bg-study-navy hover:bg-study-navy-light text-study-ivory hover:shadow-md'
              }`}
            >
              {rescheduling ? (
                <>
                  <div className="w-4 h-4 border-2 border-study-ivory border-t-transparent rounded-full animate-spin" />
                  <span>Computing Rescheduled Timetable...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 text-study-amber" />
                  <span>Execute Adaptive Rescheduling</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right 2 Cols: Delta Summary & Before/After Comparison */}
        <div className="lg:col-span-2 space-y-6">
          {/* Explicit Delta Summary Card */}
          <div className="bg-study-surface border border-study-border rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-study-border">
              <div className="flex items-center space-x-2">
                <ListPlus className="w-4 h-4 text-study-amber-dark" />
                <h3 className="font-heading font-bold text-base text-study-navy">
                  Adaptive Delta Summary & Modifications
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-study-ivory text-study-slate border border-study-border">
                Prompt V3 Output
              </span>
            </div>

            {lastResult?.delta_summary && lastResult.delta_summary.length > 0 ? (
              <div className="space-y-2">
                {lastResult.delta_summary.map((delta, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-2.5 p-3 rounded-md bg-study-ivory border border-study-border text-xs text-study-navy leading-relaxed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{delta}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-md bg-study-ivory border border-study-border text-xs text-study-slate">
                <p className="font-semibold text-study-navy mb-1">No Rescheduling Recorded Yet</p>
                <p>Submit the disruption report on the left to recalculate your remaining day. The delta engine will output an itemized log of all shifts, retentions, and duration adjustments.</p>
              </div>
            )}
          </div>

          {/* Revised Sessions Preview */}
          <div className="bg-study-surface border border-study-border rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-study-border">
              <div className="flex items-center space-x-2">
                <GitCompare className="w-4 h-4 text-study-navy" />
                <h3 className="font-heading font-bold text-base text-study-navy">
                  Current Schedule State ({sessions.length} Sessions)
                </h3>
              </div>
              <button
                onClick={() => setActiveWorkspace('timetable')}
                className="text-xs font-semibold text-study-amber-dark hover:text-study-navy flex items-center space-x-1"
              >
                <span>Open Timetable</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {sessions.map((s, idx) => (
                <div
                  key={s.id || idx}
                  className={`p-3 rounded-md border text-xs flex items-center justify-between ${
                    s.completed
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-medium'
                      : s.type === 'break'
                      ? 'bg-study-sage-light/30 border-study-sage/40 text-study-sage-dark'
                      : 'bg-study-ivory border-study-border text-study-navy'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="font-mono font-bold shrink-0">{s.start} – {s.end}</span>
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        s.completed
                          ? 'bg-emerald-200 text-emerald-800'
                          : s.type === 'break'
                          ? 'bg-study-sage text-study-sage-dark'
                          : 'bg-white border border-study-border text-study-slate'
                      }`}
                    >
                      {s.completed ? 'Preserved Completed' : s.type}
                    </span>
                    <span className="font-bold truncate">{s.subject}</span>
                    <span className="text-study-slate truncate hidden sm:inline">{s.task}</span>
                  </div>
                  <span className="font-mono text-study-slate shrink-0 ml-2">{s.duration_min}m</span>
                </div>
              ))}
            </div>
          </div>

          {/* Validation Banner */}
          {validation && <ValidationBanner validation={validation} />}
        </div>
      </div>
    </div>
  );
};
