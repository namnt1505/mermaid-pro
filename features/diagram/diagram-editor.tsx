"use client"

import { useEffect, useRef } from "react"
import { useProjectStore } from "@/lib/hooks/use-project-store"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/lib/store/store"
import type * as Monaco from "monaco-editor"
import CodeEditor from "@uiw/react-textarea-code-editor"
import { setDiagramCode, setDiagramValidity } from "@/lib/store/features/editorSlice"
import mermaid from "mermaid"

interface DiagramEditorProps {
  onCodeChange?: () => void
}

export function DiagramEditor({ onCodeChange }: DiagramEditorProps) {
  const { currentProject, selectedDiagramId } = useProjectStore()
  const dispatch = useDispatch()
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoEditorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)

  // Get metadata from ProjectContext
  const diagram = currentProject?.diagrams.find(d => d.id === selectedDiagramId)
  
  // Get code from EditorSlice
  const code = useSelector((state: RootState) => 
    selectedDiagramId ? state.editor.diagrams[selectedDiagramId] : undefined
  )

  useEffect(() => {
    if (typeof window === "undefined" || !diagram || !currentProject || !selectedDiagramId || code === undefined) return

    let monaco: typeof Monaco
    let cleanup = () => {}

    import("monaco-editor").then((module) => {
      monaco = module
      if (editorRef.current) {
        try {
          // Dispose previous editor if exists
          if (monacoEditorRef.current) {
            monacoEditorRef.current.dispose()
          }

          // Try to initialize Monaco Editor
          monacoEditorRef.current = monaco.editor.create(editorRef.current, {
            value: code,
            language: "markdown",
            theme: "vs-dark",
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: true,
            lineNumbers: "on",
            wordWrap: "on",
            fontSize: 12,
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            glyphMargin: false,
            scrollbar: {
              vertical: "auto",
              horizontal: "auto",
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
          })

          monacoEditorRef.current.onDidChangeModelContent(() => {
            if (monacoEditorRef.current && selectedDiagramId) {
              const newCode = monacoEditorRef.current.getValue()
              dispatch(setDiagramCode({ diagramId: selectedDiagramId, code: newCode }))
              if (onCodeChange) {
                onCodeChange()
              }
            }
          })

          cleanup = () => {
            if (monacoEditorRef.current) {
              monacoEditorRef.current.dispose()
            }
          }
        } catch (error) {
          console.error("Failed to initialize Monaco Editor:", error)
          // Fall back to textarea
        }
      }
    })

    return cleanup
  }, [diagram, currentProject, selectedDiagramId, code, dispatch, onCodeChange])

  // Update editor content when diagram code changes
  useEffect(() => {
    if (code !== undefined && monacoEditorRef.current && monacoEditorRef.current.getValue() !== code) {
      monacoEditorRef.current.setValue(code);
      
      // Validate diagram code and update state only if we have a valid diagramId
      if (selectedDiagramId) {
        try {
          mermaid.parse(code);
          dispatch(setDiagramValidity({ 
            diagramId: selectedDiagramId, 
            isValid: true 
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          dispatch(setDiagramValidity({ 
            diagramId: selectedDiagramId, 
            isValid: false,
            error: errorMessage
          }));
        }
      }
    }
  }, [code, selectedDiagramId, dispatch])

  if (!diagram || !currentProject || !selectedDiagramId || code === undefined) {
    return null
  }

  // If Monaco Editor fails to load or is not available, use a code editor as fallback
  if (!monacoEditorRef.current) {
    return (
      <div className="space-y-2 h-full flex flex-col overflow-hidden">
        <h3 className="text-sm font-medium">{diagram.name}</h3>
        <div className="flex-1 relative overflow-auto border rounded-md">
          <CodeEditor
            value={code}
            language="mermaid"
            onChange={(e) => {
              dispatch(setDiagramCode({ diagramId: selectedDiagramId, code: e.target.value }))
              if (onCodeChange) {
                onCodeChange()
              }
            }}
            className="font-mono text-xs absolute inset-0 w-full h-full"
            style={{
              fontFamily: "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
              minHeight: "100%",
            }}
            padding={15}
            placeholder="Enter your Mermaid code here..."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2 h-full flex flex-col overflow-hidden">
      <h3 className="text-sm font-medium">{diagram.name}</h3>
      <div ref={editorRef} className="flex-1 border rounded-md min-h-0 overflow-hidden" />
    </div>
  )
}
