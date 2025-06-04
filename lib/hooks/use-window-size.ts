"use client"

import { useState, useEffect } from "react"

interface WindowSize {
  width: number
  height: number
}

export function useWindowSize(): WindowSize {
  // Initialize with default values for SSR - no window access during initial render
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 1200, // Default fallback width
    height: 800, // Default fallback height
  })

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    // Handler to call on window resize
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Set initial window size
    handleResize()

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize)
  }, [window])

  return windowSize
}
