import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Set initial value from matchMedia
    setIsMobile(mql.matches)

    // Use modern addEventListener if available, fallback to deprecated addListener
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    } else if (typeof mql.addListener === 'function') {
      // Fallback for older browsers
      mql.addListener(onChange)
      return () => mql.removeListener(onChange)
    } else {
      // Ultimate fallback using resize listener
      const handleResize = () => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      }
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  return !!isMobile
}
