"use client"

import { useEffect, useRef } from "react"
import mermaid from "mermaid"

interface DiagramPreviewProps {
  code: string
}

export default function DiagramPreview({ code }: DiagramPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      // Initialize mermaid with enhanced styling
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

      // Clear previous diagram
      containerRef.current.innerHTML = ""

      try {
        // Render new diagram
        mermaid.render("mermaid-diagram", code).then(({ svg }) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = svg

            // Apply additional styling to the rendered SVG
            const svgElement = containerRef.current.querySelector("svg")
            if (svgElement) {
              // Add padding to the SVG
              svgElement.style.padding = "20px"

              // Style different node types
              const nodes = svgElement.querySelectorAll(".node")
              nodes.forEach((node, index) => {
                const rect = node.querySelector("rect, circle, polygon")
                if (rect) {
                  // Add subtle shadow and improved styling
                  rect.setAttribute("filter", "drop-shadow(2px 2px 4px rgba(0,0,0,0.1))")
                  rect.setAttribute("rx", "8") // Rounded corners for rectangles
                }
              })

              // Style subgraphs
              const clusters = svgElement.querySelectorAll(".cluster rect")
              clusters.forEach((cluster) => {
                cluster.setAttribute("rx", "12")
                cluster.setAttribute("stroke-width", "2")
                cluster.setAttribute("filter", "drop-shadow(1px 1px 3px rgba(0,0,0,0.1))")
              })

              // Style edges/arrows
              const edges = svgElement.querySelectorAll(".edgePath path")
              edges.forEach((edge) => {
                edge.setAttribute("stroke-width", "2")
                edge.setAttribute("filter", "drop-shadow(1px 1px 2px rgba(0,0,0,0.1))")
              })
            }
          }
        })
      } catch (error) {
        console.error("Error rendering diagram:", error)
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="p-4 text-red-500 border border-red-300 rounded bg-red-50">
              <strong>Error rendering diagram.</strong><br/>
              Please check your Mermaid syntax.
              <details class="mt-2">
                <summary class="cursor-pointer">Error details</summary>
                <pre class="mt-2 text-xs">${error}</pre>
              </details>
            </div>
          `
        }
      }
    }
  }, [code])

  return (
    <div className="relative w-full h-full grid-background">
      <div
        ref={containerRef}
        className="mermaid-container w-full h-full flex justify-center items-center"
        style={{
          minHeight: "400px",
        }}
      />
      <style jsx>{`
        .grid-background {
          background-image: 
            radial-gradient(circle, #d0d0d0 1px, transparent 1px);
          background-size: 20px 20px;
          background-position: 0 0;
        }
        
        .mermaid-container svg {
          max-width: none !important;
          height: auto !important;
        }
        
        /* Enhanced node styling */
        .mermaid-container :global(.node rect) {
          transition: all 0.2s ease;
        }
        
        .mermaid-container :global(.node:hover rect) {
          stroke-width: 3px !important;
          filter: drop-shadow(3px 3px 6px rgba(0,0,0,0.2)) !important;
        }
        
        /* Subgraph styling */
        .mermaid-container :global(.cluster rect) {
          stroke-dasharray: none !important;
        }
        
        /* Text styling */
        .mermaid-container :global(.nodeLabel) {
          font-weight: 500;
          font-size: 14px;
        }
        
        .mermaid-container :global(.cluster-label text) {
          font-weight: 600;
          font-size: 16px;
        }
      `}</style>
    </div>
  )
}
