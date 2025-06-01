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
    <div className="h-full max-h-[calc(100vh-120px)] flex flex-col items-center justify-center p-1 bg-card border rounded-md shadow-sm">
      {" "}
      {/* Added max-height */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleMinimize}
        title="Expand Project Tools"
        className="h-7 w-7 rounded-md" // Reduced from h-8 w-8
      >
        <Maximize2 className="h-3.5 w-3.5" /> {/* Slightly increased from h-3 w-3 */}
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
    <div className="h-full max-h-[calc(100vh-120px)] flex flex-col space-y-2 p-2 bg-card border rounded-md shadow-sm">
      {" "}
      {/* Added max-height */}
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold">Tools</h2> {/* Reduced text size from text-base to text-sm */}
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onAddDiagram}
            className="flex items-center gap-1 h-6 px-2 text-xs" // Reduced height from h-7 to h-6
          >
            <PlusCircle className="h-2.5 w-2.5" /> {/* Reduced icon size from h-3 w-3 to h-2.5 w-2.5 */}
            Add
          </Button>
          <Button variant="ghost" size="icon" onClick={onToggleMinimize} title="Minimize" className="h-6 w-6">
            {" "}
            {/* Reduced size from h-7 w-7 to h-6 w-6 */}
            <Minimize2 className="h-2.5 w-2.5" /> {/* Reduced icon size from h-3 w-3 to h-2.5 w-2.5 */}
          </Button>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        {" "}
        {/* Added overflow-hidden */}
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
    <div className="space-y-1">
      <Button variant="ghost" className="w-full justify-start p-1 h-auto text-xs" onClick={onToggleDiagramList}>
        {isDiagramListOpen ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronRight className="h-2.5 w-2.5" />}{" "}
        {/* Reduced icon size */}
        <List className="h-2.5 w-2.5 ml-1" /> {/* Reduced icon size */}
        <span className="ml-1">Diagrams ({currentProject?.diagrams.length || 0})</span>
      </Button>
      {isDiagramListOpen && currentProject && (
        <div className="pl-4">
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
    <div className="space-y-1 h-full flex flex-col">
      <Button variant="ghost" className="w-full justify-start p-1 h-auto text-xs" onClick={onToggleEditor}>
        {isEditorOpen ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronRight className="h-2.5 w-2.5" />}{" "}
        {/* Reduced icon size */}
        <Code className="h-2.5 w-2.5 ml-1" /> {/* Reduced icon size */}
        <span className="ml-1">Editor</span>
      </Button>
      {isEditorOpen && (
        <div className="flex-1 min-h-0">
          {selectedDiagram && currentProject ? (
            <div className="h-full border rounded-md p-2 bg-background">
              <DiagramEditor diagram={selectedDiagram} projectId={currentProject.id} onCodeChange={onRefreshPreview} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-2 text-center text-muted-foreground border rounded-md bg-background">
              <div>
                <p className="text-xs">No diagram selected</p>
                <Button variant="outline" size="sm" onClick={onAddDiagram} className="mt-1 h-5 px-2 text-xs">
                  {" "}
                  {/* Reduced height from h-6 to h-5 */}
                  <PlusCircle className="h-2.5 w-2.5 mr-1" />
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
