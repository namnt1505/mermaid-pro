export interface DiagramMetadata {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface DiagramCode {
  code: string
}

// Combined type for backwards compatibility
export interface Diagram extends DiagramMetadata {
  code: string
}

export interface Project {
  id: string
  name: string
  diagrams: DiagramMetadata[]
  createdAt: string
  updatedAt: string
}
