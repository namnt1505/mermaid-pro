"use client"

import { Button } from "@/components/ui/button"
import { Layers } from "lucide-react"
import { DiagramPreview } from "@/features/diagram/diagram-preview"
import { useProjectStore } from "@/lib/hooks/use-project-store"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store/store"

interface DiagramPreviewPanelProps {
  onRefresh: () => void
}

export function DiagramPreviewPanel({ onRefresh }: DiagramPreviewPanelProps) {
  const { currentProject } = useProjectStore();
  const diagrams = currentProject?.diagrams || [];
  const diagramStates = useSelector((state: RootState) => state.editor.diagramStates);

  // Tính toán số lượng diagram hợp lệ
  const validDiagrams = Object.values(diagramStates).filter(state => state.isValid).length;

  return (
    <div className="h-full max-h-[calc(100vh-16px)] flex flex-col space-y-2 p-2 bg-card border rounded-md shadow-sm" 
      style={{ maxHeight: "750px", minHeight: "750px" }}>
      <div className="flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Preview</h2>
          <span className="text-xs text-muted-foreground">
            ({validDiagrams}/{diagrams.length} valid)
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} className="flex items-center gap-1 h-6 px-2 text-xs">
          <Layers className="h-2.5 w-2.5" />
          Refresh
        </Button>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        {diagrams.length > 0 ? (
          <DiagramPreview />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground border rounded-md bg-background">
            <p className="text-xs">No diagrams to display</p>
          </div>
        )}
      </div>
    </div>
  );
}
