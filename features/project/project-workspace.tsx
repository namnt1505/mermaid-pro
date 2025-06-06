"use client"

import { useState, useRef, useMemo, useCallback, useEffect } from "react"
import { useProjectStore } from "@/lib/hooks/use-project-store"
import { ProjectSelector } from "@/features/project/project-selector"
import { AddDiagramDialog } from "@/features/diagram/add-diagram-dialog"
import { WorkspacePanel } from "@/features/workspace/workspace-panel"
import { DiagramPreviewPanel } from "@/features/diagram/diagram-preview-panel"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"

export function ProjectWorkspace() {
  const { currentProject, selectedDiagramId, selectDiagram } = useProjectStore()
  const [isAddDiagramOpen, setIsAddDiagramOpen] = useState(false)
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
      selectDiagram(diagramId)
    },
    [selectDiagram],
  )

  const { leftPanelPercentage, rightPanelPercentage } = useMemo(() => {
    const leftSize = isProjectToolMinimized ? 50 : 280
    const leftPercentage = (leftSize / windowWidth) * 100
    return {
      leftPanelPercentage: leftPercentage,
      rightPanelPercentage: 100 - leftPercentage,
    }
  }, [isProjectToolMinimized, windowWidth])

  if (!currentProject) {
    return (
      <div className="flex h-screen flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Welcome to Mermaid Pro</h2>
            <p className="text-gray-600">Get started by creating your first project</p>
            <ProjectSelector />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      <ProjectSelector />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={leftPanelPercentage} minSize={20}>
          <WorkspacePanel
            isMinimized={isProjectToolMinimized}
            onToggleMinimize={toggleProjectTool}
            currentProject={currentProject}
            selectedDiagramId={selectedDiagramId}
            onSelectDiagram={selectDiagram}
            onAddDiagram={() => setIsAddDiagramOpen(true)}
          />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={rightPanelPercentage} minSize={30}>
          <DiagramPreviewPanel />
        </ResizablePanel>
      </ResizablePanelGroup>

      <AddDiagramDialog
        open={isAddDiagramOpen}
        onOpenChange={setIsAddDiagramOpen}
        onDiagramAdded={handleDiagramAdded}
        projectId={currentProject.id}
      />
    </div>
  )
}
