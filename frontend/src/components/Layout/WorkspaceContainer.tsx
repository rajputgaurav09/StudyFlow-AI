import React from 'react';
import { usePlan } from '../../context/PlanContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { OverviewWorkspace } from '../Workspaces/OverviewWorkspace';
import { StudyPlannerWorkspace } from '../Workspaces/StudyPlannerWorkspace';
import { TimetableWorkspace } from '../Workspaces/TimetableWorkspace';
import { ReschedulingWorkspace } from '../Workspaces/ReschedulingWorkspace';
import { PromptLabWorkspace } from '../Workspaces/PromptLabWorkspace';
import { AboutDocWorkspace } from '../Workspaces/AboutDocWorkspace';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export const WorkspaceContainer: React.FC = () => {
  const { activeWorkspace, error, successMessage, clearMessages } = usePlan();

  return (
    <div className="min-h-screen flex flex-col bg-study-ivory">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Notification Feedback Toast */}
          {(error || successMessage) && (
            <div className="max-w-7xl mx-auto mb-6">
              {error && (
                <div className="flex items-center justify-between p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs shadow-xs">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                    <span>{error}</span>
                  </div>
                  <button onClick={clearMessages} className="text-rose-600 hover:text-rose-900">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {successMessage && (
                <div className="flex items-center justify-between p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs shadow-xs">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                  <button onClick={clearMessages} className="text-emerald-600 hover:text-emerald-900">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Active Workspace Switcher */}
          {activeWorkspace === 'overview' && <OverviewWorkspace />}
          {activeWorkspace === 'planner' && <StudyPlannerWorkspace />}
          {activeWorkspace === 'timetable' && <TimetableWorkspace />}
          {activeWorkspace === 'reschedule' && <ReschedulingWorkspace />}
          {activeWorkspace === 'prompts' && <PromptLabWorkspace />}
          {activeWorkspace === 'about' && <AboutDocWorkspace />}
        </main>
      </div>
    </div>
  );
};
