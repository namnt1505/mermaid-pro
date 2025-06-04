import React, { createContext, useContext } from 'react';

interface DiagramActionContextType {
  onCodeChange?: (diagramId: string, newCode: string) => void;
}

const DiagramActionContext = createContext<DiagramActionContextType | undefined>(undefined);

export const useDiagramAction = () => {
  const context = useContext(DiagramActionContext);
  if (context === undefined) {
    throw new Error('useDiagramAction must be used within a DiagramActionProvider');
  }
  return context;
};

export const DiagramActionProvider = DiagramActionContext.Provider;
