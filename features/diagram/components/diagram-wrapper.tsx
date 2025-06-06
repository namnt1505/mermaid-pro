import React, { useRef, useState, useCallback, useEffect } from 'react';
import { DiagramHeader } from './diagram-header';
import { DiagramContent } from './diagram-content';
import { Resizable } from 're-resizable';
import type { DiagramMetadata } from '@/types';
import { useDragElement } from '@/lib/hooks/use-drag-element';
import { useResizeElement } from '@/lib/hooks/use-resize-element';

interface DiagramWrapperProps {
  diagram: DiagramMetadata;
  index: number;
  onExport: () => void;
  code?: string;
}

export function DiagramWrapper({ diagram, index, onExport, code = '' }: DiagramWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragDisabled, setDragDisabled] = useState(false);
  const dragDisableTimerRef = useRef<number | null>(null);

  // Cleanup function for the timer
  useEffect(() => {
    return () => {
      if (dragDisableTimerRef.current !== null) {
        clearTimeout(dragDisableTimerRef.current);
      }
    };
  }, []);

  const {
    isResizing,
    size,
    handleResizeStart,
    handleResize,
    handleResizeStop
  } = useResizeElement({
    elementRef: containerRef,
    onResizeStart: useCallback(() => {
      if (dragDisableTimerRef.current !== null) {
        clearTimeout(dragDisableTimerRef.current);
      }
      setDragDisabled(true);
    }, []),
    onResizeEnd: useCallback(() => {
      dragDisableTimerRef.current = window.setTimeout(() => {
        setDragDisabled(false);
        dragDisableTimerRef.current = null;
      }, 100);
    }, [])
  });

  const {
    isDragging,
    position,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  } = useDragElement({
    elementRef: containerRef,
    disabled: dragDisabled || isResizing,
  });

  // Using useCallback to memoize event handlers
  const handleMouseDownWrapper = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    const isInteractiveElement = target.closest('button, input, textarea, select, [role="button"], .resize-handle, a');
    if (!isInteractiveElement && !isResizing) {
      handleMouseDown(e);
    }
  }, [handleMouseDown, isResizing]);

  const handleMouseMoveWrapper = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!dragDisabled && !isResizing) {
      handleMouseMove(e);
    }
  }, [dragDisabled, isResizing, handleMouseMove]);

  const handleMouseUpWrapper = useCallback(() => {
    if (!dragDisabled && !isResizing) {
      handleMouseUp();
    }
  }, [dragDisabled, isResizing, handleMouseUp]);

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
      onMouseDown={handleMouseDownWrapper}
      onMouseMove={handleMouseMoveWrapper}
      onMouseUp={handleMouseUpWrapper}
      onMouseLeave={handleMouseUpWrapper}
      style={{
        position: 'relative',
        transform: `translate(${position.x}px, ${position.y}px)`,
        willChange: isDragging ? 'transform' : 'auto',
        zIndex: isDragging ? 10 : 1,
        marginBottom: '1rem',
        width: size.width,
        height: size.height,
        cursor: isDragging ? 'grabbing' : (dragDisabled || isResizing ? 'default' : 'grab'),
        transition: isDragging || isResizing ? 'none' : 'all 0.2s ease'
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
    </div>
  );
}
