import React from 'react';
import { PlanProvider } from './context/PlanContext';
import { WorkspaceContainer } from './components/Layout/WorkspaceContainer';

export function App() {
  return (
    <PlanProvider>
      <WorkspaceContainer />
    </PlanProvider>
  );
}

export default App;
