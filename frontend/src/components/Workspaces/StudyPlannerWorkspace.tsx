import { useState } from 'react';
import { usePlan } from '../../context/PlanContext';
import { Subject, Priority, Preset } from '../../types';
import {
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  AlertCircle,
  Flame,
  CheckCircle2,
  Edit2
} from 'lucide-react';
import { ValidationBanner } from '../Common/ValidationBanner';

export const StudyPlannerWorkspace: React.FC = () => {
  const {
    subjects,
    addSubject,
    updateSubject,
    removeSubject,
    availableHours,
    setAvailableHours,
    startTime,
    setStartTime,
    breakDuration,
    setBreakDuration,
    promptVersion,
    setPromptVersion,
    extraInstructions,
    setExtraInstructions,
    generatePlan,
    loading,
    error,
    validation,
    applyPreset,
    health
  } = usePlan();

  // Form states for new subject
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjDays, setNewSubjDays] = useState(5);
  const [newSubjPriority, setNewSubjPriority] = useState<Priority>('Medium');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Editing subject states
  const [editName, setEditName] = useState('');
  const [editDays, setEditDays] = useState(5);
  const [editPriority, setEditPriority] = useState<Priority>('Medium');

  const presets: Preset[] = [
    {
      id: 'preset-crunch',
      title: 'Three-Subject Crunch',
      description: '3 imminent subjects (3, 5, 7 days) with 4.0h intensive allocation.',
      subjects: [
        { subject: 'Automata Theory', exam_in_days: 3, priority: 'High' },
        { subject: 'C Programming', exam_in_days: 5, priority: 'Medium' },
        { subject: 'AI/ML Systems', exam_in_days: 7, priority: 'Medium' }
      ],
      available_hours: 4.0,
      start_time: '09:00'
    },
    {
      id: 'preset-urgent',
      title: 'Urgent Single Exam',
      description: '1 urgent exam tomorrow (1 day, High) + 1 distant subject (12 days, Low).',
      subjects: [
        { subject: 'Operating Systems', exam_in_days: 1, priority: 'High' },
        { subject: 'Web Technologies', exam_in_days: 12, priority: 'Low' }
      ],
      available_hours: 3.5,
      start_time: '08:30'
    },
    {
      id: 'preset-multi',
      title: 'Multiple Back-to-Back Exams',
      description: '3 concurrent exams in 2, 3, and 4 days. 5.0h balanced multi-exam prep.',
      subjects: [
        { subject: 'Discrete Mathematics', exam_in_days: 2, priority: 'High' },
        { subject: 'Computer Networks', exam_in_days: 3, priority: 'High' },
        { subject: 'Database Management', exam_in_days: 4, priority: 'High' }
      ],
      available_hours: 5.0,
      start_time: '08:00'
    }
  ];

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim()) return;
    addSubject({
      subject: newSubjName.trim(),
      exam_in_days: Number(newSubjDays),
      priority: newSubjPriority
    });
    setNewSubjName('');
    setNewSubjDays(5);
    setNewSubjPriority('Medium');
  };

  const handleStartEdit = (idx: number, s: Subject) => {
    setEditingIndex(idx);
    setEditName(s.subject);
    setEditDays(s.exam_in_days);
    setEditPriority(s.priority);
  };

  const handleSaveEdit = (idx: number) => {
    if (!editName.trim()) return;
    updateSubject(idx, {
      subject: editName.trim(),
      exam_in_days: Number(editDays),
      priority: editPriority
    });
    setEditingIndex(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-study-surface border border-study-border p-6 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-study-amber-dark" />
            <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-study-navy tracking-tight">
              Study Planner & Course Synthesizer
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-study-slate mt-1 max-w-2xl">
            Input courses, exam deadlines, and daily study limits. StudyFlow AI calculates priority weighting and generates a mathematically compliant schedule.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-study-slate flex items-center space-x-1">
            <Flame className="w-3.5 h-3.5 text-study-amber-dark" />
            <span>Presets:</span>
          </span>
          {presets.map(p => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              className="text-xs px-2.5 py-1.5 rounded-md bg-study-ivory hover:bg-study-amber-light border border-study-border hover:border-study-amber text-study-navy font-medium transition-colors"
              title={p.description}
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Subject Manager Table & Add Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Subjects List */}
          <div className="bg-study-surface border border-study-border rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-study-border">
              <div>
                <h3 className="font-heading font-bold text-base text-study-navy">
                  Active Course Subjects ({subjects.length})
                </h3>
                <p className="text-xs text-study-slate mt-0.5">
                  Ordered by exam urgency (days remaining) and declared priority
                </p>
              </div>
            </div>

            {subjects.length === 0 ? (
              <div className="text-center py-8 text-study-slate">
                <AlertCircle className="w-8 h-8 mx-auto text-study-slate-light mb-2" />
                <p className="text-sm font-semibold text-study-navy">No subjects added</p>
                <p className="text-xs mt-1">Use the form below or pick a preset to add courses.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-study-border text-study-slate font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Subject Name</th>
                      <th className="py-2.5 px-3">Exam Deadline</th>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-study-border/60">
                    {subjects.map((s, idx) => {
                      const isEditing = editingIndex === idx;

                      if (isEditing) {
                        return (
                          <tr key={idx} className="bg-study-amber-light/30">
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                className="w-full px-2 py-1 rounded border border-study-amber bg-white text-xs text-study-navy font-semibold focus:outline-none"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex items-center space-x-1.5">
                                <input
                                  type="number"
                                  min="1"
                                  max="365"
                                  value={editDays}
                                  onChange={e => setEditDays(Number(e.target.value))}
                                  className="w-16 px-2 py-1 rounded border border-study-amber bg-white text-xs text-study-navy focus:outline-none"
                                />
                                <span className="text-study-slate">days</span>
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <select
                                value={editPriority}
                                onChange={e => setEditPriority(e.target.value as Priority)}
                                className="px-2 py-1 rounded border border-study-amber bg-white text-xs text-study-navy focus:outline-none"
                              >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                              </select>
                            </td>
                            <td className="py-2 px-3 text-right space-x-2">
                              <button
                                onClick={() => handleSaveEdit(idx)}
                                className="px-2.5 py-1 rounded bg-study-navy text-study-ivory font-semibold text-[11px] hover:bg-study-navy-light"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingIndex(null)}
                                className="px-2.5 py-1 rounded bg-study-ivory text-study-slate font-semibold text-[11px] hover:text-study-navy border border-study-border"
                              >
                                Cancel
                              </button>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={idx} className="hover:bg-study-ivory/50 transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-bold text-study-navy text-sm">{s.subject}</span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center space-x-1.5 text-study-slate">
                              <Calendar className="w-3.5 h-3.5 text-study-amber-dark" />
                              <span>
                                In <strong className="text-study-navy">{s.exam_in_days}</strong> {s.exam_in_days === 1 ? 'day' : 'days'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                                s.priority === 'High'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : s.priority === 'Medium'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-800 border border-slate-200'
                              }`}
                            >
                              {s.priority}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right space-x-1.5">
                            <button
                              onClick={() => handleStartEdit(idx, s)}
                              className="p-1 rounded text-study-slate hover:text-study-navy hover:bg-study-ivory"
                              title="Edit Subject"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => removeSubject(idx)}
                              className="p-1 rounded text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                              title="Delete Subject"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Quick Add Form Inline */}
            <form onSubmit={handleAddSubject} className="mt-4 pt-4 border-t border-study-border">
              <p className="text-xs font-bold text-study-navy uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                <Plus className="w-3.5 h-3.5 text-study-amber-dark" />
                <span>Add Course Subject</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    required
                    placeholder="Subject name (e.g. Distributed Systems)"
                    value={newSubjName}
                    onChange={e => setNewSubjName(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-study-border bg-study-ivory text-xs text-study-navy placeholder:text-study-slate/70 focus:outline-none focus:border-study-navy"
                  />
                </div>
                <div className="sm:col-span-3">
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      max="365"
                      placeholder="Exam in days"
                      value={newSubjDays}
                      onChange={e => setNewSubjDays(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded border border-study-border bg-study-ivory text-xs text-study-navy focus:outline-none focus:border-study-navy pr-10"
                    />
                    <span className="absolute right-2.5 top-2 text-[11px] text-study-slate pointer-events-none">
                      days
                    </span>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <select
                    value={newSubjPriority}
                    onChange={e => setNewSubjPriority(e.target.value as Priority)}
                    className="w-full px-2 py-2 rounded border border-study-border bg-study-ivory text-xs text-study-navy focus:outline-none focus:border-study-navy"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full py-2 px-3 rounded bg-study-navy hover:bg-study-navy-light text-study-ivory font-semibold text-xs transition-colors flex items-center justify-center space-x-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Validation Banner if available */}
          {validation && <ValidationBanner validation={validation} />}
        </div>

        {/* Right 1 Col: Scheduling Budget & AI Controls */}
        <div className="space-y-6">
          <div className="bg-study-surface border border-study-border rounded-xl p-5 shadow-xs space-y-5">
            <h3 className="font-heading font-bold text-base text-study-navy pb-2 border-b border-study-border">
              Daily Study Parameters
            </h3>

            {/* Daily Hours Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-study-navy">Available Daily Study Hours</span>
                <span className="text-study-amber-dark font-extrabold font-mono text-sm">
                  {availableHours}h ({Math.round(availableHours * 60)} min)
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="12.0"
                step="0.5"
                value={availableHours}
                onChange={e => setAvailableHours(parseFloat(e.target.value))}
                className="w-full accent-study-amber-dark cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-study-slate mt-1">
                <span>1.0h</span>
                <span>4.0h</span>
                <span>8.0h</span>
                <span>12.0h</span>
              </div>
            </div>

            {/* Start Time & Break Duration */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-study-navy mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-study-border bg-study-ivory text-study-navy text-xs font-mono focus:outline-none focus:border-study-navy"
                />
              </div>
              <div>
                <label className="block font-semibold text-study-navy mb-1">
                  Break Interval
                </label>
                <select
                  value={breakDuration}
                  onChange={e => setBreakDuration(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded border border-study-border bg-study-ivory text-study-navy text-xs focus:outline-none focus:border-study-navy"
                >
                  <option value={10}>10 min</option>
                  <option value={15}>15 min</option>
                  <option value={20}>20 min</option>
                  <option value={30}>30 min</option>
                </select>
              </div>
            </div>

            {/* Prompt Version Selector */}
            <div>
              <label className="block font-semibold text-study-navy text-xs mb-1">
                Prompt Engineering Architecture
              </label>
              <select
                value={promptVersion}
                onChange={e => setPromptVersion(e.target.value)}
                className="w-full px-3 py-2 rounded border border-study-border bg-study-ivory text-study-navy text-xs font-semibold focus:outline-none focus:border-study-navy"
              >
                <option value="V2">Prompt V2: Structured Planning & Schema Enforcement</option>
                <option value="V3">Prompt V3: Adaptive Rescheduling Architecture</option>
                <option value="V1">Prompt V1: Milestone 1 Baseline (Comparative)</option>
              </select>
              <p className="text-[11px] text-study-slate mt-1">
                V2 enforces negative constraints & chronological continuity with zero time math errors.
              </p>
            </div>

            {/* Additional Constraints / Instructions */}
            <div>
              <label className="block font-semibold text-study-navy text-xs mb-1">
                Additional Constraints (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Schedule Automata Theory first in the morning; keep afternoon for C Programming."
                value={extraInstructions}
                onChange={e => setExtraInstructions(e.target.value)}
                className="w-full px-3 py-2 rounded border border-study-border bg-study-ivory text-xs text-study-navy placeholder:text-study-slate/70 focus:outline-none focus:border-study-navy resize-none"
              />
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                <p className="font-bold flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Generation Blocked</span>
                </p>
                <p className="mt-1 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Generate Action Button */}
            <button
              onClick={generatePlan}
              disabled={loading || subjects.length === 0}
              className={`w-full py-3 px-4 rounded-md font-heading font-bold text-sm tracking-wide transition-all shadow-sm flex items-center justify-center space-x-2 ${
                loading || subjects.length === 0
                  ? 'bg-study-slate-light/60 text-study-slate cursor-not-allowed'
                  : 'bg-study-navy hover:bg-study-navy-light text-study-ivory hover:shadow-md'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-study-ivory border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Timetable with Qwen3 8B...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-study-amber" />
                  <span>Generate Study Plan</span>
                </>
              )}
            </button>

            {/* Deterministic / Inference Mode Note */}
            <div className="text-[11px] text-study-slate flex items-start space-x-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-study-sage-dark shrink-0 mt-0.5" />
              <span>
                {health?.ollama_online
                  ? 'Local Qwen3 8B inference active (HTTP loopback to Ollama).'
                  : 'Ollama is offline. Generating mathematically validated timetable via local deterministic fallback.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
