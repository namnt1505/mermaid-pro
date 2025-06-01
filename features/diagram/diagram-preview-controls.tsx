"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Download, Copy } from "lucide-react"

interface DiagramPreviewControlsProps {
  zoom: number
  onZoomChange: (value: number[]) => void
  onCopyAll: () => void
  onExportAll: () => void
}

export function DiagramPreviewControls({ zoom, onZoomChange, onCopyAll, onExportAll }: DiagramPreviewControlsProps) {
  return (
    <div className="space-y-2 flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium">Zoom:</span>
        <div className="flex-1">
          <Slider value={[zoom]} min={0.3} max={3} step={0.1} onValueChange={onZoomChange} className="w-full" />
        </div>
        <span className="text-xs font-mono w-10 text-right bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
          {(zoom * 100).toFixed(0)}%
        </span>
      </div>
      <div className="flex gap-1 justify-end">
        <Button variant="outline" onClick={onCopyAll} className="flex items-center gap-1 h-6 px-2 text-xs">
          <Copy className="h-2.5 w-2.5" />
          Copy All
        </Button>
        <Button onClick={onExportAll} className="flex items-center gap-1 h-6 px-2 text-xs">
          <Download className="h-2.5 w-2.5" />
          Export All PNG
        </Button>
      </div>
    </div>
  )
}
