
"use client"

import { useState, useEffect } from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  // Choose the correct initial value after the component is mounted
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    checkDevice()
    
    window.addEventListener("resize", checkDevice)
    
    return () => {
      window.removeEventListener("resize", checkDevice)
    }
  }, [])

  return isMobile;
}
