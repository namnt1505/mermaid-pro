"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { v4 as uuidv4 } from "uuid"
import { DEFAULT_DIAGRAMS } from "@/lib/constants"
import type { Project, Diagram } from "@/types"
import { useDispatch } from 'react-redux';
import { setDiagramCode, removeDiagram } from '@/lib/store/features/editorSlice';

interface ProjectContextType {
  projects: Project[]
  currentProject: Project | null
  createProject: (name: string) => void
  selectProject: (id: string) => void
  deleteProject: (id: string) => void
  updateProjectName: (id: string, name: string) => void
  addDiagram: (projectId: string, name: string, code: string) => string | undefined; // Modified return type
  updateDiagram: (projectId: string, diagramId: string, updates: Partial<Diagram>) => void
  deleteDiagram: (projectId: string, diagramId: string) => void
  getCombinedDiagramCode: (projectId: string) => string
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const dispatch = useDispatch();

  // Load projects from localStorage on initial render
  useEffect(() => {
    const savedProjects = localStorage.getItem("mermaid-mvp-projects")
    const savedCurrentProjectId = localStorage.getItem("mermaid-mvp-current-project")
    let projectsToLoad: Project[] = [];

    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects) as Project[]
      setProjects(parsedProjects)
      projectsToLoad = parsedProjects;

      if (savedCurrentProjectId) {
        const current = parsedProjects.find((p) => p.id === savedCurrentProjectId)
        if (current) {
          setCurrentProject(current)
        } else if (parsedProjects.length > 0) {
          setCurrentProject(parsedProjects[0])
        }
      } else if (parsedProjects.length > 0) {
        setCurrentProject(parsedProjects[0])
      }
    } else {
      // Create a default project if none exists
      const defaultProjectItem: Project = {
        id: uuidv4(),
        name: "Default Project",
        diagrams: DEFAULT_DIAGRAMS.map(d => ({...d, id: uuidv4()})),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setProjects([defaultProjectItem])
      setCurrentProject(defaultProjectItem)
      projectsToLoad = [defaultProjectItem];
    }

    // Dispatch setDiagramCode for all loaded diagrams
    if (projectsToLoad.length > 0) {
      projectsToLoad.forEach(project => {
        project.diagrams.forEach(diagram => {
          dispatch(setDiagramCode({ diagramId: diagram.id, code: diagram.code }));
        });
      });
    }
  }, [dispatch])

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem("mermaid-mvp-projects", JSON.stringify(projects))
    }
    if (currentProject) {
      localStorage.setItem("mermaid-mvp-current-project", currentProject.id)
    }
  }, [projects, currentProject])

  const createProject = (name: string) => {
    const newProject: Project = {
      id: uuidv4(),
      name,
      diagrams: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setProjects((prev) => [...prev, newProject])
    setCurrentProject(newProject)
  }

  const selectProject = (id: string) => {
    const project = projects.find((p) => p.id === id)
    if (project) {
      setCurrentProject(project)
      // Optionally, re-dispatch codes for the selected project if there's a chance of desync
      // For now, assuming initial load and updates handle this.
    }
  }

  const deleteProject = (id: string) => {
    const projectToDelete = projects.find(p => p.id === id);
    if (projectToDelete) {
      projectToDelete.diagrams.forEach(diagram => {
        dispatch(removeDiagram(diagram.id));
      });
    }

    setProjects((prev) => prev.filter((p) => p.id !== id))
    if (currentProject?.id === id) {
      const remainingProjects = projects.filter((p) => p.id !== id)
      if (remainingProjects.length > 0) {
        setCurrentProject(remainingProjects[0])
      } else {
        setCurrentProject(null)
      }
    }
  }

  const updateProjectName = (id: string, name: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              name,
              updatedAt: new Date().toISOString(),
            }
          : p,
      ),
    )
    if (currentProject?.id === id) {
      setCurrentProject((prev) =>
        prev
          ? {
              ...prev,
              name,
              updatedAt: new Date().toISOString(),
            }
          : null,
      )
    }
  }

  const addDiagram = (projectId: string, name: string, code: string): string | undefined => { // Modified return type
    const newDiagram: Diagram = {
      id: uuidv4(),
      name,
      code,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    let createdDiagramId: string | undefined = undefined;

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          createdDiagramId = newDiagram.id; // Capture the ID
          return {
            ...p,
            diagrams: [...p.diagrams, newDiagram],
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      }),
    )

    if (currentProject?.id === projectId) {
      setCurrentProject((prev) =>
        prev
          ? {
              ...prev,
              diagrams: [...prev.diagrams, newDiagram],
              updatedAt: new Date().toISOString(),
            }
          : null,
      )
    }
    // Dispatch for new diagram - this was already here and is good.
    // We ensure newDiagram.id is valid before dispatching.
    if (newDiagram.id && newDiagram.code) {
        dispatch(setDiagramCode({ diagramId: newDiagram.id, code: newDiagram.code }));
    }
    return createdDiagramId; // Return the ID
  }

  const updateDiagram = (projectId: string, diagramId: string, updates: Partial<Diagram>) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              diagrams: p.diagrams.map((d) =>
                d.id === diagramId
                  ? {
                      ...d,
                      ...updates,
                      updatedAt: new Date().toISOString(),
                    }
                  : d,
              ),
              updatedAt: new Date().toISOString(),
            }
          : p,
      ),
    )

    if (currentProject?.id === projectId) {
      setCurrentProject((prev) =>
        prev
          ? {
              ...prev,
              diagrams: prev.diagrams.map((d) =>
                d.id === diagramId
                  ? {
                      ...d,
                      ...updates,
                      updatedAt: new Date().toISOString(),
                    }
                  : d,
              ),
              updatedAt: new Date().toISOString(),
            }
          : null,
      )
    }

    if (updates.code !== undefined) {
      dispatch(setDiagramCode({ diagramId: diagramId, code: updates.code })); // Dispatch if code was updated
    }
  }

  const deleteDiagram = (projectId: string, diagramId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              diagrams: p.diagrams.filter((d) => d.id !== diagramId),
              updatedAt: new Date().toISOString(),
            }
          : p,
      ),
    )

    if (currentProject?.id === projectId) {
      setCurrentProject((prev) =>
        prev
          ? {
              ...prev,
              diagrams: prev.diagrams.filter((d) => d.id !== diagramId),
              updatedAt: new Date().toISOString(),
            }
          : null,
      )
    }
    dispatch(removeDiagram(diagramId)); // Dispatch to remove from Redux store
  }

  const getCombinedDiagramCode = (projectId: string): string => {
    const project = projects.find((p) => p.id === projectId)
    if (!project || project.diagrams.length === 0) return ""

    // Combine all diagram codes with proper separation
    return project.diagrams.map((diagram) => diagram.code).join("\n\n")
  }

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        createProject,
        selectProject,
        deleteProject,
        updateProjectName,
        addDiagram,
        updateDiagram,
        deleteDiagram,
        getCombinedDiagramCode,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider")
  }
  return context
}
