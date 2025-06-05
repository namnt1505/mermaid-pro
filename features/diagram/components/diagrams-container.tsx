import React, { useRef, useState, useCallback } from 'react';
import { DiagramWrapper } from './diagram-wrapper';
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store/store';
import type { DiagramMetadata } from '@/types';

interface DiagramsContainerProps {
  diagrams: DiagramMetadata[];
  onExportDiagram: (diagramId: string, diagramName: string) => Promise<void>;
}

export function DiagramsContainer({ diagrams, onExportDiagram }: DiagramsContainerProps) {
  const diagramCodes = useSelector((state: RootState) => state.editor.diagrams);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('.diagram-wrapper')) return;
    e.preventDefault(); // Prevent text selection
    setIsDragging(true);
    if (containerRef.current) {
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        scrollLeft: containerRef.current.scrollLeft,
        scrollTop: containerRef.current.scrollTop,
      };
      containerRef.current.style.cursor = 'grabbing';
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart.current || !containerRef.current) return;
    e.preventDefault();
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    containerRef.current.scrollLeft = dragStart.current.scrollLeft - dx;
    containerRef.current.scrollTop = dragStart.current.scrollTop - dy;
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
    dragStart.current = null;
  }, []);

  return (
    <div
      className="diagrams-container"
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        width: '100%',
        height: '100%',
        position: 'absolute',
        gap: '3rem',
        overflow: 'auto',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
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
