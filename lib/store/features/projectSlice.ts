import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Project, DiagramMetadata } from '@/types';

const PROJECTS_STORAGE_KEY = 'mermaid-mvp-projects';
const CURRENT_PROJECT_KEY = 'mermaid-mvp-current-project';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  selectedDiagramId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  selectedDiagramId: null,
  loading: false,
  error: null
};

// Helper functions for localStorage
const loadProjectsFromStorage = (): Project[] => {
  if (typeof window === 'undefined') return [];

  try {
    const savedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!savedProjects) return [];

    const parsed = JSON.parse(savedProjects);
    if (!Array.isArray(parsed)) {
      console.error('Invalid projects data structure in localStorage');
      return [];
    }

    return parsed;
  } catch (e) {
    console.error('Failed to load projects from localStorage:', e);
    return [];
  }
};

export const initializeProjects = createAsyncThunk(
  'project/initialize',
  async () => {
    const projects = loadProjectsFromStorage();
    const savedCurrentProjectId = localStorage.getItem(CURRENT_PROJECT_KEY);
    return {
      projects,
      currentProjectId: savedCurrentProjectId
    };
  }
);

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(action.payload));
    },

    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
      if (action.payload) {
        localStorage.setItem(CURRENT_PROJECT_KEY, action.payload.id);
      } else {
        localStorage.removeItem(CURRENT_PROJECT_KEY);
      }
    },

    setSelectedDiagram: (state, action: PayloadAction<string | null>) => {
      state.selectedDiagramId = action.payload;
    },

    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload);
      state.currentProject = action.payload;
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(state.projects));
      localStorage.setItem(CURRENT_PROJECT_KEY, action.payload.id);
    },

    updateProject: (state, action: PayloadAction<{ id: string; updates: Partial<Project> }>) => {
      const { id, updates } = action.payload;
      state.projects = state.projects.map(project =>
        project.id === id ? { ...project, ...updates } : project
      );
      if (state.currentProject?.id === id) {
        state.currentProject = { ...state.currentProject, ...updates };
      }
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(state.projects));
    },

    deleteProject: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.projects = state.projects.filter(p => p.id !== id);
      if (state.currentProject?.id === id) {
        state.currentProject = state.projects[0] || null;
        if (state.currentProject) {
          localStorage.setItem(CURRENT_PROJECT_KEY, state.currentProject.id);
        } else {
          localStorage.removeItem(CURRENT_PROJECT_KEY);
        }
      }
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(state.projects));
    },

    updateDiagramMetadata: (state, action: PayloadAction<{
      projectId: string;
      diagramId: string;
      updates: Partial<DiagramMetadata>;
    }>) => {
      const { projectId, diagramId, updates } = action.payload;
      state.projects = state.projects.map(project => {
        if (project.id !== projectId) return project;
        return {
          ...project,
          diagrams: project.diagrams.map(diagram =>
            diagram.id === diagramId ? { ...diagram, ...updates } : diagram
          )
        };
      });
      if (state.currentProject?.id === projectId) {
        state.currentProject = {
          ...state.currentProject,
          diagrams: state.currentProject.diagrams.map(diagram =>
            diagram.id === diagramId ? { ...diagram, ...updates } : diagram
          )
        };
      }
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(state.projects));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeProjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload.projects;
        if (action.payload.currentProjectId) {
          state.currentProject = state.projects.find(
            p => p.id === action.payload.currentProjectId
          ) || state.projects[0] || null;
        } else {
          state.currentProject = state.projects[0] || null;
        }
      })
      .addCase(initializeProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to initialize projects';
      });
  }
});

export const {
  setProjects,
  setCurrentProject,
  setSelectedDiagram,
  addProject,
  updateProject,
  deleteProject,
  updateDiagramMetadata
} = projectSlice.actions;

export default projectSlice.reducer;
