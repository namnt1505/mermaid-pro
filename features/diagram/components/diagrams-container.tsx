import React from 'react';
import { DiagramWrapper } from './diagram-wrapper';
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store/store';
import type { DiagramMetadata } from '@/types';

interface DiagramsContainerProps {
  diagrams: DiagramMetadata[];
  onExportDiagram: (diagramId: string, diagramName: string) => Promise<void>;
}

export function DiagramsContainer({ diagrams, onExportDiagram }: DiagramsContainerProps) {
  // Get all diagram codes from Redux store
  const diagramCodes = useSelector((state: RootState) => state.editor.diagrams);

  return (
    <div
      className="diagrams-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        minHeight: '100%',
        width: '100%',
        position: 'relative',
        gap: '3rem',
        overflow: 'visible',
      }}
    >
      {diagrams.map((diagram, index) => (
        <DiagramWrapper
          key={diagram.id}
          diagram={diagram}
          index={index}
          onExport={() => onExportDiagram(diagram.id, diagram.name)}
          code={diagramCodes[diagram.id]}
        />
      ))}
    </div>
  );
}
