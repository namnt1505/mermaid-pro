"use client"

import { useEffect, useCallback } from "react"

type KeyCombination = {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
}

export function useKeyboardShortcut(keyCombination: KeyCombination, callback: () => void, enabled = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const matchesKey = event.key.toLowerCase() === keyCombination.key.toLowerCase()
      const matchesCtrl = keyCombination.ctrlKey === undefined || event.ctrlKey === keyCombination.ctrlKey
      const matchesAlt = keyCombination.altKey === undefined || event.altKey === keyCombination.altKey
      const matchesShift = keyCombination.shiftKey === undefined || event.shiftKey === keyCombination.shiftKey
      const matchesMeta = keyCombination.metaKey === undefined || event.metaKey === keyCombination.metaKey

      if (matchesKey && matchesCtrl && matchesAlt && matchesShift && matchesMeta) {
        event.preventDefault()
        callback()
      }
    },
    [callback, keyCombination],
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [enabled, handleKeyDown])
}
