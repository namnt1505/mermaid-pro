export interface Diagram {
  id: string
  name: string
  code: string
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  diagrams: Diagram[]
  createdAt: string
  updatedAt: string
}
