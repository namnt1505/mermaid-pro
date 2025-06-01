"use client"

import { useEffect, useRef, useState } from "react"
import { useProject } from "@/context/project-context"
import type { Diagram } from "@/types"
import type * as Monaco from "monaco-editor"
import { Textarea } from "@/components/ui/textarea"

interface DiagramEditorProps {
  diagram: Diagram
  projectId: string
  onCodeChange?: () => void
}

export function DiagramEditor({ diagram, projectId, onCodeChange }: DiagramEditorProps) {
  const { updateDiagram } = useProject()
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoEditorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

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
            scrollBeyondLastLine: false,
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
            if (monacoEditorRef.current) {
              const newCode = monacoEditorRef.current.getValue()
              updateDiagram(projectId, diagram.id, { code: newCode })
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
  }, [diagram.id, diagram.code, projectId, updateDiagram, onCodeChange])

  // Update editor content when diagram changes
  useEffect(() => {
    if (monacoEditorRef.current && monacoEditorRef.current.getValue() !== diagram.code) {
      monacoEditorRef.current.setValue(diagram.code)
    }
  }, [diagram.code])

  // If Monaco Editor fails to load or is not available, use a textarea as fallback
  if (!monacoEditorRef.current) {
    return (
      <div className="space-y-2 h-full flex flex-col">
        <h3 className="text-sm font-medium">{diagram.name}</h3>
        <Textarea
          value={diagram.code}
          onChange={(e) => {
            updateDiagram(projectId, diagram.id, { code: e.target.value })
            if (onCodeChange) {
              onCodeChange()
            }
          }}
          className="font-mono flex-1 resize-none text-xs"
          placeholder="Enter your Mermaid code here..."
        />
      </div>
    )
  }

  return (
    <div className="space-y-2 h-full flex flex-col">
      <h3 className="text-sm font-medium">{diagram.name}</h3>
      <div ref={editorRef} className="flex-1 border rounded-md min-h-0" />
    </div>
  )
}
