import React from 'react';
import { usePlan } from '../../context/PlanContext';
import { Sun, Moon, Clock, BookOpen } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentPlan, subjects, availableHours, health, theme, toggleTheme } = usePlan();

  const sessions = currentPlan?.sessions || [];
  const completedCount = sessions.filter(s => s.completed).length;
  const totalStudySessions = sessions.filter(s => s.type !== 'break').length;
  const progressPercent = totalStudySessions > 0
    ? Math.round((completedCount / totalStudySessions) * 100)
    : 0;

  return (
    <header className="sticky top-0 z-30 bg-study-surface border-b border-study-border px-6 py-3.5 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Brand & Wordmark */}
        <div className="flex items-center space-x-3.5">
          <div className="w-9 h-9 rounded bg-study-navy flex items-center justify-center text-study-ivory shadow-sm font-heading font-bold text-lg">
            S
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-heading font-extrabold text-xl text-study-navy tracking-tight">
                StudyFlow<span className="text-study-amber-dark">.AI</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-study-sage-light text-study-sage-dark border border-study-sage/40">
                PE-B25-52
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-study-ivory text-study-slate border border-study-border">
                Pool C20
              </span>
            </div>
            <p className="text-xs text-study-slate font-medium hidden sm:block">
              AI-Powered Personalized Study Plan Generator &bull; Team Innovex
            </p>
          </div>
        </div>

        {/* Live Context Indicators & Controls */}
        <div className="flex items-center space-x-5">
          {/* Progress Indicator */}
          {totalStudySessions > 0 && (
            <div className="hidden md:flex items-center space-x-3 px-3 py-1.5 rounded bg-study-ivory border border-study-border">
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-study-slate">
                  Progress
                </span>
                <span className="text-xs font-semibold text-study-navy">
                  {completedCount} of {totalStudySessions} Done ({progressPercent}%)
                </span>
              </div>
              <div className="w-16 bg-study-border rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-study-amber-dark h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Quick Stats Pill */}
          <div className="hidden lg:flex items-center space-x-4 text-xs text-study-slate">
            <div className="flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-study-slate" />
              <span><strong className="text-study-navy">{subjects.length}</strong> Subjects</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-study-slate" />
              <span><strong className="text-study-navy">{availableHours}h</strong> Budget</span>
            </div>
          </div>

          {/* Ollama Status Pill */}
          <div
            className={`flex items-center space-x-2 px-2.5 py-1 rounded text-xs font-medium border ${
              health?.ollama_online
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
            title={
              health?.ollama_online
                ? `Ollama Connected (Qwen3 8B active)`
                : 'Ollama is offline — Using deterministic fallback scheduler'
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                health?.ollama_online ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="hidden sm:inline">
              {health?.ollama_online ? 'Local Qwen3 8B Online' : 'Deterministic Mode'}
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded border border-study-border hover:bg-study-ivory text-study-slate hover:text-study-navy transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
