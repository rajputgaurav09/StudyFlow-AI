import React from 'react';
import { usePlan } from '../../context/PlanContext';
import { WorkspaceId } from '../../types';
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  RefreshCw,
  FlaskConical,
  GraduationCap,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  id: WorkspaceId;
  label: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const Sidebar: React.FC = () => {
  const { activeWorkspace, setActiveWorkspace, currentPlan } = usePlan();

  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      description: 'System dashboard & schedule preview'
    },
    {
      id: 'planner',
      label: 'Study Planner',
      badge: 'Input',
      icon: CalendarDays,
      description: 'Subjects, priorities & constraints'
    },
    {
      id: 'timetable',
      label: 'My Timetable',
      badge: currentPlan ? `${currentPlan.sessions.length} Slots` : undefined,
      icon: Clock,
      description: 'Chronological schedule & task tracker'
    },
    {
      id: 'reschedule',
      label: 'Rescheduling',
      badge: 'Adaptive',
      icon: RefreshCw,
      description: 'Dynamic disruption recovery'
    },
    {
      id: 'prompts',
      label: 'Prompt Lab',
      badge: 'Academic',
      icon: FlaskConical,
      description: 'V1/V2/V3 evolution & live tests'
    },
    {
      id: 'about',
      label: 'About & Docs',
      icon: GraduationCap,
      description: 'Team Innovex & architecture'
    }
  ];

  return (
    <aside className="w-64 bg-study-surface border-r border-study-border flex flex-col justify-between shrink-0 min-h-[calc(100vh-61px)]">
      {/* Navigation Links */}
      <div className="p-4 space-y-1.5">
        <div className="px-3 pt-2 pb-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-study-slate/80">
            Platform Workspaces
          </p>
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeWorkspace === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveWorkspace(item.id)}
              className={`w-full text-left px-3.5 py-3 rounded-md transition-all flex items-center justify-between group ${
                isActive
                  ? 'bg-study-navy text-study-ivory shadow-sm'
                  : 'text-study-slate hover:text-study-navy hover:bg-study-ivory'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-study-amber' : 'text-study-slate group-hover:text-study-navy'
                  }`}
                />
                <div className="truncate">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold tracking-tight">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          isActive
                            ? 'bg-study-navy-light text-study-ivory border border-study-slate/40'
                            : 'bg-study-ivory text-study-slate border border-study-border'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-[11px] truncate mt-0.5 ${
                      isActive ? 'text-study-slate-light' : 'text-study-slate/70'
                    }`}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
              <ChevronRight
                className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                  isActive ? 'text-study-amber translate-x-0.5' : 'text-study-border opacity-0 group-hover:opacity-100'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Academic Footer Info */}
      <div className="p-4 border-t border-study-border bg-study-ivory/50">
        <div className="flex items-start space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-study-sage-dark shrink-0 mt-0.5" />
          <div className="text-[11px] text-study-slate leading-relaxed">
            <p className="font-semibold text-study-navy">Deterministic Verification</p>
            <p className="text-[10px] text-study-slate mt-0.5">
              8+ mathematical scheduling constraints verified independently.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
