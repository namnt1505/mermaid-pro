import { configureStore } from '@reduxjs/toolkit'
import editorReducer from './features/editorSlice'
import projectReducer from './features/projectSlice'

export const store = configureStore({
  reducer: {
    editor: editorReducer,
    project: projectReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
