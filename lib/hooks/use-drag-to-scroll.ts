import { useRef, useState, useCallback, RefObject } from 'react';

interface DragToScrollProps {
  // Optional prop to disable the drag-to-scroll behavior
  disabled?: boolean;
  // Optional prop to handle when dragging starts
  onDragStart?: () => void;
  // Optional prop to handle when dragging ends
  onDragEnd?: () => void;
}

interface DragToScrollReturn {
  // Ref to attach to the scrollable container
  ref: RefObject<HTMLDivElement | null>;
  // Event handlers for the container
  handlers: {
    onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
    onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
  };
  // Current dragging state
  isDragging: boolean;
  // Style object to apply to the container
  style: {
    cursor: string;
    userSelect: 'none' | 'auto';
  };
}

export function useDragToScroll({
  disabled = false,
  onDragStart,
  onDragEnd,
}: DragToScrollProps = {}): DragToScrollReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || e.button !== 0) return;
    if ((e.target as HTMLElement).closest('.diagram-wrapper')) return;

    e.preventDefault();
    setIsDragging(true);
    onDragStart?.();

    if (containerRef.current) {
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        scrollLeft: containerRef.current.scrollLeft,
        scrollTop: containerRef.current.scrollTop,
      };
      containerRef.current.style.cursor = 'grabbing';
    }
  }, [disabled, onDragStart]);

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
    onDragEnd?.();
  }, [onDragEnd]);

  return {
    ref: containerRef,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
    },
    isDragging,
    style: {
      cursor: isDragging ? 'grabbing' : 'grab',
      userSelect: isDragging ? 'none' : 'auto',
    },
  };
}
