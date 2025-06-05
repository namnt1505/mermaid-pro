import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { v4 as uuidv4 } from 'uuid';
import {
  addProject,
  setCurrentProject,
  deleteProject,
  updateProject,
  updateDiagramMetadata,
  setSelectedDiagram,
} from '@/lib/store/features/projectSlice';
import { removeDiagram, setDiagramCode } from '@/lib/store/features/editorSlice';
import type { Project, DiagramMetadata } from '@/types';

export function useProjectStore() {
  const dispatch = useDispatch();
  const projects = useSelector((state: RootState) => state.project.projects);
  const currentProject = useSelector((state: RootState) => state.project.currentProject);
  const selectedDiagramId = useSelector((state: RootState) => state.project.selectedDiagramId);

  const createProject = (name: string) => {
    const newProject: Project = {
      id: uuidv4(),
      name,
      diagrams: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch(addProject(newProject));
  };

  const selectProject = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (project) {
      dispatch(setCurrentProject(project));
    }
  };

  const removeProject = (id: string) => {
    const projectToDelete = projects.find(p => p.id === id);
    if (projectToDelete) {
      projectToDelete.diagrams.forEach(diagram => {
        dispatch(removeDiagram(diagram.id));
      });
    }
    dispatch(deleteProject(id));
  };

  const updateProjectName = (id: string, name: string) => {
    dispatch(updateProject({
      id,
      updates: { name, updatedAt: new Date().toISOString() }
    }));
  };

  const addDiagram = (projectId: string, name: string, code: string): string | undefined => {
    const id = uuidv4();
    const newDiagram: DiagramMetadata = {
      id,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(updateProject({
      id: projectId,
      updates: {
        diagrams: [...(projects.find(p => p.id === projectId)?.diagrams || []), newDiagram],
        updatedAt: new Date().toISOString()
      }
    }));

    dispatch(setDiagramCode({ diagramId: id, code }));
    return id;
  };

  const modifyDiagramMetadata = (projectId: string, diagramId: string, updates: Partial<DiagramMetadata>) => {
    // Validate input
    if (!projectId || !diagramId) {
      console.error('ProjectId and diagramId are required for updateDiagramMetadata');
      return;
    }

    // Ensure we're only handling metadata
    if ('code' in updates) {
      console.warn('Code updates should be handled through EditorSlice');
      delete updates.code;
    }

    dispatch(updateDiagramMetadata({
      projectId,
      diagramId,
      updates: {
        ...updates,
        updatedAt: new Date().toISOString()
      }
    }));
  };

  const removeDiagramFromProject = (projectId: string, diagramId: string) => {
    // Validate input
    if (!projectId || !diagramId) {
      console.error('ProjectId and diagramId are required for deleteDiagram');
      return;
    }

    // First remove the diagram data from EditorSlice
    dispatch(removeDiagram(diagramId));

    // Then update project metadata
    const project = projects.find(p => p.id === projectId);
    if (project) {
      dispatch(updateProject({
        id: projectId,
        updates: {
          diagrams: project.diagrams.filter(d => d.id !== diagramId),
          updatedAt: new Date().toISOString()
        }
      }));
    }
  };

  const selectDiagram = (id: string) => {
    dispatch(setSelectedDiagram(id));
  };

  return {
    projects,
    currentProject,
    selectedDiagramId,
    createProject,
    selectProject,
    deleteProject: removeProject,
    updateProjectName,
    addDiagram,
    updateDiagramMetadata: modifyDiagramMetadata,
    deleteDiagram: removeDiagramFromProject,
    selectDiagram,
  };
}
