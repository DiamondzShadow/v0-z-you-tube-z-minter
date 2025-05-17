"use client"

import { useState, useEffect } from "react"

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const checkMobile = () => {
      if (typeof window !== "undefined") {
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera

        // Check if mobile based on user agent
        const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent.toLowerCase(),
        )

        // Also check screen size as a fallback
        const isMobileSize = window.innerWidth <= 768

        setIsMobile(isMobileDevice || isMobileSize)
      }
    }

    checkMobile()

    // Recheck on resize
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return { isMobile, mounted }
}
