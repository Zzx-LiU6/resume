"use client"

import { type ReactNode, useCallback, useLayoutEffect, useRef, useState } from "react"

const A4_WIDTH_PX = 794 // 210mm @ 96dpi

/**
 * Scales the fixed-width A4 paper down to fit the available width,
 * and keeps the outer wrapper height in sync so there is no empty gap.
 */
export function PreviewFrame({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const paperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [height, setHeight] = useState<number>()

  const measure = useCallback(() => {
    const container = containerRef.current
    const paper = paperRef.current
    if (!container || !paper) return
    const available = container.clientWidth
    const next = Math.min(1, available / A4_WIDTH_PX)
    setScale(next)
    setHeight(paper.offsetHeight * next)
  }, [])

  useLayoutEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    if (paperRef.current) ro.observe(paperRef.current)
    return () => ro.disconnect()
  }, [measure])

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <div style={{ height }} className="print:!h-auto">
        <div
          ref={paperRef}
          className="resume-scale mx-auto w-[794px] print:!w-full"
          style={{ transform: `scale(${scale})` }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
