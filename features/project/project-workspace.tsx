"use client"

import { useState, useRef, useMemo, useCallback, useEffect } from "react"
import { useProject } from "@/context/project-context"
import { useWorkspace } from "@/context/workspace-context" // Added
import { ProjectSelector } from "@/features/project/project-selector"
import { AddDiagramDialog } from "@/features/diagram/add-diagram-dialog"
import { WorkspacePanel } from "@/features/workspace/workspace-panel"
import { DiagramPreviewPanel } from "@/features/diagram/diagram-preview-panel"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"

export function ProjectWorkspace() {
  const { currentProject } = useProject()
  const { selectedDiagramId, selectDiagram, refreshPreview, previewKey } = useWorkspace() // Added previewKey
  // const [selectedDiagramId, setSelectedDiagramId] = useState<string | null>(currentProject?.diagrams[0]?.id || null) // Removed
  const [isAddDiagramOpen, setIsAddDiagramOpen] = useState(false)
  // const [previewKey, setPreviewKey] = useState(0) // Removed, use from context if needed or remove if refreshPreview from context is enough
  const [isProjectToolMinimized, setIsProjectToolMinimized] = useState(false)
  const [windowWidth, setWindowWidth] = useState(1200)

  useEffect(() => {
    if (typeof window === "undefined") return
    setWindowWidth(window.innerWidth)

    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const toggleProjectTool = useCallback(() => {
    setIsProjectToolMinimized((prev) => !prev)
  }, [])

  const handleDiagramAdded = useCallback(
    (diagramId: string) => {
      selectDiagram(diagramId) // Use from context
      refreshPreview() // Use from context
    },
    [selectDiagram, refreshPreview], // Updated dependencies
  )

  const { leftPanelPercentage, rightPanelPercentage } = useMemo(() => {
    const leftSize = isProjectToolMinimized ? 50 : 280 // Reduced from 70/350
    const leftPercentage = (leftSize / windowWidth) * 100
    return {
      leftPanelPercentage: leftPercentage,
      rightPanelPercentage: 100 - leftPercentage,
    }
  }, [isProjectToolMinimized, windowWidth])

  return (
    <div className="space-y-3 h-screen flex flex-col">
      {" "}
      {/* Reduced spacing */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 p-2">
        {" "}
        {/* Reduced gap and added padding */}
        <ProjectSelector />
      </div>
      {currentProject ? (
        <div className="flex-1 min-h-0 px-2">
          {" "}
          {/* Added horizontal padding */}
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel
              defaultSize={leftPanelPercentage}
              minSize={isProjectToolMinimized ? 3 : 20} // Reduced min sizes
              maxSize={isProjectToolMinimized ? 3 : 40} // Reduced max sizes
              style={{
                minWidth: isProjectToolMinimized ? "50px" : "200px", // Reduced widths
                width: isProjectToolMinimized ? "50px" : undefined,
              }}
              className="transition-all duration-300"
            >
              <WorkspacePanel
                isMinimized={isProjectToolMinimized}
                onToggleMinimize={toggleProjectTool}
                currentProject={currentProject}
                selectedDiagramId={selectedDiagramId} // Use from context
                onSelectDiagram={selectDiagram} // Use from context
                onAddDiagram={() => setIsAddDiagramOpen(true)}
                onRefreshPreview={refreshPreview} // Use from context
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={rightPanelPercentage} minSize={60}>
              {" "}
              {/* Increased min size for preview */}
              <DiagramPreviewPanel
                key={previewKey} // previewKey from context will be used by DiagramPreviewPanel if it consumes WorkspaceContext
                diagrams={currentProject.diagrams}
                projectId={currentProject.id}
                onRefresh={refreshPreview}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center px-2">
          <div className="p-6 text-center text-muted-foreground border rounded-lg">
            {" "}
            {/* Reduced padding */}
            <p className="text-sm">No project selected. Please create a new project to get started.</p>
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
