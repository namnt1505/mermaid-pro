"use client"

import { useState } from "react"
import { DiagramEditor } from "@/features/diagram/diagram-editor"
import { DiagramList } from "@/features/diagram/diagram-list"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
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
      isDiagramListOpen={isDiagramListOpen}
      isEditorOpen={isEditorOpen}
      onToggleDiagramList={() => setIsDiagramListOpen(!isDiagramListOpen)}
      onToggleEditor={() => setIsEditorOpen(!isEditorOpen)}
      onToggleMinimize={onToggleMinimize}
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
  isDiagramListOpen: boolean
  isEditorOpen: boolean
  onToggleDiagramList: () => void
  onToggleEditor: () => void
  onToggleMinimize: () => void
  onAddDiagram: () => void
  onRefreshPreview: () => void
}

function ExpandedPanel({
  currentProject,
  selectedDiagram,
  isDiagramListOpen,
  isEditorOpen,
  onToggleDiagramList,
  onToggleEditor,
  onToggleMinimize,
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
              onToggleDiagramList={onToggleDiagramList}
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
  onToggleDiagramList: () => void
}

function DiagramListSection({
  currentProject,
  isDiagramListOpen,
  onToggleDiagramList,
}: DiagramListSectionProps) {
  return (
    <div className="flex flex-col h-full">
      <Button variant="ghost" className="w-full justify-start p-1 h-auto text-xs flex-shrink-0" onClick={onToggleDiagramList}>
        {isDiagramListOpen ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronRight className="h-2.5 w-2.5" />}{" "}
        <List className="h-2.5 w-2.5 ml-1" />
        <span className="ml-1">Diagrams ({currentProject?.diagrams.length || 0})</span>
      </Button>
      {isDiagramListOpen && currentProject && (
        <ScrollArea className="flex-1 h-[calc(100%-2rem)]">
          <div className="pl-4">
            <DiagramList
              diagrams={currentProject.diagrams}
            />
          </div>
        </ScrollArea>
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
    <div className="flex flex-col h-full">
      <Button variant="ghost" className="w-full justify-start p-1 h-auto text-xs flex-shrink-0" onClick={onToggleEditor}>
        {isEditorOpen ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronRight className="h-2.5 w-2.5" />}{" "}
        <Code className="h-2.5 w-2.5 ml-1" />
        <span className="ml-1">Editor</span>
      </Button>
      {isEditorOpen && (
        <ScrollArea className="flex-1 h-[calc(100%-2rem)]">
          {selectedDiagram && currentProject ? (
            <div className="border rounded-md p-2 bg-background h-full">
              <DiagramEditor onCodeChange={onRefreshPreview} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-2 text-center text-muted-foreground border rounded-md bg-background">
              <div>
                <p className="text-xs">No diagram selected</p>
                <Button variant="outline" size="sm" onClick={onAddDiagram} className="mt-1 h-5 px-2 text-xs">
                  <PlusCircle className="h-2.5 w-2.5 mr-1" />
                  Add Diagram
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  )
}
