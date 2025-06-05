"use client"

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react"

interface WorkspaceContextType {
  isProjectToolMinimized: boolean
  isDiagramListOpen: boolean
  isEditorOpen: boolean
  previewKey: number
  toggleProjectTool: () => void
  toggleDiagramList: () => void
  toggleEditor: () => void
  refreshPreview: () => void
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [isProjectToolMinimized, setIsProjectToolMinimized] = useState(false)
  const [isDiagramListOpen, setIsDiagramListOpen] = useState(true)
  const [isEditorOpen, setIsEditorOpen] = useState(true)
  const [previewKey, setPreviewKey] = useState(0)

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
      isProjectToolMinimized,
      isDiagramListOpen,
      isEditorOpen,
      previewKey,
      toggleProjectTool,
      toggleDiagramList,
      toggleEditor,
      refreshPreview,
    }),
    [
      isProjectToolMinimized,
      isDiagramListOpen,
      isEditorOpen,
      previewKey,
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
