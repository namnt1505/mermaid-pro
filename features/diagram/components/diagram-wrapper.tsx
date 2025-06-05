import React, { useState, useRef, useCallback } from 'react';
import { DiagramHeader } from './diagram-header';
import { DiagramContent } from './diagram-content';
import { Resizable } from 're-resizable';
import type { DiagramMetadata } from '@/types';

interface DiagramWrapperProps {
  diagram: DiagramMetadata;
  index: number;
  onExport: () => void;
  code?: string;
}

export function DiagramWrapper({ diagram, index, onExport, code = '' }: DiagramWrapperProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 500, height: 'auto' as const });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement && !e.target.closest('.resize-handle') && !isResizing) {
      setIsDragging(true);
      setDragStartPos({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grabbing';
      }
    }
  }, [position, isResizing]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStartPos.x,
        y: e.clientY - dragStartPos.y
      });
    }
  }, [isDragging, dragStartPos]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  }, []);

  const handleResizeStart = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleResize = useCallback((_e: MouseEvent | TouchEvent, _direction: string, ref: HTMLElement) => {
    if (isResizing) {
      setSize({
        width: Math.max(500, ref.offsetWidth),
        height: 'auto'
      });
    }
  }, [isResizing]);

  const handleResizeStop = useCallback(() => {
    setIsResizing(false);
  }, []);

  const content = (
    <>
      <DiagramHeader 
        name={diagram.name} 
        onExport={onExport} 
        diagramId={diagram.id}
        code={code}
      />
      <DiagramContent diagramId={diagram.id} index={index} name={diagram.name} />
    </>
  );

  return (
    <div
      className="diagram-wrapper"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        position: 'relative',
        transform: `translate(${position.x}px, ${position.y}px)`,
        willChange: 'transform',
        zIndex: isDragging ? 10 : 1,
        marginBottom: '1rem',
        width: size.width,
        height: size.height
      }}
    >
      <Resizable
        size={size}
        minWidth={500}
        maxWidth={2000}
        onResizeStart={handleResizeStart}
        onResize={handleResize}
        onResizeStop={handleResizeStop}
        enable={{
          right: true,
          top: false,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false
        }}
        className={`diagram-wrapper transition-all duration-200 ease-out diagram-${diagram.id}`}
        handleStyles={{
          right: {
            width: '12px',
            right: '-6px',
            cursor: 'ew-resize',
            height: 'calc(100% - 16px)',
            top: '8px',
            borderRadius: '6px'
          }
        }}
      >
        <div
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
            background: '#ffffff',
            boxShadow: isDragging 
              ? '0 8px 16px -4px rgba(0, 0, 0, 0.1), 0 4px 8px -4px rgba(0, 0, 0, 0.06)'
              : '0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            height: '100%',
            width: '100%',
            transition: 'box-shadow 0.2s ease-out, padding 0.2s ease-out',
          }}
        >
          {content}
        </div>
      </Resizable>
      <style jsx>{`
        :global(.resize-handle) {
          position: absolute;
          top: 0;
          bottom: 0;
          background-color: transparent;
          transition: background-color 0.2s;
        }
        :global(.resize-handle:hover) {
          background-color: #e5e7eb;
        }
      `}</style>
    </div>
  );
}
