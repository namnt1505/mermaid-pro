"use client"

import { useEffect, useRef } from "react"
import * as monaco from "monaco-editor"
import { Textarea } from "@/components/ui/textarea"

interface EditorProps {
  code: string
  onChange: (value: string) => void
}

export default function Editor({ code, onChange }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    if (editorRef.current) {
      // Check if we can use Monaco Editor
      if (typeof window !== "undefined" && typeof monaco !== "undefined") {
        try {
          // Try to initialize Monaco Editor
          monacoEditorRef.current = monaco.editor.create(editorRef.current, {
            value: code,
            language: "markdown",
            theme: "vs-dark",
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            wordWrap: "on",
            fontSize: 14,
          })

          monacoEditorRef.current.onDidChangeModelContent(() => {
            if (monacoEditorRef.current) {
              onChange(monacoEditorRef.current.getValue())
            }
          })

          return () => {
            if (monacoEditorRef.current) {
              monacoEditorRef.current.dispose()
            }
          }
        } catch (error) {
          console.error("Failed to initialize Monaco Editor:", error)
          // Fall back to textarea
        }
      }
    }
  }, [code, onChange])

  // If Monaco Editor fails to load or is not available, use a textarea as fallback
  if (!monacoEditorRef.current) {
    return (
      <Textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono h-[500px] resize-none"
        placeholder="Enter your Mermaid code here..."
      />
    )
  }

  return <div ref={editorRef} className="h-[500px] border rounded-md" />
}
