"use client"

import { useEffect } from "react"
import { ProjectProvider } from "@/lib/context/project-context"
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
        <main className="container mx-auto p-2 min-h-screen">
          <ProjectWorkspace />
        </main>
    </ProjectProvider>
  )
}
