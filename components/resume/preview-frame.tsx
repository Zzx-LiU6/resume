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
    // 如果容器宽度为 0 或小于 100，使用屏幕宽度
    let availableWidth = containerWidth
    if (availableWidth < 100) {
      availableWidth = typeof window !== "undefined" ? window.innerWidth : 794
    }

    // 手机端判断：容器宽度小于 640px
    const isMobile = availableWidth < 640
    // 手机端留边距，桌面端不留
    const padding = isMobile ? 12 : 0
    const targetWidth = Math.max(availableWidth - padding, 100)
    const nextScale = Math.min(1, targetWidth / A4_WIDTH_PX)

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
          style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
