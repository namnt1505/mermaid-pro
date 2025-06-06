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

  const toggleProjectTool = useCallback(() => {
    setIsProjectToolMinimized((prev) => !prev)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    setWindowWidth(window.innerWidth)

    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + B to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        toggleProjectTool()
      }
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("keydown", handleKeyDown)
    
    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [toggleProjectTool])

  const handleDiagramAdded = useCallback(
    (diagramId: string) => {
      selectDiagram(diagramId)
    },
    [selectDiagram],
  )

  const { leftPanelSize, rightPanelSize } = useMemo(() => {
    // Use percentage-based sizing for better responsiveness
    if (isProjectToolMinimized) {
      return {
        leftPanelSize: 3,  // 3% when minimized (more space for content)
        rightPanelSize: 97 // 97% for main content
      }
    }
    
    // Responsive sizing based on screen width
    if (windowWidth < 768) {
      // Mobile: smaller left panel
      return {
        leftPanelSize: 40,
        rightPanelSize: 60
      }
    } else if (windowWidth < 1024) {
      // Tablet: medium left panel
      return {
        leftPanelSize: 30,
        rightPanelSize: 70
      }
    } else if (windowWidth < 1400) {
      // Desktop: balanced
      return {
        leftPanelSize: 22,
        rightPanelSize: 78
      }
    } else if (windowWidth < 1920) {
      // Large desktop: more space for preview
      return {
        leftPanelSize: 18,
        rightPanelSize: 82
      }
    } else {
      // Ultra-wide: maximize preview space
      return {
        leftPanelSize: 15,
        rightPanelSize: 85
      }
    }
  }, [isProjectToolMinimized, windowWidth])

  if (!currentProject) {
    return (
      <div className="w-full h-full flex flex-col">
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
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 w-full py-2">
        <ProjectSelector />
      </div>
      <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0 w-full">
        <ResizablePanel 
          defaultSize={leftPanelSize} 
          minSize={isProjectToolMinimized ? 3 : 15}
          maxSize={isProjectToolMinimized ? 8 : 40}
          className="relative h-full"
        >
          <WorkspacePanel
            isMinimized={isProjectToolMinimized}
            onToggleMinimize={toggleProjectTool}
            currentProject={currentProject}
            selectedDiagramId={selectedDiagramId}
            onSelectDiagram={selectDiagram}
            onAddDiagram={() => setIsAddDiagramOpen(true)}
          />
        </ResizablePanel>
        <ResizableHandle 
          withHandle 
          className="w-2 bg-border hover:bg-accent transition-colors duration-200 h-full"
        />
        <ResizablePanel 
          defaultSize={rightPanelSize} 
          minSize={60}
          className="relative h-full"
        >
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
