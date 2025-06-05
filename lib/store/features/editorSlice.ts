import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const DIAGRAMS_LOCAL_STORAGE_KEY = 'diagramsData'; // Defined constant for localStorage key

// Helper function to load diagrams from localStorage
const loadDiagramsFromLocalStorage = (): Record<string, string> => {
  if (typeof window !== 'undefined') { // Check if localStorage is available
    try {
      const serializedDiagrams = localStorage.getItem(DIAGRAMS_LOCAL_STORAGE_KEY); // Used constant
      if (!serializedDiagrams) {
        console.info(`No diagrams found in localStorage with key "${DIAGRAMS_LOCAL_STORAGE_KEY}"`);
        return {};
      }

      let parsedDiagrams;
      try {
        parsedDiagrams = JSON.parse(serializedDiagrams);
      } catch (parseError) {
        console.error(`Invalid JSON in localStorage for key "${DIAGRAMS_LOCAL_STORAGE_KEY}"`, parseError);
        return {};
      }

      // Enhanced validation for Record<string, string>
      if (typeof parsedDiagrams === 'object' && parsedDiagrams !== null && !Array.isArray(parsedDiagrams)) {
        for (const key in parsedDiagrams) {
          if (Object.prototype.hasOwnProperty.call(parsedDiagrams, key)) {
            if (typeof parsedDiagrams[key] !== 'string') {
              console.warn(`Invalid data type in localStorage for ${DIAGRAMS_LOCAL_STORAGE_KEY}['${key}'], expected string, but found ${typeof parsedDiagrams[key]}.`);
              return {}; // Return empty if any value is not a string
            }
          }
        }
        return parsedDiagrams as Record<string, string>; // Type assertion after validation
      }
      // More specific warnings for invalid data structure
      if (Array.isArray(parsedDiagrams)) {
        console.warn(`Invalid data structure in localStorage for ${DIAGRAMS_LOCAL_STORAGE_KEY}: expected a plain object but found an array.`);
      } else {
        console.warn(`Invalid data structure in localStorage for ${DIAGRAMS_LOCAL_STORAGE_KEY}: expected an object but found ${typeof parsedDiagrams}.`);
      }
      return {};
    } catch (e) {
      console.error(`Could not load diagrams from localStorage using key "${DIAGRAMS_LOCAL_STORAGE_KEY}"`, e); // Enhanced error message
      return {};
    }
  }
  return {};
};

interface EditorState {
  zoom: number
  position: {
    x: number
    y: number
  }
  lastPosition: {
    x: number
    y: number
  }
  isDragging: boolean
  diagrams: Record<string, string>
  diagramStates: Record<string, {
    lastModified: string
    isValid: boolean
    error?: string
  }>
}

const initialState: EditorState = {
  zoom: 1,
  position: { x: 0, y: 0 },
  lastPosition: { x: 0, y: 0 },
  isDragging: false,
  diagrams: loadDiagramsFromLocalStorage(),
  diagramStates: {}
}

// Helper function to save diagrams to localStorage
const saveDiagramsToLocalStorage = (diagrams: Record<string, string>) => {
  if (typeof window !== 'undefined') {
    try {
      // Validate input
      if (typeof diagrams !== 'object' || diagrams === null || Array.isArray(diagrams)) {
        throw new Error('Invalid diagrams data structure');
      }

      // Validate each diagram code is a string
      for (const [id, code] of Object.entries(diagrams)) {
        if (typeof code !== 'string') {
          throw new Error(`Invalid code type for diagram ${id}: ${typeof code}`);
        }
      }

      const serializedDiagrams = JSON.stringify(diagrams);
      localStorage.setItem(DIAGRAMS_LOCAL_STORAGE_KEY, serializedDiagrams);
    } catch (e) {
      console.error(`Could not save diagrams to localStorage using key "${DIAGRAMS_LOCAL_STORAGE_KEY}"`, e);
      // Optionally, we could try to save a subset of valid diagrams
    }
  }
};

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload
    },
    setPosition: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.position = action.payload
    },
    setLastPosition: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.lastPosition = action.payload
    },
    setIsDragging: (state, action: PayloadAction<boolean>) => {
      state.isDragging = action.payload
    },
    resetView: (state) => {
      state.zoom = 1
      state.position = { x: 0, y: 0 }
      state.lastPosition = { x: 0, y: 0 }
      state.isDragging = false
    },
    setDiagramCode: (state, action: PayloadAction<{ diagramId: string; code: string }>) => {
      const { diagramId, code } = action.payload;
      state.diagrams[diagramId] = code;
      state.diagramStates[diagramId] = {
        lastModified: new Date().toISOString(),
        isValid: true
      };
      saveDiagramsToLocalStorage(state.diagrams);
    },
    removeDiagram: (state, action: PayloadAction<string>) => {
      const diagramId = action.payload;
      delete state.diagrams[diagramId];
      delete state.diagramStates[diagramId];
      saveDiagramsToLocalStorage(state.diagrams);
    },
    setDiagramValidity: (state, action: PayloadAction<{ diagramId: string; isValid: boolean; error?: string }>) => {
      const { diagramId, isValid, error } = action.payload;
      state.diagramStates[diagramId] = {
        ...state.diagramStates[diagramId],
        isValid,
        error
      };
    },
    importDiagrams: (state, action: PayloadAction<Record<string, string>>) => {
      state.diagrams = { ...state.diagrams, ...action.payload };
      // Reset all states for imported diagrams
      Object.keys(action.payload).forEach(diagramId => {
        state.diagramStates[diagramId] = {
          lastModified: new Date().toISOString(),
          isValid: true
        };
      });
      saveDiagramsToLocalStorage(state.diagrams);
    },
    clearAllDiagrams: (state) => {
      state.diagrams = {};
      state.diagramStates = {};
      saveDiagramsToLocalStorage(state.diagrams);
    }
  },
})

export const {
  setZoom,
  setPosition,
  setLastPosition,
  setIsDragging,
  resetView,
  importDiagrams,
  setDiagramCode,
  removeDiagram,
  setDiagramValidity,
  clearAllDiagrams
} = editorSlice.actions;

export default editorSlice.reducer
