"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ZoomIn, ZoomOut, Download, Copy, Hand, ArrowUpDown } from "lucide-react"
import { toPng } from "html-to-image"
import { DiagramsContainer } from "./components/diagrams-container"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/lib/store/store"
import { setZoom, setPosition, setLastPosition, setIsDragging, resetView as resetViewAction } from "@/lib/store/features/editorSlice"
import { useProjectStore } from "@/lib/hooks/use-project-store"

export function DiagramPreview() {
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const diagramRef = useRef<HTMLDivElement>(null)
  const { currentProject, selectedDiagramId } = useProjectStore()
  
  // Use Redux state and dispatch
  const dispatch = useDispatch()
  const { zoom, position, lastPosition, isDragging } = useSelector((state: RootState) => state.editor)

  if (!currentProject) {
    return null
  }

  const diagrams = currentProject?.diagrams || []
  const projectId = currentProject?.id

  // Export individual diagram as PNG
  const exportIndividualDiagram = async (diagramId: string, diagramName: string) => {
    const diagramElement = document.getElementById(`diagram-wrapper-${diagramId}`)
    if (diagramElement) {
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
    }
  }

  // Handle zoom changes
  const handleZoomChange = (value: number[]) => {
    dispatch(setZoom(value[0]))
  }

  // Handle zoom in button
  const handleZoomIn = () => {
    dispatch(setZoom(Math.min(zoom + 0.1, 3)))
  }

  // Handle zoom out button
  const handleZoomOut = () => {
    dispatch(setZoom(Math.max(zoom - 0.1, 0.3)))
  }

  // Handle mouse down for dragging
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      dispatch(setIsDragging(true))
      setDragStart({ x: e.clientX, y: e.clientY })
      dispatch(setLastPosition(position))

      // Change cursor to grabbing
      if (containerRef.current) {
        containerRef.current.style.cursor = "grabbing"
      }
    },
    [position, dispatch],
  )

  // Handle mouse move for dragging
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return

      e.preventDefault()
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y

      dispatch(setPosition({
        x: lastPosition.x + dx,
        y: lastPosition.y + dy,
      }))
    },
    [isDragging, dragStart, lastPosition, dispatch],
  )

  // Handle mouse up to stop dragging
  const handleMouseUp = useCallback(() => {
    dispatch(setIsDragging(false))

    // Reset cursor
    if (containerRef.current) {
      containerRef.current.style.cursor = "grab"
    }
  }, [dispatch])

  // Handle mouse leave to stop dragging
  const handleMouseLeave = useCallback(() => {
    dispatch(setIsDragging(false))

    // Reset cursor
    if (containerRef.current) {
      containerRef.current.style.cursor = "grab"
    }
  }, [dispatch])

  // Reset position and zoom
  const resetView = () => {
    dispatch(resetViewAction())
  }

  // Export all diagrams as PNG - capture the full content
  const exportAsPNG = async () => {
    if (diagramRef.current) {
      try {
        // Temporarily reset transform to capture full content
        const originalTransform = diagramRef.current.style.transform
        diagramRef.current.style.transform = "none"

        // Get the full content dimensions
        const diagramsContainer = diagramRef.current.querySelector(".diagrams-container") as HTMLElement
        const fullWidth = diagramsContainer?.scrollWidth || diagramRef.current.scrollWidth
        const fullHeight = diagramsContainer?.scrollHeight || diagramRef.current.scrollHeight

        const dataUrl = await toPng(diagramRef.current, {
          backgroundColor: "#ffffff",
          pixelRatio: 2,
          width: fullWidth,
          height: fullHeight,
          style: {
            transform: "none",
          },
        })

        // Restore original transform
        diagramRef.current.style.transform = originalTransform

        const link = document.createElement("a")
        link.download = `project-diagrams-${projectId}.png`
        link.href = dataUrl
        link.click()
      } catch (error) {
        console.error("Error exporting diagrams:", error)
        // Restore transform in case of error
        if (diagramRef.current) {
          diagramRef.current.style.transform = `translate(${position.x}px, ${position.y}px) scale(${zoom})`
        }
      }
    }
  }

  // Copy diagram as PNG to clipboard
  const copyToClipboard = async () => {
    if (diagramRef.current) {
      try {
        // Temporarily reset transform to capture full content
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
          style: {
            transform: "none",
          },
        })

        // Restore original transform
        diagramRef.current.style.transform = originalTransform

        const blob = await fetch(dataUrl).then((res) => res.blob())
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ])
      } catch (error) {
        console.error("Error copying diagram:", error)
        // Restore transform in case of error
        if (diagramRef.current) {
          diagramRef.current.style.transform = `translate(${position.x}px, ${position.y}px) scale(${zoom})`
        }
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
            <Slider value={[zoom]} min={0.3} max={3} step={0.1} onValueChange={handleZoomChange} className="w-full" />
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
        className="flex-1 overflow-hidden border rounded-md bg-white relative select-none"
        style={{
          cursor: "grab",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={diagramRef}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            transition: isDragging ? "none" : "transform 0.2s ease-out",
            width: "100%",
            minHeight: "100%",
            position: "relative",
          }}
          className="w-full h-full"
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

        .diagram-wrapper {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .diagram-wrapper:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.1);
        }

        :global(.resizable-handle) {
          background: transparent;
          transition: background 0.2s ease;
        }

        :global(.resizable-handle:hover) {
          background: #e5e7eb;
        }
        
        :global(.resizable-handle-line) {
          background: #94a3b8;
        }
      `}</style>
    </div>
  )
}
