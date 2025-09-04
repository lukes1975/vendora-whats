import React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)
  const [isTablet, setIsTablet] = React.useState(false)

  React.useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      setIsMobile(width < MOBILE_BREAKPOINT)
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT)
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const tql = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`)
    
    mql.addEventListener("change", checkDevice)
    tql.addEventListener("change", checkDevice)
    
    // Set initial state
    checkDevice()
    
    return () => {
      mql.removeEventListener("change", checkDevice)
      tql.removeEventListener("change", checkDevice)
    }
  }, [])

  return { isMobile, isTablet, isDesktop: !isMobile && !isTablet }
}

// Keep backward compatibility
export { useIsMobile as useIsMobileHook }