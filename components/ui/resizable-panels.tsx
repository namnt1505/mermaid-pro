"use client"

import type React from "react"

import { useState, useRef, useCallback, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ResizablePanelsProps {
  children: [ReactNode, ReactNode]
  defaultSizes?: [number, number]
  minSizes?: [number, number]
  className?: string
  direction?: "horizontal" | "vertical"
}

export function ResizablePanels({
  children,
  defaultSizes = [30, 70],
  minSizes = [20, 20],
  className,
  direction = "horizontal",
}: ResizablePanelsProps) {
  const [sizes, setSizes] = useState(defaultSizes)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const total = direction === "horizontal" ? rect.width : rect.height
      const position = direction === "horizontal" ? e.clientX - rect.left : e.clientY - rect.top
      const percentage = (position / total) * 100

      const newFirstSize = Math.max(minSizes[0], Math.min(100 - minSizes[1], percentage))
      const newSecondSize = 100 - newFirstSize

      setSizes([newFirstSize, newSecondSize])
    },
    [isDragging, direction, minSizes],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add global mouse event listeners
  useState(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = direction === "horizontal" ? "col-resize" : "row-resize"
      document.body.style.userSelect = "none"

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.body.style.cursor = ""
        document.body.style.userSelect = ""
      }
    }
  })

  const isHorizontal = direction === "horizontal"

  return (
    <div ref={containerRef} className={cn("flex", isHorizontal ? "flex-row" : "flex-col", "h-full", className)}>
      <div
        style={{
          [isHorizontal ? "width" : "height"]: `${sizes[0]}%`,
        }}
        className="overflow-hidden"
      >
        {children[0]}
      </div>

      <div
        className={cn(
          "bg-border hover:bg-primary/20 transition-colors cursor-col-resize flex-shrink-0",
          isHorizontal ? "w-1 cursor-col-resize hover:w-2" : "h-1 cursor-row-resize hover:h-2",
          isDragging && "bg-primary/30",
        )}
        onMouseDown={handleMouseDown}
      />

      <div
        style={{
          [isHorizontal ? "width" : "height"]: `${sizes[1]}%`,
        }}
        className="overflow-hidden"
      >
        {children[1]}
      </div>
    </div>
  )
}
