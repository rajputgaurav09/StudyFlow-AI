import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ValidationBanner } from '../components/Common/ValidationBanner';
import { PlanValidation } from '../types';

describe('ValidationBanner Component', () => {
  it('renders verified compliant state when valid is true', () => {
    const validData: PlanValidation = {
      valid: true,
      errors: [],
      warnings: [],
      actual_study_minutes: 240,
      available_study_minutes: 240,
      break_minutes: 30,
      session_count: 5,
      subject_breakdown: { 'Automata Theory': 90, 'C Programming': 75 }
    };

    render(<ValidationBanner validation={validData} />);
    expect(screen.getByText(/Deterministic Validation: Verified Compliant/i)).toBeDefined();
    expect(screen.getByText(/All Rules Passed/i)).toBeDefined();
    expect(screen.getByText(/240m \/ 240m/i)).toBeDefined();
  });

  it('renders violation errors when valid is false', () => {
    const invalidData: PlanValidation = {
      valid: false,
      errors: ['Total study duration exceeds limit by 30 min.'],
      warnings: ['Unscheduled gap before session #2'],
      actual_study_minutes: 270,
      available_study_minutes: 240,
      break_minutes: 15,
      session_count: 4,
      subject_breakdown: {}
    };

    render(<ValidationBanner validation={invalidData} />);
    expect(screen.getByText(/Schedule Constraints Violated/i)).toBeDefined();
    expect(screen.getByText(/1 Error\(s\)/i)).toBeDefined();
    expect(screen.getByText(/Total study duration exceeds limit by 30 min./i)).toBeDefined();
  });
});
