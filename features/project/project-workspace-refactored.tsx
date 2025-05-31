"use client"

import { useRef } from "react"
import { useProject } from "@/context/project-context"
import { useWorkspace } from "@/context/workspace-context"
import { usePanelSize } from "@/hooks/use-panel-size"
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"
import { ProjectSelector } from "@/features/project/project-selector"
import { AddDiagramDialog } from "@/features/diagram/add-diagram-dialog"
import { WorkspacePanel } from "@/features/workspace/workspace-panel"
import { DiagramPreviewPanel } from "@/features/diagram/diagram-preview-panel"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { useState } from "react"

export function ProjectWorkspaceRefactored() {
  const { currentProject } = useProject()
  const { selectedDiagramId, isProjectToolMinimized, previewKey, selectDiagram, toggleProjectTool, refreshPreview } =
    useWorkspace()

  const [isAddDiagramOpen, setIsAddDiagramOpen] = useState(false)
  const leftPanelRef = useRef<HTMLDivElement>(null)

  // Calculate panel sizes based on minimized state
  const { leftPanelPercentage, rightPanelPercentage } = usePanelSize(isProjectToolMinimized)

  // Register keyboard shortcut for toggling panel
  useKeyboardShortcut({ key: "b", ctrlKey: true }, toggleProjectTool, !!currentProject)

  // Handle diagram added
  const handleDiagramAdded = (diagramId: string) => {
    selectDiagram(diagramId)
    refreshPreview()
  }

  return (
    <div className="space-y-6 h-screen flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <ProjectSelector />
      </div>

      {currentProject ? (
        <div className="flex-1 min-h-0">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel
              ref={leftPanelRef}
              defaultSize={leftPanelPercentage}
              minSize={isProjectToolMinimized ? 5 : 25}
              maxSize={isProjectToolMinimized ? 5 : 50}
              style={{
                minWidth: isProjectToolMinimized ? "70px" : "250px",
                width: isProjectToolMinimized ? "70px" : undefined,
              }}
              className="transition-all duration-300"
            >
              <WorkspacePanel
                isMinimized={isProjectToolMinimized}
                onToggleMinimize={toggleProjectTool}
                currentProject={currentProject}
                selectedDiagramId={selectedDiagramId}
                onSelectDiagram={selectDiagram}
                onAddDiagram={() => setIsAddDiagramOpen(true)}
                onRefreshPreview={refreshPreview}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={rightPanelPercentage} minSize={50}>
              <DiagramPreviewPanel
                key={previewKey}
                diagrams={currentProject.diagrams}
                projectId={currentProject.id}
                onRefresh={refreshPreview}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="p-8 text-center text-muted-foreground border rounded-lg">
            <p>No project selected. Please create a new project to get started.</p>
          </div>
        </div>
      )}

      <AddDiagramDialog
        open={isAddDiagramOpen}
        onOpenChange={setIsAddDiagramOpen}
        projectId={currentProject?.id || ""}
        onDiagramAdded={handleDiagramAdded}
      />
    </div>
  )
}
