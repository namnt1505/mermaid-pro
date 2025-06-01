"use client"

import type React from "react"

import { useState, useCallback } from "react"

export function useDiagramInteraction(containerRef: React.RefObject<HTMLDivElement>) {
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 })

  const handleZoomChange = useCallback((value: number[]) => {
    setZoom(value[0])
  }, [])

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.1, 3))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.1, 0.3))
  }, [])

  const resetView = useCallback(() => {
    setPosition({ x: 0, y: 0 })
    setZoom(1)
  }, [])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
      setLastPosition(position)

      if (containerRef.current) {
        containerRef.current.style.cursor = "grabbing"
      }
    },
    [position, containerRef],
  )

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

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    if (containerRef.current) {
      containerRef.current.style.cursor = "grab"
    }
  }, [containerRef])

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
    if (containerRef.current) {
      containerRef.current.style.cursor = "grab"
    }
  }, [containerRef])

  return {
    zoom,
    position,
    isDragging,
    handlers: {
      handleZoomChange,
      handleZoomIn,
      handleZoomOut,
      resetView,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleMouseLeave,
    },
  }
}
