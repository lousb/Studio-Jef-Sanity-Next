// FigureHoverContext.tsx
"use client";

import { createContext, useContext, useState, PropsWithChildren } from 'react'

const FigureHoverContext = createContext<{
  hoveredCaption: string | null
  setHoveredCaption: (c: string | null) => void
} | null>(null)

export function FigureHoverProvider({ children }: PropsWithChildren) {
  const [hoveredCaption, setHoveredCaption] = useState<string | null>(null)
  return (
    <FigureHoverContext.Provider value={{ hoveredCaption, setHoveredCaption }}>
      {children}
    </FigureHoverContext.Provider>
  )
}

export function useFigureHover() {
  const ctx = useContext(FigureHoverContext)
  if (!ctx) throw new Error('useFigureHover must be used within FigureHoverProvider')
  return ctx
}