"use client"

import { useMemo } from "react"
import { useWindowSize } from "./use-window-size"

interface PanelSizeConfig {
  leftPanelPercentage: number
  rightPanelPercentage: number
  leftPanelSize: number
}

export function usePanelSize(isMinimized: boolean): PanelSizeConfig {
  const { width: windowWidth } = useWindowSize()

  return useMemo(() => {
    const leftSize = isMinimized ? 70 : 350 // Fixed pixel values
    const leftPercentage = (leftSize / windowWidth) * 100

    return {
      leftPanelSize: leftSize,
      leftPanelPercentage: leftPercentage,
      rightPanelPercentage: 100 - leftPercentage,
    }
  }, [isMinimized, windowWidth])
}
