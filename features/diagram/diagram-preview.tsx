"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import mermaid from "mermaid"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ZoomIn, ZoomOut, Download, Copy, Hand } from "lucide-react"
import { toPng } from "html-to-image"

interface Diagram {
  id: string
  name: string
  code: string
}

interface DiagramPreviewProps {
  diagrams: Diagram[]
  projectId: string
}

export function DiagramPreview({ diagrams, projectId }: DiagramPreviewProps) {
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const diagramRef = useRef<HTMLDivElement>(null)

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

  // Render multiple diagrams
  const renderDiagrams = useCallback(() => {
    if (diagramRef.current && diagrams.length > 0) {
      // Initialize mermaid
      mermaid.initialize({
        startOnLoad: true,
        theme: "base",
        securityLevel: "loose",
        fontFamily: "Inter, sans-serif",
        themeVariables: {
          // Primary colors for different node types
          primaryColor: "#e3f2fd",
          primaryTextColor: "#1565c0",
          primaryBorderColor: "#1976d2",

          // Secondary colors for decision nodes
          secondaryColor: "#f3e5f5",
          secondaryTextColor: "#7b1fa2",
          secondaryBorderColor: "#9c27b0",

          // Tertiary colors for external entities
          tertiaryColor: "#e8f5e8",
          tertiaryTextColor: "#2e7d32",
          tertiaryBorderColor: "#4caf50",

          // Background and line colors
          background: "#ffffff",
          lineColor: "#616161",

          // Subgraph colors
          clusterBkg: "#f5f5f5",
          clusterBorder: "#9e9e9e",

          // Actor colors
          actorBkg: "#fff3e0",
          actorBorder: "#ff9800",
          actorTextColor: "#e65100",

          // Use case colors
          usecaseBkg: "#e1f5fe",
          usecaseBorder: "#0288d1",
          usecaseTextColor: "#01579b",
        },
        flowchart: {
          padding: 20,
          nodeSpacing: 50,
          rankSpacing: 80,
          curve: "basis",
          useMaxWidth: false,
        },
        sequence: {
          diagramMarginX: 50,
          diagramMarginY: 10,
          actorMargin: 50,
          width: 150,
          height: 65,
          boxMargin: 10,
          boxTextMargin: 5,
          noteMargin: 10,
          messageMargin: 35,
        },
      })

      // Clear previous diagrams
      diagramRef.current.innerHTML = ""

      // Create container for all diagrams
      const diagramsContainer = document.createElement("div")
      diagramsContainer.className = "diagrams-container"
      diagramsContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 10px;
        min-height: 100%;
        width: max-content;
        min-width: 100%;
      `

      // Render each diagram
      diagrams.forEach((diagram, index) => {
        try {
          const diagramWrapper = document.createElement("div")
          diagramWrapper.className = "diagram-wrapper"
          diagramWrapper.id = `diagram-wrapper-${diagram.id}`
          diagramWrapper.style.cssText = `
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 12px;
            background: #ffffff;
            box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
            position: relative;
            width: max-content;
            min-width: 500px;
          `

          // Add diagram header with title and export button
          const headerElement = document.createElement("div")
          headerElement.className = "diagram-header"
          headerElement.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            padding-bottom: 4px;
            border-bottom: 1px solid #e5e7eb;
          `

          // Add diagram title
          const titleElement = document.createElement("div")
          titleElement.className = "diagram-title"
          titleElement.textContent = diagram.name
          titleElement.style.cssText = `
            font-size: 14px;
            font-weight: 600;
            color: #374151;
          `

          // Add export button
          const exportButton = document.createElement("button")
          exportButton.className = "export-button"
          exportButton.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          `
          exportButton.style.cssText = `
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            padding: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6b7280;
            transition: all 0.2s ease;
          `
          exportButton.title = `Export ${diagram.name} as PNG`
          exportButton.addEventListener("mouseenter", () => {
            exportButton.style.background = "#e5e7eb"
            exportButton.style.color = "#374151"
          })
          exportButton.addEventListener("mouseleave", () => {
            exportButton.style.background = "#f3f4f6"
            exportButton.style.color = "#6b7280"
          })
          exportButton.addEventListener("click", (e) => {
            e.stopPropagation()
            exportIndividualDiagram(diagram.id, diagram.name)
          })

          headerElement.appendChild(titleElement)
          headerElement.appendChild(exportButton)

          // Add diagram content container
          const contentElement = document.createElement("div")
          contentElement.className = "diagram-content"
          contentElement.id = `diagram-${index}`

          diagramWrapper.appendChild(headerElement)
          diagramWrapper.appendChild(contentElement)
          diagramsContainer.appendChild(diagramWrapper)

          // Render the diagram
          mermaid
            .render(`mermaid-diagram-${index}`, diagram.code)
            .then(({ svg }) => {
              contentElement.innerHTML = svg

              // Apply additional styling to the rendered SVG
              const svgElement = contentElement.querySelector("svg")
              if (svgElement) {
                svgElement.style.padding = "5px"
                svgElement.style.width = "auto"
                svgElement.style.height = "auto"
                svgElement.style.maxWidth = "none"

                // Style different node types
                const nodes = svgElement.querySelectorAll(".node")
                nodes.forEach((node) => {
                  const rect = node.querySelector("rect, circle, polygon")
                  if (rect) {
                    rect.setAttribute("filter", "drop-shadow(1px 1px 2px rgba(0,0,0,0.1))")
                    rect.setAttribute("rx", "6")
                  }
                })

                // Style subgraphs
                const clusters = svgElement.querySelectorAll(".cluster rect")
                clusters.forEach((cluster) => {
                  cluster.setAttribute("rx", "8")
                  cluster.setAttribute("stroke-width", "1.5")
                  cluster.setAttribute("filter", "drop-shadow(1px 1px 2px rgba(0,0,0,0.1))")
                })

                // Style edges/arrows
                const edges = svgElement.querySelectorAll(".edgePath path")
                edges.forEach((edge) => {
                  edge.setAttribute("stroke-width", "1.5")
                  edge.setAttribute("filter", "drop-shadow(0.5px 0.5px 1px rgba(0,0,0,0.1))")
                })
              }
            })
            .catch((error) => {
              console.error(`Error rendering diagram ${diagram.name}:`, error)
              contentElement.innerHTML = `
                <div style="padding: 12px; color: #dc2626; border: 1px solid #fca5a5; border-radius: 6px; background: #fef2f2;">
                  <strong style="font-size: 12px;">Error rendering diagram "${diagram.name}"</strong><br/>
                  <span style="font-size: 11px;">Please check your Mermaid syntax.</span>
                  <details style="margin-top: 6px;">
                    <summary style="cursor: pointer; font-size: 11px;">Error details</summary>
                    <pre style="margin-top: 4px; font-size: 10px;">${error}</pre>
                  </details>
                </div>
              `
            })
        } catch (error) {
          console.error(`Error processing diagram ${diagram.name}:`, error)
        }
      })

      diagramRef.current.appendChild(diagramsContainer)
    } else if (diagramRef.current) {
      diagramRef.current.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #6b7280;">
          <p style="font-size: 12px;">No diagrams to display</p>
        </div>
      `
    }
  }, [diagrams])

  // Render diagrams on initial load and when diagrams change
  useEffect(() => {
    renderDiagrams()
  }, [renderDiagrams])

  // Handle zoom changes
  const handleZoomChange = (value: number[]) => {
    setZoom(value[0])
  }

  // Handle zoom in button
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3))
  }

  // Handle zoom out button
  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.3))
  }

  // Handle mouse down for dragging
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
      setLastPosition(position)

      // Change cursor to grabbing
      if (containerRef.current) {
        containerRef.current.style.cursor = "grabbing"
      }
    },
    [position],
  )

  // Handle mouse move for dragging
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return

      e.preventDefault()
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y

      setPosition({
        x: lastPosition.x + dx,
        y: lastPosition.y + dy,
      })
    },
    [isDragging, dragStart, lastPosition],
  )

  // Handle mouse up to stop dragging
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)

    // Reset cursor
    if (containerRef.current) {
      containerRef.current.style.cursor = "grab"
    }
  }, [])

  // Handle mouse leave to stop dragging
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)

    // Reset cursor
    if (containerRef.current) {
      containerRef.current.style.cursor = "grab"
    }
  }, [])

  // Reset position and zoom
  const resetView = () => {
    setPosition({ x: 0, y: 0 })
    setZoom(1)
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
      {/* Reduced spacing from space-y-4 to space-y-2 */}
      <div className="flex justify-between items-center flex-shrink-0">
        <h3 className="text-sm font-semibold">Diagrams ({diagrams.length})</h3> {/* Reduced from text-lg to text-sm */}
        <div className="flex gap-1">
          {" "}
          {/* Reduced gap from gap-2 to gap-1 */}
          <Button variant="outline" size="icon" onClick={resetView} title="Reset view" className="h-5 w-5">
            {" "}
            {/* Reduced size */}
            <span className="text-[10px] font-mono">1:1</span> {/* Reduced text size */}
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomOut} title="Zoom out" className="h-5 w-5">
            {" "}
            {/* Reduced size */}
            <ZoomOut className="h-2.5 w-2.5" /> {/* Reduced icon size */}
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomIn} title="Zoom in" className="h-5 w-5">
            {" "}
            {/* Reduced size */}
            <ZoomIn className="h-2.5 w-2.5" /> {/* Reduced icon size */}
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-hidden border rounded-md bg-white relative select-none" /* Reduced border radius */
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
            height: "100%",
          }}
          className="relative w-full h-full grid-background"
        >
          {!diagrams || diagrams.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-xs">No diagrams to display</p> {/* Reduced text size */}
            </div>
          ) : null}
        </div>

        {/* Drag indicator */}
        <div className="absolute top-1 left-1 bg-black/10 backdrop-blur-sm rounded px-1.5 py-0.5 text-[10px] text-gray-600 flex items-center gap-1">
          {/* Reduced sizes */}
          <Hand className="h-2 w-2" /> {/* Reduced icon size */}
          Click & drag to move
        </div>
      </div>

      <div className="space-y-2 flex-shrink-0">
        {" "}
        {/* Reduced spacing */}
        <div className="flex items-center gap-2">
          {" "}
          {/* Reduced gap */}
          <span className="text-xs font-medium">Zoom:</span> {/* Reduced text size */}
          <div className="flex-1">
            <Slider value={[zoom]} min={0.3} max={3} step={0.1} onValueChange={handleZoomChange} className="w-full" />
          </div>
          <span className="text-xs font-mono w-10 text-right bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
            {/* Reduced sizes */}
            {(zoom * 100).toFixed(0)}%
          </span>
        </div>
        <div className="flex gap-1 justify-end">
          {" "}
          {/* Reduced gap */}
          <Button variant="outline" onClick={copyToClipboard} className="flex items-center gap-1 h-6 px-2 text-xs">
            {/* Reduced size */}
            <Copy className="h-2.5 w-2.5" /> {/* Reduced icon size */}
            Copy All
          </Button>
          <Button onClick={exportAsPNG} className="flex items-center gap-1 h-6 px-2 text-xs">
            {/* Reduced size */}
            <Download className="h-2.5 w-2.5" /> {/* Reduced icon size */}
            Export All PNG
          </Button>
        </div>
      </div>

      <style jsx>{`
        .grid-background {
          background-image: radial-gradient(circle, #d0d0d0 1px, transparent 1px);
          background-size: 15px 15px; /* Reduced grid size */
          background-position: 0 0;
        }

        .diagrams-container {
          min-height: 100%;
        }

        .diagram-wrapper {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .diagram-wrapper:hover {
          transform: translateY(-1px); /* Reduced hover effect */
          box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.1); /* Reduced shadow */}
      `}</style>
    </div>
  )
}
