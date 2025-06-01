"use client"

import type React from "react"

import { memo, useEffect, useRef, useState } from "react"
import mermaid from "mermaid"
import type { Diagram } from "@/types"

interface DiagramPosition {
  x: number
  y: number
}

interface DraggableDiagramProps {
  diagram: Diagram
  index: number
  position: DiagramPosition
  onPositionChange: (id: string, position: DiagramPosition) => void
  onExport: (id: string, name: string) => void
}

export const DraggableDiagram = memo(function DraggableDiagram({
  diagram,
  index,
  position,
  onPositionChange,
  onExport,
}: DraggableDiagramProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [currentPosition, setCurrentPosition] = useState(position)

  // Initialize mermaid and render diagram
  useEffect(() => {
    if (!contentRef.current) return

    mermaid.initialize({
      startOnLoad: true,
      theme: "base",
      securityLevel: "loose",
      fontFamily: "Inter, sans-serif",
      themeVariables: {
        primaryColor: "#e3f2fd",
        primaryTextColor: "#1565c0",
        primaryBorderColor: "#1976d2",
        secondaryColor: "#f3e5f5",
        secondaryTextColor: "#7b1fa2",
        secondaryBorderColor: "#9c27b0",
        tertiaryColor: "#e8f5e8",
        tertiaryTextColor: "#2e7d32",
        tertiaryBorderColor: "#4caf50",
        background: "#ffffff",
        lineColor: "#616161",
        clusterBkg: "#f5f5f5",
        clusterBorder: "#9e9e9e",
        actorBkg: "#fff3e0",
        actorBorder: "#ff9800",
        actorTextColor: "#e65100",
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

    const renderDiagram = async () => {
      try {
        const { svg } = await mermaid.render(`mermaid-diagram-${diagram.id}`, diagram.code)
        if (contentRef.current) {
          contentRef.current.innerHTML = svg
          styleSVGElement(contentRef.current)
        }
      } catch (error) {
        console.error(`Error rendering diagram ${diagram.name}:`, error)
        if (contentRef.current) {
          contentRef.current.innerHTML = createErrorHTML(diagram.name, error)
        }
      }
    }

    renderDiagram()
  }, [diagram.code, diagram.id, diagram.name])

  // Update position when prop changes
  useEffect(() => {
    setCurrentPosition(position)
  }, [position])

  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start dragging if clicking on the wrapper itself or header, not on buttons
    const target = e.target as HTMLElement
    if (target.closest(".export-button")) return

    e.stopPropagation()
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })

    // Add global event listeners
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y

    // Snap to grid (10px)
    const newX = Math.round((position.x + dx) / 10) * 10
    const newY = Math.round((position.y + dy) / 10) * 10

    setCurrentPosition({ x: newX, y: newY })
  }

  const handleMouseUp = () => {
    if (!isDragging) return

    setIsDragging(false)
    onPositionChange(diagram.id, currentPosition)

    // Remove global event listeners
    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("mouseup", handleMouseUp)
  }

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation()
    onExport(diagram.id, diagram.name)
  }

  return (
    <div
      ref={wrapperRef}
      className={`diagram-wrapper absolute border-2 rounded-xl p-4 bg-white shadow-lg transition-all duration-200 ${
        isDragging
          ? "border-blue-500 shadow-xl z-50 cursor-grabbing"
          : "border-gray-200 hover:border-blue-400 hover:shadow-xl cursor-move"
      }`}
      style={{
        left: `${currentPosition.x}px`,
        top: `${currentPosition.y}px`,
        width: "max-content",
        minWidth: "300px",
        maxWidth: "600px",
        userSelect: "none",
      }}
      id={`diagram-wrapper-${diagram.id}`}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="diagram-header flex justify-between items-center mb-3 pb-2 border-b-2 border-gray-100 cursor-move">
        <div className="diagram-title text-base font-semibold text-gray-800 cursor-move">{diagram.name}</div>
        <button
          className="export-button bg-gray-50 border border-gray-300 rounded-md p-1.5 cursor-pointer flex items-center justify-center text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-800 hover:scale-105"
          onClick={handleExport}
          title={`Export ${diagram.name} as PNG`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div ref={contentRef} className="diagram-content" />
    </div>
  )
})

function styleSVGElement(contentElement: HTMLElement) {
  const svgElement = contentElement.querySelector("svg")
  if (!svgElement) return

  svgElement.style.padding = "8px"
  svgElement.style.width = "auto"
  svgElement.style.height = "auto"
  svgElement.style.maxWidth = "none"
  svgElement.style.pointerEvents = "none" // Prevent SVG from interfering with drag

  // Style nodes
  const nodes = svgElement.querySelectorAll(".node")
  nodes.forEach((node) => {
    const rect = node.querySelector("rect, circle, polygon")
    if (rect) {
      rect.setAttribute("filter", "drop-shadow(2px 2px 4px rgba(0,0,0,0.1))")
      rect.setAttribute("rx", "8")
    }
  })

  // Style clusters
  const clusters = svgElement.querySelectorAll(".cluster rect")
  clusters.forEach((cluster) => {
    cluster.setAttribute("rx", "10")
    cluster.setAttribute("stroke-width", "2")
    cluster.setAttribute("filter", "drop-shadow(1px 1px 3px rgba(0,0,0,0.1))")
  })

  // Style edges
  const edges = svgElement.querySelectorAll(".edgePath path")
  edges.forEach((edge) => {
    edge.setAttribute("stroke-width", "2")
    edge.setAttribute("filter", "drop-shadow(1px 1px 2px rgba(0,0,0,0.1))")
  })
}

function createErrorHTML(diagramName: string, error: any) {
  return `
    <div style="padding: 16px; color: #dc2626; border: 2px solid #fca5a5; border-radius: 8px; background: #fef2f2;">
      <strong style="font-size: 14px;">Error rendering diagram "${diagramName}"</strong><br/>
      <span style="font-size: 12px;">Please check your Mermaid syntax.</span>
      <details style="margin-top: 8px;">
        <summary style="cursor: pointer; font-size: 12px;">Error details</summary>
        <pre style="margin-top: 6px; font-size: 10px;">${error}</pre>
      </details>
    </div>
  `
}
