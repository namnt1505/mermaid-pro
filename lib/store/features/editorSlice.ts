import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const DIAGRAMS_LOCAL_STORAGE_KEY = 'diagramsData'; // Defined constant for localStorage key

// Helper function to load diagrams from localStorage
const loadDiagramsFromLocalStorage = (): Record<string, string> => {
  if (typeof window !== 'undefined') { // Check if localStorage is available
    try {
      const serializedDiagrams = localStorage.getItem(DIAGRAMS_LOCAL_STORAGE_KEY); // Used constant
      if (serializedDiagrams === null) {
        return {};
      }
      const parsedDiagrams = JSON.parse(serializedDiagrams);

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
  diagrams: Record<string, string>;
}

const initialState: EditorState = {
  zoom: 1,
  position: { x: 0, y: 0 },
  lastPosition: { x: 0, y: 0 },
  isDragging: false,
  diagrams: loadDiagramsFromLocalStorage(),
}

// Helper function to save diagrams to localStorage
const saveDiagramsToLocalStorage = (diagrams: Record<string, string>) => {
  if (typeof window !== 'undefined') { // Check if localStorage is available
    try {
      const serializedDiagrams = JSON.stringify(diagrams);
      localStorage.setItem(DIAGRAMS_LOCAL_STORAGE_KEY, serializedDiagrams); // Used constant
    } catch (e) {
      console.error(`Could not save diagrams to localStorage using key "${DIAGRAMS_LOCAL_STORAGE_KEY}"`, e); // Enhanced error message
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
      state.diagrams[action.payload.diagramId] = action.payload.code;
      saveDiagramsToLocalStorage(state.diagrams); // Save to localStorage
    },
    removeDiagram: (state, action: PayloadAction<string>) => { // diagramId is the payload
      delete state.diagrams[action.payload]; // Removes the diagram by ID
      saveDiagramsToLocalStorage(state.diagrams); // Persists the change
    },
    clearAllDiagrams: (state) => {
      state.diagrams = {};
      saveDiagramsToLocalStorage(state.diagrams); // Persists the empty state
    },
  },
})

export const {
  setZoom,
  setPosition,
  setLastPosition,
  setIsDragging,
  resetView,
  setDiagramCode,
  removeDiagram,
  clearAllDiagrams
} = editorSlice.actions;

export default editorSlice.reducer
