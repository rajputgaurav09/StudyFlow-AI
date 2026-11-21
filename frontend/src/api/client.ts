import {
  HealthStatus,
  Preset,
  StudyPlan,
  PlanValidation,
  RescheduleResult,
  PromptMetadata,
  PromptTestResult,
  Subject,
  Session
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  private url(endpoint: string): string {
    const cleanBase = BASE_URL.replace(/\/+$/, '');
    const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${cleanBase}${cleanPath}`;
  }

  async getHealth(): Promise<HealthStatus> {
    try {
      const res = await fetch(this.url('/api/health'));
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      return await res.json();
    } catch {
      return {
        status: 'offline',
        ollama_online: false,
        has_qwen3: false,
        models: [],
        active_plan_available: false,
        current_session_count: 0
      };
    }
  }

  async getPresets(): Promise<Preset[]> {
    const res = await fetch(this.url('/api/presets'));
    if (!res.ok) throw new Error(`Failed to load presets: ${res.statusText}`);
    return await res.json();
  }

  async getCurrentPlan(): Promise<{
    schedule: StudyPlan | null;
    subjects: Subject[];
    available_hours: number;
    start_time: string;
    validation: PlanValidation | null;
  }> {
    const res = await fetch(this.url('/api/plan/current'));
    if (!res.ok) throw new Error(`Failed to load current plan: ${res.statusText}`);
    return await res.json();
  }

  async generatePlan(payload: {
    subjects: Subject[];
    available_hours: number;
    start_time: string;
    break_duration?: number;
    extra_instructions?: string;
    prompt_version: string;
  }): Promise<StudyPlan> {
    const res = await fetch(this.url('/api/plan/generate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Failed to generate study plan');
    }
    return await res.json();
  }

  async validatePlan(payload: {
    sessions: Session[];
    available_hours: number;
    expected_subjects?: string[];
  }): Promise<PlanValidation> {
    const res = await fetch(this.url('/api/plan/validate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Validation request failed');
    return await res.json();
  }

  async reschedulePlan(payload: {
    original_schedule?: any;
    subjects: Subject[];
    remaining_hours: number;
    missed_description: string;
    new_start_time: string;
  }): Promise<RescheduleResult> {
    const res = await fetch(this.url('/api/plan/reschedule'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Rescheduling request failed');
    }
    return await res.json();
  }

  async updateSession(sessionId: string, completed: boolean): Promise<boolean> {
    const res = await fetch(this.url(`/api/sessions/${sessionId}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed })
    });
    return res.ok;
  }

  async getPrompts(): Promise<PromptMetadata[]> {
    const res = await fetch(this.url('/api/prompts'));
    if (!res.ok) throw new Error('Failed to load prompts metadata');
    return await res.json();
  }

  async testPrompt(payload: {
    prompt_version: string;
    subjects: Subject[];
    available_hours: number;
    start_time: string;
    extra_instructions?: string;
  }): Promise<PromptTestResult> {
    const res = await fetch(this.url('/api/prompts/test'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Prompt benchmark failed');
    }
    return await res.json();
  }

  getExportJsonUrl(): string {
    return this.url('/api/export/json');
  }

  getExportMarkdownUrl(): string {
    return this.url('/api/export/markdown');
  }
}

export const api = new ApiClient();
