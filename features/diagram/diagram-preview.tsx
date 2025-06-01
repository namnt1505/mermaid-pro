"use client"

import { useRef } from "react"
import { DiagramPreviewHeader } from "./diagram-preview-header"
import { DiagramPreviewWhiteboard } from "./diagram-preview-whiteboard"
import { DiagramPreviewControls } from "./diagram-preview-controls"
import { useDiagramInteraction } from "@/hooks/use-diagram-interaction"
import { useDiagramExport } from "@/hooks/use-diagram-export"
import { useDiagramPositions } from "@/hooks/use-diagram-positions"
import type { Diagram } from "@/types"

interface DiagramPreviewProps {
  diagrams: Diagram[]
  projectId: string
}

export function DiagramPreview({ diagrams, projectId }: DiagramPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const diagramRef = useRef<HTMLDivElement>(null)

  // Custom hooks for different concerns
  const { zoom, position, isDragging, handlers } = useDiagramInteraction(containerRef)
  const { exportAsPNG, copyToClipboard, exportIndividualDiagram } = useDiagramExport(
    diagramRef,
    projectId,
    position,
    zoom,
  )
  const { diagramPositions, updateDiagramPosition, resetPositions } = useDiagramPositions(projectId, diagrams)

  const handleResetView = () => {
    handlers.resetView()
    resetPositions()
  }

  return (
    <div className="space-y-2 h-full flex flex-col">
      <DiagramPreviewHeader
        diagramCount={diagrams.length}
        zoom={zoom}
        onZoomIn={handlers.handleZoomIn}
        onZoomOut={handlers.handleZoomOut}
        onResetView={handleResetView}
      />

      <DiagramPreviewWhiteboard
        ref={containerRef}
        diagramRef={diagramRef}
        zoom={zoom}
        position={position}
        isDragging={isDragging}
        onMouseDown={handlers.handleMouseDown}
        onMouseMove={handlers.handleMouseMove}
        onMouseUp={handlers.handleMouseUp}
        onMouseLeave={handlers.handleMouseLeave}
        isEmpty={!diagrams || diagrams.length === 0}
        diagrams={diagrams}
        diagramPositions={diagramPositions}
        updateDiagramPosition={updateDiagramPosition}
        exportIndividualDiagram={exportIndividualDiagram}
      />

      <DiagramPreviewControls
        zoom={zoom}
        onZoomChange={handlers.handleZoomChange}
        onCopyAll={copyToClipboard}
        onExportAll={exportAsPNG}
      />
    </div>
  )
}
