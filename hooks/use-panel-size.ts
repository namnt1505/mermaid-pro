"use client"

import { useMemo } from "react"
import { useWindowSize } from "@/hooks/use-window-size"

interface PanelSizeResult {
  leftPanelSize: number
  leftPanelPercentage: number
  rightPanelPercentage: number
}

export function usePanelSize(isMinimized: boolean): PanelSizeResult {
  const { width: windowWidth } = useWindowSize()

  return useMemo(() => {
    const leftSize = isMinimized ? 70 : 350 // Fixed pixel values
    const totalWidth = windowWidth || 1200 // Fallback width
    const leftPercentage = (leftSize / totalWidth) * 100

    return {
      leftPanelSize: leftSize,
      leftPanelPercentage: leftPercentage,
      rightPanelPercentage: 100 - leftPercentage,
    }
  }, [isMinimized, windowWidth])
}
