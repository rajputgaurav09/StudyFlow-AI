import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import App from '../App';

describe('StudyFlow AI Application Workspaces Navigation', () => {
  it('renders application brandmark and initial Overview workspace', () => {
    render(<App />);
    expect(screen.getAllByText(/StudyFlow/i)[0]).toBeDefined();
    expect(screen.getByText(/PE-B25-52/i)).toBeDefined();
    expect(screen.getAllByText(/AI-Powered Personalized Study Plan Generator/i)[0]).toBeDefined();
  });

  it('switches to Study Planner workspace on navigation click', () => {
    render(<App />);
    const plannerNav = screen.getAllByText(/Study Planner/i)[0];
    fireEvent.click(plannerNav);

    expect(screen.getByText(/Study Planner & Course Synthesizer/i)).toBeDefined();
    expect(screen.getByText(/Available Daily Study Hours/i)).toBeDefined();
    expect(screen.getByText(/Generate Study Plan/i)).toBeDefined();
  });

  it('switches to My Timetable workspace on navigation click', () => {
    render(<App />);
    const timetableNav = screen.getAllByText(/My Timetable/i)[0];
    fireEvent.click(timetableNav);

    expect(screen.getByText(/My Timetable & Session Tracker/i)).toBeDefined();
    expect(screen.getByText(/Export JSON/i)).toBeDefined();
    expect(screen.getByText(/Export Markdown/i)).toBeDefined();
  });

  it('switches to Rescheduling workspace on navigation click', () => {
    render(<App />);
    const reschedNav = screen.getAllByText(/Rescheduling/i)[0];
    fireEvent.click(reschedNav);

    expect(screen.getByText(/Adaptive Schedule Rescheduler & Delta Engine/i)).toBeDefined();
    expect(screen.getByText(/Report Disruption & Adjust Availability/i)).toBeDefined();
  });

  it('switches to Prompt Lab workspace on navigation click', () => {
    render(<App />);
    const promptsNav = screen.getAllByText(/Prompt Lab/i)[0];
    fireEvent.click(promptsNav);

    expect(screen.getByText(/Prompt Engineering Academic Laboratory/i)).toBeDefined();
    expect(screen.getByText(/Live Benchmark Runner/i)).toBeDefined();
  });

  it('switches to About & Docs workspace on navigation click', () => {
    render(<App />);
    const aboutNav = screen.getAllByText(/About & Docs/i)[0];
    fireEvent.click(aboutNav);

    expect(screen.getByText(/Gaurav Singh/i)).toBeDefined();
    expect(screen.getByText(/S24CSEU0790/i)).toBeDefined();
    expect(screen.getByText(/Adarsh Dubey/i)).toBeDefined();
    expect(screen.getByText(/S24CSEU1579/i)).toBeDefined();
  });
});
