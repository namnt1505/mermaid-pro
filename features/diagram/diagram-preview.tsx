"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ZoomIn, ZoomOut, Download, Copy } from "lucide-react"
import { toPng } from "html-to-image"
import { DiagramsContainer } from "./components/diagrams-container"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/lib/store/store"
import { setZoom, resetView as resetViewAction } from "@/lib/store/features/editorSlice"
import { useProjectStore } from "@/lib/hooks/use-project-store"

export function DiagramPreview() {
  const containerRef = useRef<HTMLDivElement>(null)
  const diagramRef = useRef<HTMLDivElement>(null)
  const { currentProject, selectedDiagramId } = useProjectStore()
  
  const dispatch = useDispatch()
  const { zoom } = useSelector((state: RootState) => state.editor)

  if (!currentProject) {
    return null
  }

  const diagrams = currentProject?.diagrams || []
  const projectId = currentProject?.id

  // Export individual diagram as PNG
  const exportIndividualDiagram = async (diagramId: string, diagramName: string) => {
    const diagramElement = document.querySelector(`.diagram-${diagramId}`) as HTMLElement
    if (diagramElement) {
      try {
        // Temporarily reset transform to capture content without zoom
        const originalTransform = diagramElement.style.transform
        diagramElement.style.transform = `translate(${diagramElement.style.transform.match(/translate\(([^)]+)\)/)?.[1] || '0px, 0px'}) scale(1)`
        
        const dataUrl = await toPng(diagramElement, {
          backgroundColor: "#ffffff",
          pixelRatio: 2,
          width: diagramElement.offsetWidth,
          height: diagramElement.offsetHeight,
        })

        // Restore original transform
        diagramElement.style.transform = originalTransform

        const link = document.createElement("a")
        link.download = `${diagramName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.png`
        link.href = dataUrl
        link.click()
      } catch (error) {
        console.error("Error exporting individual diagram:", error)
        // Restore transform in case of error
        const originalTransform = diagramElement.style.transform
        if (originalTransform) {
          diagramElement.style.transform = originalTransform
        }
      }
    }
  }

  // Handle zoom changes
  const handleZoomChange = (value: number[]) => {
    dispatch(setZoom(value[0]))
  }

  // Handle zoom in button
  const handleZoomIn = () => {
    dispatch(setZoom(Math.min(zoom + 0.214286, 2)))
  }

  // Handle zoom out button
  const handleZoomOut = () => {
    dispatch(setZoom(Math.max(zoom - 0.214286, 0.5)))
  }

  // Reset zoom
  const resetView = () => {
    dispatch(resetViewAction())
  }

  // Export all diagrams as PNG - capture the full content
  const exportAsPNG = async () => {
    if (diagramRef.current) {
      try {
        // Temporarily reset all diagram wrapper transforms to capture content without zoom
        const diagramWrappers = diagramRef.current.querySelectorAll('.diagram-wrapper') as NodeListOf<HTMLElement>
        const originalTransforms: string[] = []
        
        diagramWrappers.forEach((wrapper, index) => {
          originalTransforms[index] = wrapper.style.transform
          // Extract translate values and set scale to 1
          const translateMatch = wrapper.style.transform.match(/translate\(([^)]+)\)/)
          const translateValue = translateMatch?.[1] || '0px, 0px'
          wrapper.style.transform = `translate(${translateValue}) scale(1)`
        })

        const dataUrl = await toPng(diagramRef.current, {
          backgroundColor: "#ffffff",
          pixelRatio: 2,
        })

        // Restore original transforms
        diagramWrappers.forEach((wrapper, index) => {
          wrapper.style.transform = originalTransforms[index]
        })

        const link = document.createElement("a")
        link.download = `project-diagrams-${projectId}.png`
        link.href = dataUrl
        link.click()
      } catch (error) {
        console.error("Error exporting diagrams:", error)
        // Restore transforms in case of error
        const diagramWrappers = diagramRef.current?.querySelectorAll('.diagram-wrapper') as NodeListOf<HTMLElement>
        diagramWrappers?.forEach((wrapper) => {
          const translateMatch = wrapper.style.transform.match(/translate\(([^)]+)\)/)
          const translateValue = translateMatch?.[1] || '0px, 0px'
          wrapper.style.transform = `translate(${translateValue}) scale(${zoom})`
        })
      }
    }
  }

  // Copy diagram as PNG to clipboard
  const copyToClipboard = async () => {
    if (diagramRef.current) {
      try {
        // Temporarily reset all diagram wrapper transforms to capture content without zoom
        const diagramWrappers = diagramRef.current.querySelectorAll('.diagram-wrapper') as NodeListOf<HTMLElement>
        const originalTransforms: string[] = []
        
        diagramWrappers.forEach((wrapper, index) => {
          originalTransforms[index] = wrapper.style.transform
          // Extract translate values and set scale to 1
          const translateMatch = wrapper.style.transform.match(/translate\(([^)]+)\)/)
          const translateValue = translateMatch?.[1] || '0px, 0px'
          wrapper.style.transform = `translate(${translateValue}) scale(1)`
        })

        const dataUrl = await toPng(diagramRef.current, {
          backgroundColor: "#ffffff",
          pixelRatio: 2,
        })

        // Restore original transforms
        diagramWrappers.forEach((wrapper, index) => {
          wrapper.style.transform = originalTransforms[index]
        })

        const blob = await fetch(dataUrl).then((res) => res.blob())
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ])
      } catch (error) {
        console.error("Error copying diagram:", error)
        // Restore transforms in case of error
        const diagramWrappers = diagramRef.current?.querySelectorAll('.diagram-wrapper') as NodeListOf<HTMLElement>
        diagramWrappers?.forEach((wrapper) => {
          const translateMatch = wrapper.style.transform.match(/translate\(([^)]+)\)/)
          const translateValue = translateMatch?.[1] || '0px, 0px'
          wrapper.style.transform = `translate(${translateValue}) scale(${zoom})`
        })
      }
    }
  }

  return (
    <div className="space-y-2 h-full flex flex-col">
      <div className="flex justify-between items-center flex-shrink-0">
        <h3 className="text-sm font-semibold">Diagrams ({diagrams.length})</h3>
        <div className="flex gap-1" id="diagram-preview-tool">
          <Button variant="outline" size="icon" onClick={resetView} title="Reset view" className="h-5 w-5">
            <span className="text-[10px] font-mono">1:1</span>
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomOut} title="Zoom out" className="h-5 w-5">
            <ZoomOut className="h-2.5 w-2.5" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomIn} title="Zoom in" className="h-5 w-5">
            <ZoomIn className="h-2.5 w-2.5" />
          </Button>
        </div>
      </div>
      <div className="space-y-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">Zoom:</span>
          <div className="flex-1">
            <Slider value={[zoom]} min={0.5} max={2} step={0.214286} onValueChange={handleZoomChange} className="w-full" />
          </div>
          <span className="text-xs font-mono w-10 text-right bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
            {(zoom * 100).toFixed(0)}%
          </span>
        </div>
        <div className="flex gap-1 justify-end">
          <Button variant="outline" onClick={copyToClipboard} className="flex items-center gap-1 h-6 px-2 text-xs">
            <Copy className="h-2.5 w-2.5" />
            Copy All
          </Button>
          <Button onClick={exportAsPNG} className="flex items-center gap-1 h-6 px-2 text-xs">
            <Download className="h-2.5 w-2.5" />
            Export All PNG
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-auto border rounded-md bg-white relative"
      >
        <div
          ref={diagramRef}
          style={{
            width: "100%",
            minHeight: "100%",
            position: "relative"
          }}
        >
          {!diagrams || diagrams.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-xs">No diagrams to display</p>
            </div>
          ) : (
            <DiagramsContainer 
              diagrams={diagrams} 
              onExportDiagram={exportIndividualDiagram}
            />
          )}
        </div>
      </div>

      <style jsx>{`
        .grid-background {
          background-image: radial-gradient(circle, #d0d0d0 1px, transparent 1px);
          background-size: 15px 15px;
          background-position: 0 0;
        }
      `}</style>
    </div>
  )
}
