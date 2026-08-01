"use client"

import { type ReactNode, useCallback, useLayoutEffect, useRef, useState } from "react"

const A4_WIDTH_PX = 794 // 210mm @ 96dpi

export function PreviewFrame({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const paperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [height, setHeight] = useState<number>()
  const [isMobile, setIsMobile] = useState(false)

  const measure = useCallback(() => {
    const container = containerRef.current
    const paper = paperRef.current
    if (!container || !paper) return

    const containerWidth = container.clientWidth
    const isMobileView = typeof window !== "undefined" && window.innerWidth < 640
    setIsMobile(isMobileView)

    let nextScale: number
    if (isMobileView) {
      // 手机端：让预览区填满屏幕宽度，同时保持比例
      // 但保留一些边距，防止贴边
      const targetWidth = Math.min(containerWidth - 16, A4_WIDTH_PX)
      nextScale = Math.max(0.4, Math.min(1, targetWidth / A4_WIDTH_PX))
    } else {
      nextScale = Math.min(1, containerWidth / A4_WIDTH_PX)
    }

    setScale(nextScale)
    setHeight(paper.offsetHeight * nextScale)
  }, [])

  useLayoutEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    if (paperRef.current) ro.observe(paperRef.current)
    window.addEventListener("resize", measure)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [measure])

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <div style={{ height }} className="print:!h-auto">
        <div
          ref={paperRef}
          className="resume-scale mx-auto w-[794px] origin-top print:!w-full"
          style={{ transform: `scale(${scale})` }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
