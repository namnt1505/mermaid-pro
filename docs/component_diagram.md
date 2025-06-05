```mermaid
classDiagram
  title Application Component Diagram

  class AppPage // Represents app/page.tsx
  class ProjectContext
  class EditorSlice
  class ProjectWorkspace
  class ProjectSelector
  class WorkspacePanel
  class DiagramPreviewPanel
  class DiagramEditor
  class DiagramList
  class AddDiagramDialog
  class RenameDiagramDialog
  class DiagramPreview
  class DiagramsContainer
  class DiagramWrapper
  class DiagramContent
  class DiagramHeader
  class FlowchartDirectionDropdown
  class FlowchartDirectionIcons
  class Button
  class Dialog
  class DropdownMenu
  class Input
  class Slider
  class ResizablePanels
  class MermaidJS
  class LocalStorage

  AppPage --> ProjectWorkspace // Main page renders ProjectWorkspace

  ProjectWorkspace --> WorkspacePanel
  ProjectWorkspace --> DiagramPreviewPanel
  ProjectWorkspace --> ProjectSelector
  ProjectWorkspace ..> ProjectContext

  WorkspacePanel --> DiagramList
  WorkspacePanel --> DiagramEditor

  DiagramEditor ..> EditorSlice : Reads/Writes diagram code
  DiagramList ..> ProjectContext : Reads diagrams, Selects/Deletes/Renames diagrams

  DiagramPreviewPanel --> DiagramPreview
  DiagramPreviewPanel ..> EditorSlice : Reads zoom/position
  DiagramPreviewPanel ..> ProjectContext : Gets selected diagram

  DiagramPreview --> DiagramsContainer
  DiagramPreview ..> EditorSlice : Dispatches zoom/pan actions

  DiagramsContainer --> DiagramWrapper

  DiagramWrapper --> DiagramHeader
  DiagramWrapper --> DiagramContent

  DiagramContent --> FlowchartDirectionDropdown : (if flowchart)
  DiagramContent ..> EditorSlice : Reads diagram code
  DiagramContent ..> MermaidJS : Renders SVG

  FlowchartDirectionDropdown --> FlowchartDirectionIcons
  FlowchartDirectionDropdown ..> EditorSlice : Dispatches setDiagramCode

  ProjectContext ..> LocalStorage : Saves/Loads projects
  EditorSlice ..> LocalStorage : Saves/Loads diagram codes (via diagramsData key)

  AddDiagramDialog ..> ProjectContext : Adds new diagram
  RenameDiagramDialog ..> ProjectContext : Updates diagram name

  ProjectSelector ..> ProjectContext : Selects project
```