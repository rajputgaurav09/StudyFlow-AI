import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Subject,
  Session,
  StudyPlan,
  PlanValidation,
  RescheduleResult,
  HealthStatus,
  Preset,
  WorkspaceId
} from '../types';
import { api } from '../api/client';

interface PlanContextType {
  activeWorkspace: WorkspaceId;
  setActiveWorkspace: (ws: WorkspaceId) => void;
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  addSubject: (s: Subject) => void;
  updateSubject: (index: number, s: Subject) => void;
  removeSubject: (index: number) => void;
  availableHours: number;
  setAvailableHours: (h: number) => void;
  startTime: string;
  setStartTime: (t: string) => void;
  breakDuration: number;
  setBreakDuration: (d: number) => void;
  promptVersion: string;
  setPromptVersion: (v: string) => void;
  extraInstructions: string;
  setExtraInstructions: (i: string) => void;
  currentPlan: StudyPlan | null;
  validation: PlanValidation | null;
  health: HealthStatus | null;
  loading: boolean;
  rescheduling: boolean;
  error: string | null;
  successMessage: string | null;
  clearMessages: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  generatePlan: () => Promise<void>;
  reschedulePlan: (remainingHours: number, missedDescription: string, newStartTime: string) => Promise<RescheduleResult | null>;
  toggleSessionCompletion: (sessionId: string) => Promise<void>;
  applyPreset: (preset: Preset) => void;
  refreshHealth: () => Promise<void>;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceId>('overview');
  const [subjects, setSubjects] = useState<Subject[]>([
    { subject: 'Automata Theory', exam_in_days: 3, priority: 'High' },
    { subject: 'C Programming', exam_in_days: 5, priority: 'Medium' },
    { subject: 'AI/ML Systems', exam_in_days: 7, priority: 'Medium' }
  ]);
  const [availableHours, setAvailableHours] = useState<number>(4.0);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [breakDuration, setBreakDuration] = useState<number>(15);
  const [promptVersion, setPromptVersion] = useState<string>('V2');
  const [extraInstructions, setExtraInstructions] = useState<string>('');

  const [currentPlan, setCurrentPlan] = useState<StudyPlan | null>(null);
  const [validation, setValidation] = useState<PlanValidation | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [rescheduling, setRescheduling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const refreshHealth = async () => {
    try {
      const h = await api.getHealth();
      setHealth(h);
    } catch {
      // silently ignore health probe error
    }
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      await refreshHealth();
      try {
        const cur = await api.getCurrentPlan();
        if (cur.schedule) {
          setCurrentPlan(cur.schedule);
          if (cur.validation) setValidation(cur.validation);
          if (cur.subjects && cur.subjects.length > 0) setSubjects(cur.subjects);
          if (cur.available_hours) setAvailableHours(cur.available_hours);
          if (cur.start_time) setStartTime(cur.start_time);
        }
      } catch {
        // use initial demo state if backend not immediately active
      }
    };
    init();
  }, []);

  const addSubject = (s: Subject) => {
    setSubjects(prev => [...prev, s]);
  };

  const updateSubject = (index: number, s: Subject) => {
    setSubjects(prev => {
      const copy = [...prev];
      copy[index] = s;
      return copy;
    });
  };

  const removeSubject = (index: number) => {
    setSubjects(prev => prev.filter((_, i) => i !== index));
  };

  const applyPreset = (preset: Preset) => {
    setSubjects(preset.subjects);
    setAvailableHours(preset.available_hours);
    setStartTime(preset.start_time);
    setSuccessMessage(`Loaded preset: "${preset.title}"`);
    setTimeout(clearMessages, 3500);
  };

  const generatePlan = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const plan = await api.generatePlan({
        subjects,
        available_hours: availableHours,
        start_time: startTime,
        break_duration: breakDuration,
        extra_instructions: extraInstructions,
        prompt_version: promptVersion
      });

      setCurrentPlan(plan);
      setValidation(plan.validation);
      setSuccessMessage(`Successfully generated timetable using ${plan.engine}.`);
      setActiveWorkspace('timetable');
    } catch (err: any) {
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reschedulePlan = async (
    remHours: number,
    missedDesc: string,
    newStart: string
  ): Promise<RescheduleResult | null> => {
    setRescheduling(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await api.reschedulePlan({
        original_schedule: currentPlan,
        subjects,
        remaining_hours: remHours,
        missed_description: missedDesc,
        new_start_time: newStart
      });

      const updatedPlan: StudyPlan = {
        sessions: res.sessions,
        assumptions: res.assumptions,
        engine: res.engine,
        prompt_version: 'V3',
        notice: res.notice,
        validation: res.validation
      };

      setCurrentPlan(updatedPlan);
      setValidation(res.validation);
      setAvailableHours(remHours);
      setStartTime(newStart);
      setSuccessMessage('Timetable adaptively recalculated with completed sessions preserved.');
      return res;
    } catch (err: any) {
      setError(err.message || 'Rescheduling failed.');
      return null;
    } finally {
      setRescheduling(false);
    }
  };

  const toggleSessionCompletion = async (sessionId: string) => {
    if (!currentPlan) return;

    const session = currentPlan.sessions.find(s => s.id === sessionId);
    if (!session) return;

    const newCompleted = !session.completed;

    // Optimistic local update
    setCurrentPlan(prev => {
      if (!prev) return null;
      return {
        ...prev,
        sessions: prev.sessions.map(s =>
          s.id === sessionId ? { ...s, completed: newCompleted } : s
        )
      };
    });

    try {
      await api.updateSession(sessionId, newCompleted);
    } catch {
      // Revert if API failed
      setCurrentPlan(prev => {
        if (!prev) return null;
        return {
          ...prev,
          sessions: prev.sessions.map(s =>
            s.id === sessionId ? { ...s, completed: !newCompleted } : s
          )
        };
      });
      setError('Could not update session status on backend.');
    }
  };

  return (
    <PlanContext.Provider
      value={{
        activeWorkspace,
        setActiveWorkspace,
        subjects,
        setSubjects,
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
        currentPlan,
        validation,
        health,
        loading,
        rescheduling,
        error,
        successMessage,
        clearMessages,
        theme,
        toggleTheme,
        generatePlan,
        reschedulePlan,
        toggleSessionCompletion,
        applyPreset,
        refreshHealth
      }}
    >
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};
