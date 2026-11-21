import React, { useState, useEffect } from 'react';
import { usePlan } from '../../context/PlanContext';
import { PromptMetadata, PromptTestResult } from '../../types';
import { api } from '../../api/client';
import {
  FlaskConical,
  Play,
  CheckCircle2,
  AlertCircle,
  Copy
} from 'lucide-react';
import { ValidationBanner } from '../Common/ValidationBanner';

export const PromptLabWorkspace: React.FC = () => {
  const { subjects, availableHours, startTime, extraInstructions } = usePlan();

  const [prompts, setPrompts] = useState<PromptMetadata[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>('V2');
  const [activeTab, setActiveTab] = useState<'matrix' | 'inspector' | 'benchmark'>('benchmark');
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<PromptTestResult | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await api.getPrompts();
        setPrompts(list);
      } catch {
        // Fallback static prompt metadata if backend probe pending
        setPrompts([
          {
            version: 'V1',
            purpose: 'Baseline study planner prompt from Milestone 1 for comparative benchmarking.',
            changes: 'Initial baseline prompt (unstructured text/table generation).',
            expected_output: 'Unstructured text or Markdown table with timetable and assumptions.',
            limitations: 'Lacks deterministic JSON schema; allows time math errors and hallucinated durations; cannot be reliably parsed by automated Python verification.',
            template: 'Act as a student study planner...',
            raw_content: ''
          },
          {
            version: 'V2',
            purpose: 'Structured study plan generation with explicit JSON schema, negative constraint bounds, chronological continuity, and mathematical duration checks.',
            changes: 'Replaced ambiguous tabular text output with strict JSON schema; added negative bounds; enforced micro-tasks; added duration verification.',
            expected_output: 'Valid JSON object containing "sessions" array and "assumptions" array.',
            limitations: 'Does not support dynamic re-planning during execution drift (addressed in V3).',
            template: 'You are StudyFlow AI, an expert academic productivity engine...',
            raw_content: ''
          },
          {
            version: 'V3',
            purpose: 'Adaptive re-planning workflow following missed sessions, delayed tasks, or sudden changes in available daily hours. Preserves completed work and computes deltas.',
            changes: 'State preservation; re-allocation arithmetic; explicit delta tracking; high-priority catch-up strategy.',
            expected_output: 'Valid JSON containing "sessions" (preserved + revised), "delta_summary", and "assumptions".',
            limitations: 'Relies on student truthfulness regarding completed versus missed sessions.',
            template: 'You are StudyFlow AI Adaptive Rescheduling Engine...',
            raw_content: ''
          }
        ]);
      }
    };
    load();
  }, []);

  const currentMeta = prompts.find(p => p.version.toUpperCase() === selectedVersion.toUpperCase()) || prompts[1];

  const handleRunLiveTest = async () => {
    setTesting(true);
    setTestError(null);
    setTestResult(null);

    try {
      const res = await api.testPrompt({
        prompt_version: selectedVersion,
        subjects,
        available_hours: availableHours,
        start_time: startTime,
        extra_instructions: extraInstructions
      });
      setTestResult(res);
    } catch (err: any) {
      setTestError(err.message || 'Benchmark execution failed.');
    } finally {
      setTesting(false);
    }
  };

  const copyTemplate = () => {
    if (!currentMeta) return;
    navigator.clipboard.writeText(currentMeta.template || currentMeta.raw_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-study-surface border border-study-border p-6 rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <FlaskConical className="w-5 h-5 text-study-amber-dark" />
              <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-study-navy tracking-tight">
                Prompt Engineering Academic Laboratory
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-study-slate mt-1 max-w-3xl">
              Inspect prompt evolution from Milestone 1 baseline (V1) through Structured Planning (V2) to Adaptive Rescheduling (V3). Execute live model benchmarks with real latency instrumentation.
            </p>
          </div>

          {/* Version Selector Buttons */}
          <div className="flex items-center space-x-1.5 p-1 rounded-lg bg-study-ivory border border-study-border">
            {['V1', 'V2', 'V3'].map(v => (
              <button
                key={v}
                onClick={() => setSelectedVersion(v)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  selectedVersion === v
                    ? 'bg-study-navy text-study-ivory shadow-xs'
                    : 'text-study-slate hover:text-study-navy'
                }`}
              >
                Prompt {v}
              </button>
            ))}
          </div>
        </div>

        {/* Workspace Sub-tabs */}
        <div className="flex items-center space-x-4 mt-5 pt-4 border-t border-study-border text-xs font-semibold">
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'benchmark'
                ? 'border-study-amber-dark text-study-navy font-bold'
                : 'border-transparent text-study-slate hover:text-study-navy'
            }`}
          >
            Live Benchmark Runner
          </button>
          <button
            onClick={() => setActiveTab('inspector')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'inspector'
                ? 'border-study-amber-dark text-study-navy font-bold'
                : 'border-transparent text-study-slate hover:text-study-navy'
            }`}
          >
            Template Inspector & Metadata
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'matrix'
                ? 'border-study-amber-dark text-study-navy font-bold'
                : 'border-transparent text-study-slate hover:text-study-navy'
            }`}
          >
            Evolution Matrix & Comparison
          </button>
        </div>
      </div>

      {/* Tab 1: Live Benchmark Runner */}
      {activeTab === 'benchmark' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-study-surface border border-study-border p-5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-study-slate">
                  Active Test Target:
                </span>
                <span className="text-sm font-extrabold text-study-navy">
                  Prompt {selectedVersion} &bull; Local Qwen3 8B
                </span>
              </div>
              <p className="text-xs text-study-slate mt-0.5">
                Inputs: {subjects.length} subjects &bull; {availableHours}h daily budget &bull; Start at {startTime}
              </p>
            </div>

            <button
              onClick={handleRunLiveTest}
              disabled={testing}
              className={`px-5 py-2.5 rounded-md font-heading font-bold text-xs tracking-wide transition-all shadow-xs flex items-center space-x-2 ${
                testing
                  ? 'bg-study-slate-light text-study-slate cursor-not-allowed'
                  : 'bg-study-amber hover:bg-study-amber-dark text-study-navy hover:shadow-sm'
              }`}
            >
              {testing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-study-navy border-t-transparent rounded-full animate-spin" />
                  <span>Measuring Inference...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-study-navy" />
                  <span>Execute Live Benchmark Test</span>
                </>
              )}
            </button>
          </div>

          {/* Test Error */}
          {testError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
              <p className="font-bold flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 text-rose-700" />
                <span>Benchmark Failed</span>
              </p>
              <p className="mt-1 leading-relaxed">{testError}</p>
            </div>
          )}

          {/* Live Instrumentation Output */}
          {testResult && (
            <div className="space-y-6">
              {/* Telemetry Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-study-surface border border-study-border shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-study-slate">
                    Genuine Measured Latency
                  </span>
                  <p className="text-2xl font-mono font-extrabold text-study-navy mt-1">
                    {(testResult.latency_ms / 1000).toFixed(2)}s
                    <span className="text-xs font-normal text-study-slate ml-1">
                      ({testResult.latency_ms} ms)
                    </span>
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-study-surface border border-study-border shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-study-slate">
                    Execution Engine
                  </span>
                  <p className="text-lg font-bold text-study-navy mt-1 truncate">
                    {testResult.engine}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-study-surface border border-study-border shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-study-slate">
                    Validation Compliance
                  </span>
                  <p className="text-lg font-bold mt-1">
                    {testResult.validation?.valid ? (
                      <span className="text-emerald-700 flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Valid Schema & Math</span>
                      </span>
                    ) : testResult.prompt_version === 'V1' ? (
                      <span className="text-study-amber-dark flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>Unstructured Baseline</span>
                      </span>
                    ) : (
                      <span className="text-rose-700 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>Violations Found</span>
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Validation Banner if available */}
              {testResult.validation && (
                <ValidationBanner validation={testResult.validation} />
              )}

              {/* Raw Prompt and Raw Output Split */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Formatted Prompt Sent */}
                <div className="bg-study-surface border border-study-border rounded-xl p-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-study-border text-xs">
                    <span className="font-bold text-study-navy">Formatted Prompt Payload</span>
                    <span className="text-study-slate text-[11px] font-mono">
                      {testResult.raw_prompt.length} chars
                    </span>
                  </div>
                  <pre className="text-[11px] font-mono bg-study-ivory p-3 rounded-md text-study-navy overflow-x-auto max-h-96 whitespace-pre-wrap leading-relaxed">
                    {testResult.raw_prompt}
                  </pre>
                </div>

                {/* Raw Model Response */}
                <div className="bg-study-surface border border-study-border rounded-xl p-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-study-border text-xs">
                    <span className="font-bold text-study-navy">Model Output Stream</span>
                    <span className="text-study-slate text-[11px] font-mono">
                      {testResult.raw_response.length} chars
                    </span>
                  </div>
                  <pre className="text-[11px] font-mono bg-study-navy text-study-ivory p-3 rounded-md overflow-x-auto max-h-96 whitespace-pre-wrap leading-relaxed">
                    {testResult.raw_response}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Template Inspector */}
      {activeTab === 'inspector' && currentMeta && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Metadata Card (1 Col) */}
          <div className="bg-study-surface border border-study-border rounded-xl p-5 shadow-xs space-y-4 text-xs">
            <h3 className="font-heading font-bold text-base text-study-navy pb-2 border-b border-study-border">
              Prompt {currentMeta.version} Metadata
            </h3>

            <div>
              <span className="font-bold text-study-navy block mb-0.5">Academic Purpose</span>
              <p className="text-study-slate leading-relaxed">{currentMeta.purpose}</p>
            </div>

            <div>
              <span className="font-bold text-study-navy block mb-0.5">Evolution & Changes</span>
              <p className="text-study-slate leading-relaxed">{currentMeta.changes}</p>
            </div>

            <div>
              <span className="font-bold text-study-navy block mb-0.5">Expected Output Contract</span>
              <p className="text-study-slate leading-relaxed">{currentMeta.expected_output}</p>
            </div>

            <div>
              <span className="font-bold text-study-navy block mb-0.5">Identified Limitations</span>
              <p className="text-study-slate leading-relaxed">{currentMeta.limitations}</p>
            </div>
          </div>

          {/* Template Text (2 Cols) */}
          <div className="lg:col-span-2 bg-study-surface border border-study-border rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-study-border">
              <h3 className="font-heading font-bold text-sm text-study-navy">
                Raw Template Source Code ({currentMeta.version})
              </h3>
              <button
                onClick={copyTemplate}
                className="text-xs px-2.5 py-1 rounded bg-study-ivory border border-study-border text-study-navy font-semibold hover:bg-study-amber-light flex items-center space-x-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Template'}</span>
              </button>
            </div>

            <pre className="text-xs font-mono bg-study-ivory p-4 rounded-lg text-study-navy overflow-x-auto max-h-[500px] whitespace-pre-wrap leading-relaxed border border-study-border">
              {currentMeta.raw_content || currentMeta.template}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: Evolution Matrix */}
      {activeTab === 'matrix' && (
        <div className="bg-study-surface border border-study-border rounded-xl p-6 shadow-xs overflow-x-auto">
          <h3 className="font-heading font-bold text-base text-study-navy mb-1">
            Prompt Architecture Evolution Matrix
          </h3>
          <p className="text-xs text-study-slate mb-4">
            Structured comparison of milestones across schema enforcement, mathematical bounding, and adaptive state retention.
          </p>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-study-border text-study-slate uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-3">Evaluation Dimension</th>
                <th className="py-3 px-3 text-study-navy font-bold">Prompt V1 (Milestone 1)</th>
                <th className="py-3 px-3 text-study-amber-dark font-bold">Prompt V2 (Milestone 2)</th>
                <th className="py-3 px-3 text-emerald-800 font-bold">Prompt V3 (Adaptive Rebuild)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-study-border/60">
              <tr>
                <td className="py-3 px-3 font-bold text-study-navy">Output Structure</td>
                <td className="py-3 px-3 text-study-slate">Unstructured Text / Markdown Table</td>
                <td className="py-3 px-3 text-study-navy font-semibold">Strict JSON Schema</td>
                <td className="py-3 px-3 text-study-navy font-semibold">JSON with Delta Tracking</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-study-navy">Time Mathematics</td>
                <td className="py-3 px-3 text-rose-700">Prone to slot duration errors</td>
                <td className="py-3 px-3 text-emerald-700 font-semibold">start - end == duration enforced</td>
                <td className="py-3 px-3 text-emerald-700 font-semibold">Enforced + Resumption windowing</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-study-navy">Negative Constraints</td>
                <td className="py-3 px-3 text-study-slate">None specified</td>
                <td className="py-3 px-3 text-study-navy">Non-overlapping, break exclusion</td>
                <td className="py-3 px-3 text-study-navy">Non-overlap + Non-duplication</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-study-navy">Disruption Recovery</td>
                <td className="py-3 px-3 text-rose-700">Unsupported</td>
                <td className="py-3 px-3 text-rose-700">Requires full regeneration</td>
                <td className="py-3 px-3 text-emerald-700 font-semibold">Preserves completed work intact</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-study-navy">Task Granularity</td>
                <td className="py-3 px-3 text-study-slate">Passive topic titles</td>
                <td className="py-3 px-3 text-study-navy">Concrete, actionable micro-tasks</td>
                <td className="py-3 px-3 text-study-navy">Dynamic catch-up prioritization</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-study-navy">Python Validation Rate</td>
                <td className="py-3 px-3 text-rose-700 font-mono">0% (Parse failure)</td>
                <td className="py-3 px-3 text-emerald-700 font-mono font-bold">100% Pass</td>
                <td className="py-3 px-3 text-emerald-700 font-mono font-bold">100% Pass</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
