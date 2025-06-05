import React from 'react';
import { DiagramWrapper } from './diagram-wrapper';
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store/store';
import type { DiagramMetadata } from '@/types';
import { useDragToScroll } from '@/lib/hooks/use-drag-to-scroll';

interface DiagramsContainerProps {
  diagrams: DiagramMetadata[];
  onExportDiagram: (diagramId: string, diagramName: string) => Promise<void>;
}

export function DiagramsContainer({ diagrams, onExportDiagram }: DiagramsContainerProps) {
  const diagramCodes = useSelector((state: RootState) => state.editor.diagrams);
  
  const { ref, handlers, style } = useDragToScroll();

  return (
    <div
      className="diagrams-container"
      ref={ref}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        width: '100%',
        height: '100%',
        position: 'absolute',
        gap: '3rem',
        overflow: 'auto',
        ...style,
      }}
      {...handlers}
    >
      <div
        style={{
          minWidth: 'min-content',
          minHeight: 'min-content',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '3rem',
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
    </div>
  );
}
