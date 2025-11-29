'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface EightBitContextType {
  isEightBit: boolean
  toggleEightBit: () => void
}

const EightBitContext = createContext<EightBitContextType | undefined>(undefined)

export function EightBitProvider({ children }: { children: ReactNode }) {
  const [isEightBit, setIsEightBit] = useState(false)

  useEffect(() => {
    // Load saved preference
    const saved = localStorage.getItem('eightBitMode')
    if (saved === 'true') {
      setIsEightBit(true)
    }
  }, [])

  useEffect(() => {
    // Apply/remove 8-bit class to html element
    if (isEightBit) {
      document.documentElement.classList.add('eight-bit')
    } else {
      document.documentElement.classList.remove('eight-bit')
    }
    // Save preference
    localStorage.setItem('eightBitMode', String(isEightBit))
  }, [isEightBit])

  const toggleEightBit = () => {
    setIsEightBit(prev => !prev)
  }

  return (
    <EightBitContext.Provider value={{ isEightBit, toggleEightBit }}>
      {children}
    </EightBitContext.Provider>
  )
}

export function useEightBit() {
  const context = useContext(EightBitContext)
  if (context === undefined) {
    throw new Error('useEightBit must be used within an EightBitProvider')
  }
  return context
}

