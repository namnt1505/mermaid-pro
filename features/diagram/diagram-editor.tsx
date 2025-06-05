"use client"

import { useEffect, useRef } from "react"
import { useProject } from "@/lib/context/project-context"
import type { Diagram } from "@/types"
import type * as Monaco from "monaco-editor"
import CodeEditor from "@uiw/react-textarea-code-editor"

interface DiagramEditorProps {
  onCodeChange?: () => void
}

export function DiagramEditor({ onCodeChange }: DiagramEditorProps) {
  const { currentProject, selectedDiagramId, updateDiagram } = useProject()
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoEditorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)

  const diagram = currentProject?.diagrams.find(d => d.id === selectedDiagramId)

  useEffect(() => {
    if (typeof window === "undefined" || !diagram || !currentProject || !selectedDiagramId) return

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
            value: diagram.code,
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
            if (monacoEditorRef.current && currentProject && selectedDiagramId) {
              const newCode = monacoEditorRef.current.getValue()
              updateDiagram(currentProject.id, selectedDiagramId, { code: newCode })
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
  }, [diagram, currentProject, selectedDiagramId, updateDiagram, onCodeChange])

  // Update editor content when diagram changes
  useEffect(() => {
    if (diagram && monacoEditorRef.current && monacoEditorRef.current.getValue() !== diagram.code) {
      monacoEditorRef.current.setValue(diagram.code)
    }
  }, [diagram])

  if (!diagram || !currentProject || !selectedDiagramId) {
    return null
  }

  // If Monaco Editor fails to load or is not available, use a code editor as fallback
  if (!monacoEditorRef.current) {
    return (
      <div className="space-y-2 h-full flex flex-col overflow-hidden">
        <h3 className="text-sm font-medium">{diagram.name}</h3>
        <div className="flex-1 relative overflow-auto border rounded-md">
          <CodeEditor
            value={diagram.code}
            language="mermaid"
            onChange={(e) => {
              updateDiagram(currentProject.id, selectedDiagramId, { code: e.target.value })
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
