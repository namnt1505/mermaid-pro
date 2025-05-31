"use client"

import { useState } from "react"
import { DiagramEditor } from "@/features/diagram/diagram-editor"
import { DiagramList } from "@/features/diagram/diagram-list"
import { Button } from "@/components/ui/button"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { PlusCircle, ChevronDown, ChevronRight, Code, List, Minimize2, Maximize2 } from "lucide-react"
import type { Project, Diagram } from "@/types"

interface WorkspacePanelProps {
  isMinimized: boolean
  onToggleMinimize: () => void
  currentProject: Project
  selectedDiagramId: string | null
  onSelectDiagram: (id: string) => void
  onAddDiagram: () => void
  onRefreshPreview: () => void
}

export function WorkspacePanel({
  isMinimized,
  onToggleMinimize,
  currentProject,
  selectedDiagramId,
  onSelectDiagram,
  onAddDiagram,
  onRefreshPreview,
}: WorkspacePanelProps) {
  const [isDiagramListOpen, setIsDiagramListOpen] = useState(true)
  const [isEditorOpen, setIsEditorOpen] = useState(true)

  // Get the selected diagram
  const selectedDiagram = currentProject?.diagrams.find((d) => d.id === selectedDiagramId)

  if (isMinimized) {
    return <MinimizedPanel onToggleMinimize={onToggleMinimize} />
  }

  return (
    <ExpandedPanel
      currentProject={currentProject}
      selectedDiagram={selectedDiagram}
      selectedDiagramId={selectedDiagramId}
      isDiagramListOpen={isDiagramListOpen}
      isEditorOpen={isEditorOpen}
      onToggleDiagramList={() => setIsDiagramListOpen(!isDiagramListOpen)}
      onToggleEditor={() => setIsEditorOpen(!isEditorOpen)}
      onToggleMinimize={onToggleMinimize}
      onSelectDiagram={onSelectDiagram}
      onAddDiagram={onAddDiagram}
      onRefreshPreview={onRefreshPreview}
    />
  )
}

function MinimizedPanel({ onToggleMinimize }: { onToggleMinimize: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-1 bg-card border rounded-lg shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleMinimize}
        title="Expand Project Tools"
        className="h-10 w-10 rounded-full"
      >
        <Maximize2 className="h-5 w-5" />
      </Button>
    </div>
  )
}

interface ExpandedPanelProps {
  currentProject: Project
  selectedDiagram: Diagram | undefined
  selectedDiagramId: string | null
  isDiagramListOpen: boolean
  isEditorOpen: boolean
  onToggleDiagramList: () => void
  onToggleEditor: () => void
  onToggleMinimize: () => void
  onSelectDiagram: (id: string) => void
  onAddDiagram: () => void
  onRefreshPreview: () => void
}

function ExpandedPanel({
  currentProject,
  selectedDiagram,
  selectedDiagramId,
  isDiagramListOpen,
  isEditorOpen,
  onToggleDiagramList,
  onToggleEditor,
  onToggleMinimize,
  onSelectDiagram,
  onAddDiagram,
  onRefreshPreview,
}: ExpandedPanelProps) {
  return (
    <div className="h-full flex flex-col space-y-4 p-4 bg-card border rounded-lg shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Project Tools</h2>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={onAddDiagram} className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" />
            Add
          </Button>
          <Button variant="ghost" size="icon" onClick={onToggleMinimize} title="Minimize">
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Resizable sections for Diagram List and Editor */}
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="vertical" className="h-full">
          <ResizablePanel defaultSize={40} minSize={20}>
            <DiagramListSection
              currentProject={currentProject}
              isDiagramListOpen={isDiagramListOpen}
              selectedDiagramId={selectedDiagramId}
              onToggleDiagramList={onToggleDiagramList}
              onSelectDiagram={onSelectDiagram}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={60} minSize={30}>
            <EditorSection
              currentProject={currentProject}
              selectedDiagram={selectedDiagram}
              isEditorOpen={isEditorOpen}
              onToggleEditor={onToggleEditor}
              onAddDiagram={onAddDiagram}
              onRefreshPreview={onRefreshPreview}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}

interface DiagramListSectionProps {
  currentProject: Project
  isDiagramListOpen: boolean
  selectedDiagramId: string | null
  onToggleDiagramList: () => void
  onSelectDiagram: (id: string) => void
}

function DiagramListSection({
  currentProject,
  isDiagramListOpen,
  selectedDiagramId,
  onToggleDiagramList,
  onSelectDiagram,
}: DiagramListSectionProps) {
  return (
    <div className="space-y-2">
      <Button variant="ghost" className="w-full justify-start p-2 h-auto" onClick={onToggleDiagramList}>
        {isDiagramListOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <List className="h-4 w-4 ml-1" />
        <span className="ml-2">Diagrams ({currentProject?.diagrams.length || 0})</span>
      </Button>

      {isDiagramListOpen && currentProject && (
        <div className="pl-6">
          <DiagramList
            diagrams={currentProject.diagrams}
            selectedDiagramId={selectedDiagramId}
            onSelectDiagram={onSelectDiagram}
          />
        </div>
      )}
    </div>
  )
}

interface EditorSectionProps {
  currentProject: Project
  selectedDiagram: Diagram | undefined
  isEditorOpen: boolean
  onToggleEditor: () => void
  onAddDiagram: () => void
  onRefreshPreview: () => void
}

function EditorSection({
  currentProject,
  selectedDiagram,
  isEditorOpen,
  onToggleEditor,
  onAddDiagram,
  onRefreshPreview,
}: EditorSectionProps) {
  return (
    <div className="space-y-2 h-full flex flex-col">
      <Button variant="ghost" className="w-full justify-start p-2 h-auto" onClick={onToggleEditor}>
        {isEditorOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <Code className="h-4 w-4 ml-1" />
        <span className="ml-2">Editor</span>
      </Button>

      {isEditorOpen && (
        <div className="flex-1 min-h-0">
          {selectedDiagram && currentProject ? (
            <div className="h-full border rounded-lg p-3 bg-background">
              <DiagramEditor diagram={selectedDiagram} projectId={currentProject.id} onCodeChange={onRefreshPreview} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-4 text-center text-muted-foreground border rounded-lg bg-background">
              <div>
                <p className="text-sm">No diagram selected</p>
                <Button variant="outline" size="sm" onClick={onAddDiagram} className="mt-2">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Diagram
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
