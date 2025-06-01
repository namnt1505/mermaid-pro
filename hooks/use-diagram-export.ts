"use client"

import type React from "react"

import { useCallback } from "react"
import { toPng } from "html-to-image"

export function useDiagramExport(
  diagramRef: React.RefObject<HTMLDivElement>,
  projectId: string,
  position: { x: number; y: number },
  zoom: number,
) {
  const exportIndividualDiagram = useCallback(async (diagramId: string, diagramName: string) => {
    const diagramElement = document.getElementById(`diagram-wrapper-${diagramId}`)
    if (!diagramElement) return

    try {
      const dataUrl = await toPng(diagramElement, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        width: diagramElement.offsetWidth,
        height: diagramElement.offsetHeight,
      })

      const link = document.createElement("a")
      link.download = `${diagramName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error("Error exporting individual diagram:", error)
    }
  }, [])

  const exportAsPNG = useCallback(async () => {
    if (!diagramRef.current) return

    try {
      const originalTransform = diagramRef.current.style.transform
      diagramRef.current.style.transform = "none"

      const diagramsContainer = diagramRef.current.querySelector(".diagrams-container") as HTMLElement
      const fullWidth = diagramsContainer?.scrollWidth || diagramRef.current.scrollWidth
      const fullHeight = diagramsContainer?.scrollHeight || diagramRef.current.scrollHeight

      const dataUrl = await toPng(diagramRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        width: fullWidth,
        height: fullHeight,
        style: { transform: "none" },
      })

      diagramRef.current.style.transform = originalTransform

      const link = document.createElement("a")
      link.download = `project-diagrams-${projectId}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error("Error exporting diagrams:", error)
      if (diagramRef.current) {
        diagramRef.current.style.transform = `translate(${position.x}px, ${position.y}px) scale(${zoom})`
      }
    }
  }, [diagramRef, projectId, position, zoom])

  const copyToClipboard = useCallback(async () => {
    if (!diagramRef.current) return

    try {
      const originalTransform = diagramRef.current.style.transform
      diagramRef.current.style.transform = "none"

      const diagramsContainer = diagramRef.current.querySelector(".diagrams-container") as HTMLElement
      const fullWidth = diagramsContainer?.scrollWidth || diagramRef.current.scrollWidth
      const fullHeight = diagramsContainer?.scrollHeight || diagramRef.current.scrollHeight

      const dataUrl = await toPng(diagramRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        width: fullWidth,
        height: fullHeight,
        style: { transform: "none" },
      })

      diagramRef.current.style.transform = originalTransform

      const blob = await fetch(dataUrl).then((res) => res.blob())
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ])
    } catch (error) {
      console.error("Error copying diagram:", error)
      if (diagramRef.current) {
        diagramRef.current.style.transform = `translate(${position.x}px, ${position.y}px) scale(${zoom})`
      }
    }
  }, [diagramRef, position, zoom])

  return {
    exportAsPNG,
    copyToClipboard,
    exportIndividualDiagram,
  }
}
