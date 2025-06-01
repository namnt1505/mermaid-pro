"use client"

import type React from "react"

import { useCallback } from "react"
import type { Diagram } from "@/types"

interface DiagramPosition {
  x: number
  y: number
}

export function useDiagramRenderer(diagramRef: React.RefObject<HTMLDivElement>, diagrams: Diagram[]) {
  const renderDiagrams = useCallback(
    (
      exportIndividualDiagram: (id: string, name: string) => void,
      diagramPositions: Record<string, DiagramPosition>,
      updateDiagramPosition: (id: string, position: DiagramPosition) => void,
    ) => {
      // This hook is now simplified since we're using DraggableDiagram components
      // The actual rendering is handled by individual DraggableDiagram components
      return
    },
    [diagramRef, diagrams],
  )

  return { renderDiagrams }
}
