export type Priority = 'High' | 'Medium' | 'Low';
export type SessionType = 'study' | 'revision' | 'practice' | 'break';

export interface Subject {
  subject: string;
  exam_in_days: number;
  priority: Priority;
}

export interface Session {
  id: string;
  start: string;
  end: string;
  subject: string;
  task: string;
  type: SessionType;
  duration_min: number;
  completed?: boolean;
}

export interface PlanValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  actual_study_minutes: number;
  available_study_minutes: number;
  break_minutes: number;
  session_count: number;
  subject_breakdown: Record<string, number>;
}

export interface StudyPlan {
  sessions: Session[];
  assumptions: string[];
  engine: string;
  prompt_version: string;
  notice?: string;
  validation: PlanValidation;
}

export interface RescheduleResult {
  sessions: Session[];
  delta_summary: string[];
  assumptions: string[];
  engine: string;
  notice?: string;
  validation: PlanValidation;
}

export interface PromptMetadata {
  version: string;
  purpose: string;
  changes: string;
  expected_output: string;
  limitations: string;
  template: string;
  raw_content: string;
}

export interface PromptTestResult {
  prompt_version: string;
  raw_prompt: string;
  raw_response: string;
  parsed_json?: {
    sessions?: Session[];
    assumptions?: string[];
    [key: string]: any;
  } | null;
  validation?: PlanValidation | null;
  latency_ms: number;
  engine: string;
  error?: string | null;
}

export interface HealthStatus {
  status: string;
  ollama_online: boolean;
  has_qwen3: boolean;
  models: string[];
  active_plan_available: boolean;
  current_session_count: number;
}

export interface Preset {
  id: string;
  title: string;
  description: string;
  subjects: Subject[];
  available_hours: number;
  start_time: string;
}

export type WorkspaceId = 'overview' | 'planner' | 'timetable' | 'reschedule' | 'prompts' | 'about';
