import { useState, useCallback, RefObject, useRef, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseDragElementProps {
  elementRef: RefObject<HTMLElement | null>;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  disabled?: boolean;
}

interface UseDragElementReturn {
  isDragging: boolean;
  position: Position;
  handleMouseDown: (e: React.MouseEvent<HTMLElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
  handleMouseUp: () => void;
}

export function useDragElement({
  elementRef,
  onDragStart,
  onDragEnd,
  disabled = false
}: UseDragElementProps): UseDragElementReturn {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState<Position>({ x: 0, y: 0 });

  // Store the position when drag starts for potential restore
  const startPosition = useRef<Position>({ x: 0, y: 0 });

  const lastMoveTime = useRef<number>(0);
  const moveTimeoutRef = useRef<number | null>(null);
  const lastUpTime = useRef<number>(0);
  const upTimeoutRef = useRef<number | null>(null);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (moveTimeoutRef.current !== null) {
        clearTimeout(moveTimeoutRef.current);
      }
      if (upTimeoutRef.current !== null) {
        clearTimeout(upTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      setIsDragging(false);
      return;
    }
    e.preventDefault();

    // Backup the current position
    startPosition.current = { ...position };

    // Clear any pending timeouts
    if (moveTimeoutRef.current !== null) {
      clearTimeout(moveTimeoutRef.current);
      moveTimeoutRef.current = null;
    }
    if (upTimeoutRef.current !== null) {
      clearTimeout(upTimeoutRef.current);
      upTimeoutRef.current = null;
    }

    setIsDragging(true);
    setDragStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });

    if (elementRef.current) {
      elementRef.current.style.cursor = 'grabbing';
    }

    onDragStart?.();
  }, [disabled, position, elementRef, onDragStart]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!isDragging || disabled) {
      return;
    }

    // Use requestAnimationFrame for smooth movement
    requestAnimationFrame(() => {
      setPosition({
        x: e.clientX - dragStartPos.x,
        y: e.clientY - dragStartPos.y
      });
    });
  }, [isDragging, disabled, dragStartPos.x, dragStartPos.y]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);

    // If disabled during drag, restore to original position
    if (disabled) {
      setPosition(startPosition.current);
    }

    if (elementRef.current) {
      elementRef.current.style.cursor = 'grab';
    }

    onDragEnd?.();
  }, [isDragging, disabled, elementRef, onDragEnd]);

  return {
    isDragging,
    position,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
}
