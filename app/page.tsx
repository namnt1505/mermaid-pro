"use client"

import { useEffect } from "react"
import { ProjectProvider } from "@/context/project-context"
import { WorkspaceProvider } from "@/context/workspace-context"
import { ProjectWorkspace } from "@/features/project/project-workspace"

export default function Home() {
  // Prevent browser back/forward navigation from losing state
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }

      window.addEventListener("beforeunload", handleBeforeUnload)
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload)
      }
  }, [])

  return (
    <ProjectProvider>
      <WorkspaceProvider>
        <main className="container mx-auto p-4 min-h-screen">
          <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Mermaid MVP
          </h1>
          <ProjectWorkspace />
        </main>
      </WorkspaceProvider>
    </ProjectProvider>
  )
}
