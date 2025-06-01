"use client"

import type React from "react"
import { forwardRef, memo, useMemo } from "react"
import { DraggableDiagram } from "./draggable-diagram"
import type { Diagram } from "@/types"

interface DiagramPosition {
  x: number
  y: number
}

interface DiagramPreviewWhiteboardProps {
  diagramRef: React.RefObject<HTMLDivElement>
  zoom: number
  position: { x: number; y: number }
  isDragging: boolean
  onMouseDown: (e: React.MouseEvent) => void
  onMouseMove: (e: React.MouseEvent) => void
  onMouseUp: () => void
  onMouseLeave: () => void
  isEmpty: boolean
  diagrams: Diagram[]
  diagramPositions: Record<string, DiagramPosition>
  updateDiagramPosition: (id: string, position: DiagramPosition) => void
  exportIndividualDiagram: (id: string, name: string) => void
}

export const DiagramPreviewWhiteboard = memo(
  forwardRef<HTMLDivElement, DiagramPreviewWhiteboardProps>(
    (
      {
        diagramRef,
        zoom,
        position,
        isDragging,
        onMouseDown,
        onMouseMove,
        onMouseUp,
        onMouseLeave,
        isEmpty,
        diagrams,
        diagramPositions,
        updateDiagramPosition,
        exportIndividualDiagram,
      },
      ref,
    ) => {
      const diagramElements = useMemo(() => {
        if (isEmpty) return null

        return diagrams.map((diagram, index) => {
          const diagramPosition = diagramPositions[diagram.id] || {
            x: 50 + (index % 3) * 350,
            y: 50 + Math.floor(index / 3) * 300,
          }

          return (
            <DraggableDiagram
              key={diagram.id}
              diagram={diagram}
              index={index}
              position={diagramPosition}
              onPositionChange={updateDiagramPosition}
              onExport={exportIndividualDiagram}
            />
          )
        })
      }, [diagrams, diagramPositions, isEmpty, updateDiagramPosition, exportIndividualDiagram])

      return (
        <div
          ref={ref}
          className="flex-1 overflow-hidden border-2 border-gray-200 rounded-lg bg-white relative select-none whiteboard-container"
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
        >
          <div
            ref={diagramRef}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
              transition: isDragging ? "none" : "transform 0.2s ease-out",
              width: "100%",
              height: "100%",
              minWidth: "2000px",
              minHeight: "1500px",
              position: "relative",
            }}
            className="whiteboard-grid"
          >
            {isEmpty ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-400">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="text-sm">Your whiteboard is empty</p>
                  <p className="text-xs">Add diagrams to start visualizing</p>
                </div>
              </div>
            ) : (
              diagramElements
            )}
          </div>

          {/* Whiteboard info */}
          <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-gray-600 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Whiteboard Mode</span>
            </div>
          </div>
        </div>
      )
    },
  ),
)

DiagramPreviewWhiteboard.displayName = "DiagramPreviewWhiteboard"
