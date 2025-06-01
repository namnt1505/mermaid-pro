"use client"

import type React from "react"

import { memo, useEffect, useRef, useState, useCallback } from "react"
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
  isMoveMode: boolean
}

export const DraggableDiagram = memo(function DraggableDiagram({
  diagram,
  index,
  position,
  onPositionChange,
  onExport,
  isMoveMode,
}: DraggableDiagramProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [currentPosition, setCurrentPosition] = useState(position)
  const [hasError, setHasError] = useState(false)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [isErrorExpanded, setIsErrorExpanded] = useState(false)

  // Update current position when prop changes and not dragging
  useEffect(() => {
    if (!isDragging) {
      setCurrentPosition(position)
    }
  }, [position, isDragging])

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
          setHasError(false)
          setErrorDetails(null)
        }
      } catch (error) {
        console.error(`Error rendering diagram ${diagram.name}:`, error)
        if (contentRef.current) {
          setHasError(true)
          setErrorDetails(String(error))
          renderErrorContent(contentRef.current, diagram.name, String(error))
        }
      }
    }

    renderDiagram()
  }, [diagram.code, diagram.id, diagram.name])

  // Render error content
  const renderErrorContent = (container: HTMLElement, diagramName: string, error: string) => {
    container.innerHTML = `
    <div class="error-content" style="padding: 16px; color: #dc2626; border: 2px solid #fca5a5; border-radius: 8px; background: #fef2f2; cursor: default;">
      <div>
        <strong style="font-size: 14px;">Error rendering diagram "${diagramName}"</strong><br/>
        <span style="font-size: 12px;">Please check your Mermaid syntax.</span>
      </div>
      
      <div style="display: flex; gap: 8px; margin-top: 12px;">
        <button class="error-toggle-button" style="
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: #fee2e2;
          border: 1px solid #fca5a5;
          border-radius: 6px;
          color: #dc2626;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
          text-align: left;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="toggle-icon" style="transition: transform 0.3s ease;">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
          <span>View details</span>
        </button>
        
        <button class="error-copy-button" style="
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          background: #fee2e2;
          border: 1px solid #fca5a5;
          border-radius: 6px;
          color: #dc2626;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 36px;
        " title="Copy error details">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="copy-icon">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
        </button>
      </div>
      
      <div class="error-details-content" style="
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease, margin-top 0.3s ease;
        margin-top: 0;
      ">
        <div style="
          background: #fee2e2;
          padding: 12px;
          border-radius: 4px;
          border: 1px solid #fca5a5;
          margin: 8px 0 0 0;
          position: relative;
        ">
          <div style="
            display: flex;
            justify-content: between;
            align-items: center;
            margin-bottom: 8px;
            gap: 8px;
          ">
            <span style="font-size: 11px; font-weight: 600; color: #7f1d1d;">Error Details:</span>
            <button class="copy-details-button" style="
              padding: 4px 8px;
              background: #fca5a5;
              border: 1px solid #f87171;
              border-radius: 4px;
              color: #7f1d1d;
              font-size: 10px;
              cursor: pointer;
              transition: all 0.2s ease;
              margin-left: auto;
            " title="Copy error text">
              📋 Copy
            </button>
          </div>
          <pre class="error-text" style="
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-size: 11px;
            font-family: 'Courier New', monospace;
            color: #7f1d1d;
            cursor: text;
            user-select: text;
            margin: 0;
            line-height: 1.4;
            max-height: 200px;
            overflow-y: auto;
          ">${error}</pre>
        </div>
      </div>
    </div>
  `

    // Add event listeners after DOM is created
    setTimeout(() => {
      const toggleButton = container.querySelector(".error-toggle-button") as HTMLButtonElement
      const copyButton = container.querySelector(".error-copy-button") as HTMLButtonElement
      const copyDetailsButton = container.querySelector(".copy-details-button") as HTMLButtonElement
      const detailsContent = container.querySelector(".error-details-content") as HTMLElement
      const toggleIcon = container.querySelector(".toggle-icon") as SVGElement
      const toggleText = container.querySelector(".error-toggle-button span") as HTMLElement
      const errorText = container.querySelector(".error-text") as HTMLElement

      // Toggle error details
      if (toggleButton && detailsContent && toggleIcon && toggleText) {
        toggleButton.addEventListener("click", (e) => {
          e.stopPropagation()

          const isExpanded = detailsContent.style.maxHeight !== "0px" && detailsContent.style.maxHeight !== ""

          if (isExpanded) {
            // Collapse
            detailsContent.style.maxHeight = "0"
            detailsContent.style.marginTop = "0"
            toggleIcon.style.transform = "rotate(0deg)"
            toggleText.textContent = "View details"
            setIsErrorExpanded(false)
          } else {
            // Expand
            detailsContent.style.maxHeight = "300px"
            detailsContent.style.marginTop = "8px"
            toggleIcon.style.transform = "rotate(180deg)"
            toggleText.textContent = "Hide details"
            setIsErrorExpanded(true)
          }
        })

        // Add hover effect for toggle button
        toggleButton.addEventListener("mouseenter", () => {
          toggleButton.style.background = "#fecaca"
        })

        toggleButton.addEventListener("mouseleave", () => {
          toggleButton.style.background = "#fee2e2"
        })
      }

      // Copy error function
      const copyErrorText = async () => {
        try {
          await navigator.clipboard.writeText(error)
          return true
        } catch (err) {
          // Fallback for older browsers
          const textArea = document.createElement("textarea")
          textArea.value = error
          textArea.style.position = "fixed"
          textArea.style.left = "-999999px"
          textArea.style.top = "-999999px"
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()
          try {
            document.execCommand("copy")
            document.body.removeChild(textArea)
            return true
          } catch (err) {
            document.body.removeChild(textArea)
            return false
          }
        }
      }

      // Main copy button
      if (copyButton) {
        copyButton.addEventListener("click", async (e) => {
          e.stopPropagation()
          const success = await copyErrorText()

          if (success) {
            const originalHTML = copyButton.innerHTML
            copyButton.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            `
            copyButton.style.background = "#dcfce7"
            copyButton.style.borderColor = "#86efac"
            copyButton.style.color = "#166534"

            setTimeout(() => {
              copyButton.innerHTML = originalHTML
              copyButton.style.background = "#fee2e2"
              copyButton.style.borderColor = "#fca5a5"
              copyButton.style.color = "#dc2626"
            }, 1500)
          }
        })

        // Add hover effect for copy button
        copyButton.addEventListener("mouseenter", () => {
          copyButton.style.background = "#fecaca"
        })

        copyButton.addEventListener("mouseleave", () => {
          if (!copyButton.innerHTML.includes("polyline")) {
            copyButton.style.background = "#fee2e2"
          }
        })
      }

      // Copy details button
      if (copyDetailsButton) {
        copyDetailsButton.addEventListener("click", async (e) => {
          e.stopPropagation()
          const success = await copyErrorText()

          if (success) {
            copyDetailsButton.textContent = "✅ Copied!"
            copyDetailsButton.style.background = "#dcfce7"
            copyDetailsButton.style.borderColor = "#86efac"
            copyDetailsButton.style.color = "#166534"

            setTimeout(() => {
              copyDetailsButton.textContent = "📋 Copy"
              copyDetailsButton.style.background = "#fca5a5"
              copyDetailsButton.style.borderColor = "#f87171"
              copyDetailsButton.style.color = "#7f1d1d"
            }, 1500)
          }
        })

        // Add hover effect for copy details button
        copyDetailsButton.addEventListener("mouseenter", () => {
          copyDetailsButton.style.background = "#f87171"
        })

        copyDetailsButton.addEventListener("mouseleave", () => {
          if (!copyDetailsButton.textContent?.includes("Copied")) {
            copyDetailsButton.style.background = "#fca5a5"
          }
        })
      }

      // Make error text selectable
      if (errorText) {
        errorText.addEventListener("mousedown", (e) => {
          e.stopPropagation()
        })

        errorText.addEventListener("selectstart", (e) => {
          e.stopPropagation()
        })
      }
    }, 0)
  }

  // Optimized mouse move handler using requestAnimationFrame
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !isMoveMode) return

      // Cancel previous animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      // Use requestAnimationFrame for smooth updates
      animationFrameRef.current = requestAnimationFrame(() => {
        const dx = e.clientX - dragStart.x
        const dy = e.clientY - dragStart.y

        // Calculate new position based on drag delta
        const newX = Math.max(0, position.x + dx)
        const newY = Math.max(0, position.y + dy)

        setCurrentPosition({ x: newX, y: newY })
      })
    },
    [isDragging, isMoveMode, dragStart, position],
  )

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return

    setIsDragging(false)

    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    // Notify parent component about position change
    console.log(`DraggableDiagram: Mouse up for ${diagram.id}, position:`, currentPosition)
    onPositionChange(diagram.id, currentPosition)

    // Remove global event listeners
    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("mouseup", handleMouseUp)
    document.body.style.userSelect = ""
    document.body.style.cursor = ""
  }, [isDragging, currentPosition, diagram.id, onPositionChange, handleMouseMove])

  // Handle mouse events for dragging
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only allow dragging in move mode
      if (!isMoveMode) return

      // Don't start dragging if clicking on interactive elements
      const target = e.target as HTMLElement
      if (
        target.closest(".export-button") ||
        target.closest(".error-content") ||
        target.closest(".error-toggle-button") ||
        target.closest(".error-copy-button") ||
        target.closest(".copy-details-button") ||
        target.closest(".error-details-content") ||
        target.closest(".error-text") ||
        target.closest("pre")
      ) {
        return
      }

      e.preventDefault()
      e.stopPropagation()

      console.log(`DraggableDiagram: Starting drag for ${diagram.id} from position:`, position)

      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })

      // Prevent text selection and set cursor
      document.body.style.userSelect = "none"
      document.body.style.cursor = "grabbing"

      // Add global event listeners
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [isMoveMode, position, diagram.id, handleMouseMove, handleMouseUp],
  )

  const handleExport = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onExport(diagram.id, diagram.name)
    },
    [diagram.id, diagram.name, onExport],
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Determine cursor and styling based on move mode
  const getCursorStyle = () => {
    if (!isMoveMode || hasError) return "default"
    if (isDragging) return "grabbing"
    return "grab"
  }

  const getBorderColor = () => {
    if (hasError) return "border-red-300 hover:border-red-400"
    if (isDragging) return "border-blue-500"
    if (isMoveMode) return "border-orange-300 hover:border-orange-400"
    return "border-gray-200 hover:border-gray-300"
  }

  return (
    <div
      ref={wrapperRef}
      className={`diagram-wrapper absolute border-2 rounded-xl p-4 bg-white shadow-lg select-none transition-all duration-200 ${getBorderColor()} ${
        isDragging ? "shadow-2xl z-50 scale-105" : "hover:shadow-xl"
      }`}
      style={{
        left: `${currentPosition.x}px`,
        top: `${currentPosition.y}px`,
        width: "max-content",
        minWidth: "300px",
        maxWidth: "600px",
        transform: isDragging ? "scale(1.02)" : "scale(1)",
        transition: isDragging ? "none" : "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        willChange: isDragging ? "transform" : "auto",
        cursor: getCursorStyle(),
      }}
      id={`diagram-wrapper-${diagram.id}`}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="diagram-header flex justify-between items-center mb-3 pb-2 border-b-2 border-gray-100">
        <div className="diagram-title text-base font-semibold text-gray-800 pointer-events-none flex items-center gap-2">
          {isMoveMode && !hasError && (
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" title="Move mode active" />
          )}
          {hasError && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" title="Diagram has errors" />}
          {diagram.name}
        </div>
        <button
          className="export-button bg-gray-50 border border-gray-300 rounded-md p-1.5 cursor-pointer flex items-center justify-center text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-800 hover:scale-105 z-10"
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
      <div ref={contentRef} className={`diagram-content ${hasError ? "pointer-events-auto" : "pointer-events-none"}`} />
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
