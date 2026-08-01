"use client"

import { type ReactNode, useCallback, useLayoutEffect, useRef, useState } from "react"

const A4_WIDTH_PX = 794

export function PreviewFrame({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const paperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [height, setHeight] = useState<number>()

  const measure = useCallback(() => {
    const container = containerRef.current
    const paper = paperRef.current
    if (!container || !paper) return

    const containerWidth = container.clientWidth
    // 手机端判定：宽度小于 640px
    const isMobile = containerWidth < 640
    // 目标宽度：手机端留 8px 边距，桌面端留 16px
    const padding = isMobile ? 8 : 16
    const availableWidth = Math.max(containerWidth - padding, 100)
    // 计算缩放比例，最大不超过 1
    const nextScale = Math.min(1, availableWidth / A4_WIDTH_PX)
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
