"use client"

import { Button } from "@/components/ui/button"
import { Layers } from "lucide-react"
import { DiagramPreview } from "@/features/diagram/diagram-preview"
import type { Diagram } from "@/types"

interface DiagramPreviewPanelProps {
  diagrams: Diagram[]
  projectId: string
  onRefresh: () => void
}

export function DiagramPreviewPanel({ diagrams, projectId, onRefresh }: DiagramPreviewPanelProps) {
  return (
    <div className="h-full max-h-[calc(100vh-120px)] flex flex-col space-y-2 p-2 bg-card border rounded-md shadow-sm">
      {" "}
      {/* Added max-height */}
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold">Preview</h2> {/* Reduced text size from text-base to text-sm */}
        <Button variant="outline" size="sm" onClick={onRefresh} className="flex items-center gap-1 h-6 px-2 text-xs">
          {" "}
          {/* Reduced height from h-7 to h-6 */}
          <Layers className="h-2.5 w-2.5" /> {/* Reduced icon size from h-3 w-3 to h-2.5 w-2.5 */}
          Refresh
        </Button>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        {" "}
        {/* Added overflow-hidden */}
        {diagrams.length > 0 ? (
          <DiagramPreview diagrams={diagrams} projectId={projectId} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground border rounded-md bg-background">
            <p className="text-xs">No diagrams to display</p>
          </div>
        )}
      </div>
    </div>
  )
}
