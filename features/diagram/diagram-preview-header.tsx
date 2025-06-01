"use client"

import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, Move, Hand } from "lucide-react"

interface DiagramPreviewHeaderProps {
  diagramCount: number
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onResetView: () => void
  isMoveMode: boolean
  onToggleMoveMode: () => void
}

export function DiagramPreviewHeader({
  diagramCount,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
  isMoveMode,
  onToggleMoveMode,
}: DiagramPreviewHeaderProps) {
  return (
    <div className="flex justify-between items-center flex-shrink-0">
      <h3 className="text-sm font-semibold">Diagrams ({diagramCount})</h3>
      <div className="flex gap-1">
        <Button
          variant={isMoveMode ? "default" : "outline"}
          size="icon"
          onClick={onToggleMoveMode}
          title={isMoveMode ? "Exit move mode" : "Enter move mode"}
          className="h-5 w-5"
        >
          {isMoveMode ? <Hand className="h-2.5 w-2.5" /> : <Move className="h-2.5 w-2.5" />}
        </Button>
        <Button variant="outline" size="icon" onClick={onResetView} title="Reset view" className="h-5 w-5">
          <span className="text-[10px] font-mono">1:1</span>
        </Button>
        <Button variant="outline" size="icon" onClick={onZoomOut} title="Zoom out" className="h-5 w-5">
          <ZoomOut className="h-2.5 w-2.5" />
        </Button>
        <Button variant="outline" size="icon" onClick={onZoomIn} title="Zoom in" className="h-5 w-5">
          <ZoomIn className="h-2.5 w-2.5" />
        </Button>
      </div>
    </div>
  )
}
