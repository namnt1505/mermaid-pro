"use client"

import { useState, useRef, useMemo, useCallback, useEffect } from "react"
import { useProject } from "@/context/project-context"
import { ProjectSelector } from "@/features/project/project-selector"
import { AddDiagramDialog } from "@/features/diagram/add-diagram-dialog"
import { WorkspacePanel } from "@/features/workspace/workspace-panel"
import { DiagramPreviewPanel } from "@/features/diagram/diagram-preview-panel"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"

export function ProjectWorkspace() {
  const { currentProject } = useProject()
  const [selectedDiagramId, setSelectedDiagramId] = useState<string | null>(currentProject?.diagrams[0]?.id || null)
  const [isAddDiagramOpen, setIsAddDiagramOpen] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)
  const [isProjectToolMinimized, setIsProjectToolMinimized] = useState(false)
  const [windowWidth, setWindowWidth] = useState(1200) // Default fallback width

  const leftPanelRef = useRef<HTMLDivElement>(null)

  // Handle window resize and initial width
  useEffect(() => {
    // Set initial window width
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth)

      const handleResize = () => {
        setWindowWidth(window.innerWidth)
      }

      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Get the selected diagram
  const selectedDiagram = useMemo(
    () => currentProject?.diagrams.find((d) => d.id === selectedDiagramId),
    [currentProject, selectedDiagramId],
  )

  // Force re-render of the preview
  const refreshPreview = useCallback(() => {
    setPreviewKey((prev) => prev + 1)
  }, [])

  // Toggle project tool panel
  const toggleProjectTool = useCallback(() => {
    setIsProjectToolMinimized((prev) => !prev)
  }, [])

  // Handle diagram selection
  const handleSelectDiagram = useCallback((id: string) => {
    setSelectedDiagramId(id)
  }, [])

  // Handle diagram added
  const handleDiagramAdded = useCallback(
    (diagramId: string) => {
      setSelectedDiagramId(diagramId)
      refreshPreview()
    },
    [refreshPreview],
  )

  // Calculate panel sizes based on minimized state - now SSR safe
  const { leftPanelSize, leftPanelPercentage, rightPanelPercentage } = useMemo(() => {
    const leftSize = isProjectToolMinimized ? 70 : 350 // Fixed pixel values
    const leftPercentage = (leftSize / windowWidth) * 100
    return {
      leftPanelSize: leftSize,
      leftPanelPercentage: leftPercentage,
      rightPanelPercentage: 100 - leftPercentage,
    }
  }, [isProjectToolMinimized, windowWidth])

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
                onSelectDiagram={handleSelectDiagram}
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
