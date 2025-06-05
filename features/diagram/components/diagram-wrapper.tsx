import React from 'react';
import { DiagramHeader } from './diagram-header';
import { DiagramContent } from './diagram-content';
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable"

import type { DiagramMetadata } from '@/types';

interface DiagramWrapperProps {
  diagram: DiagramMetadata;
  index: number;
  onExport: () => void;
  code?: string;
}

export function DiagramWrapper({ diagram, index, onExport, code = '' }: DiagramWrapperProps) {
  return (
    <div
      className="diagram-wrapper hover:-translate-y-0.5 transition-transform duration-200"
      id={`diagram-wrapper-${diagram.id}`}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px',
        background: '#ffffff',
        boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        width: 'max-content',
        minWidth: '500px',
      }}
    >
      <DiagramHeader 
        name={diagram.name} 
        onExport={onExport} 
        diagramId={diagram.id}
        code={code}
      />
      <DiagramContent diagramId={diagram.id} index={index} name={diagram.name} />
    </div>
  );
}
