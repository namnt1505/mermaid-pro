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
    <div className="h-full flex flex-col space-y-4 p-4 bg-card border rounded-lg shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Preview</h2>
        <Button variant="outline" size="sm" onClick={onRefresh} className="flex items-center gap-1">
          <Layers className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      <div className="flex-1 min-h-0">
        {diagrams.length > 0 ? (
          <DiagramPreview diagrams={diagrams} projectId={projectId} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground border rounded-lg bg-background">
            <p>No diagrams to display</p>
          </div>
        )}
      </div>
    </div>
  )
}
