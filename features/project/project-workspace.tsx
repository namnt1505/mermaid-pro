"use client"

import { useState, useRef, useMemo, useCallback, useEffect } from "react"
import { useProject } from "@/lib/context/project-context"
import { ProjectSelector } from "@/features/project/project-selector"
import { AddDiagramDialog } from "@/features/diagram/add-diagram-dialog"
import { WorkspacePanel } from "@/features/workspace/workspace-panel"
import { DiagramPreviewPanel } from "@/features/diagram/diagram-preview-panel"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"

export function ProjectWorkspace() {
  const { currentProject, selectedDiagramId, selectDiagram } = useProject()
  const [isAddDiagramOpen, setIsAddDiagramOpen] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)
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
      setPreviewKey((prev) => prev + 1)
    },
    [selectDiagram],
  )

  const refreshPreview = useCallback(() => {
    setPreviewKey((prev) => prev + 1)
  }, [])

  const { leftPanelPercentage, rightPanelPercentage } = useMemo(() => {
    const leftSize = isProjectToolMinimized ? 50 : 280
    const leftPercentage = (leftSize / windowWidth) * 100
    return {
      leftPanelPercentage: leftPercentage,
      rightPanelPercentage: 100 - leftPercentage,
    }
  }, [isProjectToolMinimized, windowWidth])

  if (!currentProject) {
    return null
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
            onRefreshPreview={refreshPreview}
          />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={rightPanelPercentage} minSize={30}>
          <DiagramPreviewPanel onRefresh={refreshPreview} />
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
