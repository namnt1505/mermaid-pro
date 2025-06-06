"use client"

import { useEffect } from "react"
import { useAppDispatch } from "@/lib/hooks/use-app-dispatch"
import { ProjectWorkspace } from "@/features/project/project-workspace"
import { initializeProjects } from "@/lib/store/features/projectSlice"

export default function Home() {
  const dispatch = useAppDispatch()

  // Initialize projects from localStorage
  useEffect(() => {
    dispatch(initializeProjects())
  }, [dispatch])

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
    <main className="w-full h-screen overflow-hidden">
      <ProjectWorkspace />
    </main>
  )
}
