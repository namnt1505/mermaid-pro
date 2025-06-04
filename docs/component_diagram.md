```mermaid
componentDiagram
  title Application Component Diagram

  package "Browser" {
    package "React Application (Next.js)" {
      package "Contexts" {
        [ProjectContext]
        [WorkspaceContext]
      }

      package "Redux Store" {
        [EditorSlice]
      }

      package "Features" {
        package "Project" {
          [ProjectWorkspace]
          [ProjectSelector]
        }

        package "Workspace" {
          [WorkspacePanel]
        }

        package "Diagram" {
          [DiagramPreviewPanel]
          [DiagramEditor]
          [DiagramList]
          [AddDiagramDialog]
          [RenameDiagramDialog]

          package "Diagram Components" {
            [DiagramPreview]
            [DiagramsContainer]
            [DiagramWrapper]
            [DiagramContent]
            [DiagramHeader]
            [FlowchartDirectionDropdown]
            [FlowchartDirectionIcons]
          }
        }
      }

      package "UI Components" {
        [Button]
        [Dialog]
        [DropdownMenu]
        [Input]
        [Slider]
        [ResizablePanels]
        [MermaidJS] <<library>>
      }
    }
  }

  package "Storage" {
    [LocalStorage]
  }

  ' Relationships
  ProjectWorkspace --> WorkspacePanel
  ProjectWorkspace --> DiagramPreviewPanel
  ProjectWorkspace --> ProjectSelector
  ProjectWorkspace ..> ProjectContext

  WorkspacePanel --> DiagramList
  WorkspacePanel --> DiagramEditor
  WorkspacePanel ..> WorkspaceContext
  WorkspacePanel ..> ProjectContext

  DiagramEditor ..> EditorSlice : Reads/Writes diagram code
  DiagramEditor ..> ProjectContext : Updates diagram code

  DiagramList ..> ProjectContext : Reads diagrams, Deletes/Renames diagrams
  DiagramList ..> WorkspaceContext : Selects diagram

  DiagramPreviewPanel --> DiagramPreview
  DiagramPreviewPanel ..> EditorSlice : Reads zoom/position
  DiagramPreviewPanel ..> ProjectContext : Reads diagrams

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
