"use client"

import { useState, useCallback, useEffect } from "react"
import type { Diagram } from "@/types"

interface DiagramPosition {
  x: number
  y: number
}

export function useDiagramPositions(projectId: string, diagrams: Diagram[]) {
  const [diagramPositions, setDiagramPositions] = useState<Record<string, DiagramPosition>>({})

  // Load positions from localStorage
  useEffect(() => {
    const savedPositions = localStorage.getItem(`diagram-positions-${projectId}`)
    if (savedPositions) {
      try {
        const positions = JSON.parse(savedPositions)
        // Validate positions
        const validPositions: Record<string, DiagramPosition> = {}

        // Only use saved positions for diagrams that still exist
        diagrams.forEach((diagram, index) => {
          if (
            positions[diagram.id] &&
            typeof positions[diagram.id].x === "number" &&
            typeof positions[diagram.id].y === "number"
          ) {
            validPositions[diagram.id] = positions[diagram.id]
          } else {
            // Create default position for new diagrams
            validPositions[diagram.id] = {
              x: 50 + (index % 3) * 350,
              y: 50 + Math.floor(index / 3) * 300,
            }
          }
        })

        setDiagramPositions(validPositions)
        console.log("Loaded diagram positions:", validPositions)
      } catch (error) {
        console.error("Error loading diagram positions:", error)
        initializeDefaultPositions(diagrams)
      }
    } else {
      initializeDefaultPositions(diagrams)
    }
  }, [projectId, diagrams])

  // Initialize default positions
  const initializeDefaultPositions = useCallback(
    (diagrams: Diagram[]) => {
      const defaultPositions: Record<string, DiagramPosition> = {}
      diagrams.forEach((diagram, index) => {
        defaultPositions[diagram.id] = {
          x: 50 + (index % 3) * 350,
          y: 50 + Math.floor(index / 3) * 300,
        }
      })
      setDiagramPositions(defaultPositions)

      // Save to localStorage
      localStorage.setItem(`diagram-positions-${projectId}`, JSON.stringify(defaultPositions))
      console.log("Initialized default positions:", defaultPositions)
    },
    [projectId],
  )

  // Update diagram position
  const updateDiagramPosition = useCallback(
    (diagramId: string, position: DiagramPosition) => {
      console.log("useDiagramPositions: Updating position for", diagramId, position)

      // Update state with functional update to ensure we're working with the latest state
      setDiagramPositions((prev) => {
        const newPositions = {
          ...prev,
          [diagramId]: position,
        }

        // Save to localStorage immediately
        localStorage.setItem(`diagram-positions-${projectId}`, JSON.stringify(newPositions))
        console.log("Saved positions to localStorage:", newPositions)

        return newPositions
      })
    },
    [projectId],
  )

  const resetPositions = useCallback(() => {
    initializeDefaultPositions(diagrams)
  }, [diagrams, initializeDefaultPositions])

  return {
    diagramPositions,
    updateDiagramPosition,
    resetPositions,
  }
}
