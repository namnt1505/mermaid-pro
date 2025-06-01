import { createSlice, PayloadAction } from '@reduxjs/toolkit'

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
}

const initialState: EditorState = {
  zoom: 1,
  position: { x: 0, y: 0 },
  lastPosition: { x: 0, y: 0 },
  isDragging: false,
}

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
  },
})

export const { setZoom, setPosition, setLastPosition, setIsDragging, resetView } = editorSlice.actions
export default editorSlice.reducer
