import { useState, useCallback, RefObject } from 'react';
import type { ResizeCallback, ResizeStartCallback } from 're-resizable';

interface Size {
  width: number;
  height: string | number;
}

interface UseResizeElementProps {
  elementRef: RefObject<HTMLElement | null>;
  minWidth?: number;
  maxWidth?: number;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
  disabled?: boolean;
}

interface UseResizeElementReturn {
  isResizing: boolean;
  size: Size;
  handleResizeStart: ResizeStartCallback;
  handleResize: ResizeCallback;
  handleResizeStop: ResizeCallback;
}

export function useResizeElement({
  elementRef,
  minWidth = 500,
  maxWidth = 2000,
  onResizeStart,
  onResizeEnd,
  disabled = false
}: UseResizeElementProps): UseResizeElementReturn {
  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState<Size>({ width: 500, height: 'auto' });

  const handleResizeStart: ResizeStartCallback = useCallback(() => {
    if (disabled) return;

    setIsResizing(true);
    onResizeStart?.();
  }, [disabled, onResizeStart]);

  const handleResize: ResizeCallback = useCallback((_e, _direction, ref) => {
    if (disabled) return;

    setSize({
      width: Math.max(minWidth, Math.min(maxWidth, ref.offsetWidth)),
      height: 'auto'
    });
  }, [disabled, minWidth, maxWidth]);

  const handleResizeStop: ResizeCallback = useCallback(() => {
    if (disabled) return;

    setIsResizing(false);
    if (elementRef.current) {
      elementRef.current.style.cursor = 'grab';
    }
    onResizeEnd?.();
  }, [disabled, elementRef, onResizeEnd]);

  return {
    isResizing,
    size,
    handleResizeStart,
    handleResize,
    handleResizeStop
  };
}
