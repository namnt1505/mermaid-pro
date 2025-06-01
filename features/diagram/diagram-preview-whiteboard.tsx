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
  isMoveMode: boolean
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
        isMoveMode,
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

          console.log(`Rendering diagram ${diagram.id} at position:`, diagramPosition)

          return (
            <DraggableDiagram
              key={diagram.id}
              diagram={diagram}
              index={index}
              position={diagramPosition}
              onPositionChange={(id, newPosition) => {
                console.log("DiagramPreviewWhiteboard: Position change callback:", id, newPosition)
                updateDiagramPosition(id, newPosition)
              }}
              onExport={exportIndividualDiagram}
              isMoveMode={isMoveMode}
            />
          )
        })
      }, [diagrams, diagramPositions, isEmpty, updateDiagramPosition, exportIndividualDiagram, isMoveMode])

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
              <div className={`w-2 h-2 rounded-full ${isMoveMode ? "bg-orange-400" : "bg-green-400"}`}></div>
              <span>{isMoveMode ? "Move Mode" : "View Mode"}</span>
            </div>
          </div>

          {/* Debug info */}
          <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-gray-600 border border-gray-200 shadow-sm">
            <div className="flex flex-col gap-1">
              <span>Debug: {Object.keys(diagramPositions).length} positions</span>
              <button
                onClick={() => console.log("Current positions:", diagramPositions)}
                className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-0.5 rounded"
              >
                Log positions
              </button>
            </div>
          </div>
        </div>
      )
    },
  ),
)

DiagramPreviewWhiteboard.displayName = "DiagramPreviewWhiteboard"
