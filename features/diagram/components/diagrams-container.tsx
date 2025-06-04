import React from 'react';
import { DiagramWrapper } from './diagram-wrapper';

interface Diagram {
  id: string;
  name: string;
  code: string;
}

interface DiagramsContainerProps {
  diagrams: Diagram[];
  onExportDiagram: (diagramId: string, diagramName: string) => Promise<void>;
  onCodeChange?: (diagramId: string, newCode: string) => void;
}

export function DiagramsContainer({ diagrams, onExportDiagram, onCodeChange }: DiagramsContainerProps) {
  return (
    <div
      className="diagrams-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '10px',
        minHeight: '100%',
        width: 'max-content',
        minWidth: '100%',
      }}
    >
      {diagrams.map((diagram, index) => (
        <DiagramWrapper
          key={diagram.id}
          diagram={diagram}
          index={index}
          onExport={() => onExportDiagram(diagram.id, diagram.name)}
          onCodeChange={(newCode) => onCodeChange?.(diagram.id, newCode)}
        />
      ))}
    </div>
  );
}
