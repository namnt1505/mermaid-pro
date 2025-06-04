"use client"

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react"
import { useProject } from "@/lib/context/project-context"

interface WorkspaceContextType {
  selectedDiagramId: string | null
  isProjectToolMinimized: boolean
  isDiagramListOpen: boolean
  isEditorOpen: boolean
  previewKey: number
  selectDiagram: (id: string) => void
  toggleProjectTool: () => void
  toggleDiagramList: () => void
  toggleEditor: () => void
  refreshPreview: () => void
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { currentProject } = useProject()
  const [selectedDiagramId, setSelectedDiagramId] = useState<string | null>(currentProject?.diagrams[0]?.id || null)
  const [isProjectToolMinimized, setIsProjectToolMinimized] = useState(false)
  const [isDiagramListOpen, setIsDiagramListOpen] = useState(true)
  const [isEditorOpen, setIsEditorOpen] = useState(true)
  const [previewKey, setPreviewKey] = useState(0)

  // Update selected diagram when project changes
  useMemo(() => {
    if (currentProject && (!selectedDiagramId || !currentProject.diagrams.find((d) => d.id === selectedDiagramId))) {
      setSelectedDiagramId(currentProject.diagrams[0]?.id || null)
    }
  }, [currentProject, selectedDiagramId])

  const selectDiagram = useCallback((id: string) => {
    setSelectedDiagramId(id)
  }, [])

  const toggleProjectTool = useCallback(() => {
    setIsProjectToolMinimized((prev) => !prev)
  }, [])

  const toggleDiagramList = useCallback(() => {
    setIsDiagramListOpen((prev) => !prev)
  }, [])

  const toggleEditor = useCallback(() => {
    setIsEditorOpen((prev) => !prev)
  }, [])

  const refreshPreview = useCallback(() => {
    setPreviewKey((prev) => prev + 1)
  }, [])

  const value = useMemo(
    () => ({
      selectedDiagramId,
      isProjectToolMinimized,
      isDiagramListOpen,
      isEditorOpen,
      previewKey,
      selectDiagram,
      toggleProjectTool,
      toggleDiagramList,
      toggleEditor,
      refreshPreview,
    }),
    [
      selectedDiagramId,
      isProjectToolMinimized,
      isDiagramListOpen,
      isEditorOpen,
      previewKey,
      selectDiagram,
      toggleProjectTool,
      toggleDiagramList,
      toggleEditor,
      refreshPreview,
    ],
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider")
  }
  return context
}
