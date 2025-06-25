"use client"

import { useCallback } from "react"

export function useScrollPosition(key: string) {
  const saveScrollPosition = useCallback(() => {
    if (typeof window !== "undefined") {
      const scrollPosition = window.scrollY
      sessionStorage.setItem(`scroll-${key}`, scrollPosition.toString())
    }
  }, [key])

  const restoreScrollPosition = useCallback(() => {
    if (typeof window !== "undefined") {
      const savedPosition = sessionStorage.getItem(`scroll-${key}`)
      if (savedPosition) {
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          window.scrollTo(0, Number.parseInt(savedPosition, 10))
        }, 100)
      }
    }
  }, [key])

  const clearScrollPosition = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(`scroll-${key}`)
    }
  }, [key])

  return {
    saveScrollPosition,
    restoreScrollPosition,
    clearScrollPosition,
  }
}
