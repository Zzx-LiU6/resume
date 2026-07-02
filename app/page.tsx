"use client"

import { useMemo, useState } from "react"
import { EditPanel } from "@/components/resume/edit-panel"
import { PreviewFrame } from "@/components/resume/preview-frame"
import { ResumePreview } from "@/components/resume/resume-preview"
import { type LayoutMode, Toolbar } from "@/components/resume/toolbar"
import { DEFAULT_SECTIONS, MOCK_DATA } from "@/lib/resume-mock"
import { type ResumeData, type SectionMeta, type SectionType, type ThemeId, THEMES } from "@/lib/resume-types"
import { cn } from "@/lib/utils"

export default function Page() {
  const [data, setData] = useState<ResumeData>(MOCK_DATA)
  const [sections, setSections] = useState<SectionMeta[]>(DEFAULT_SECTIONS)
  const [themeId, setThemeId] = useState<ThemeId>("classic")
  const [layout, setLayout] = useState<LayoutMode>("split")

  const theme = useMemo(() => THEMES.find((t) => t.id === themeId) ?? THEMES[0], [themeId])

  const reorder = (from: number, to: number) =>
    setSections((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })

  const toggle = (type: SectionType) =>
    setSections((prev) => prev.map((s) => (s.type === type ? { ...s, visible: !s.visible } : s)))

  const isSplit = layout === "split"

  return (
    <div className="min-h-screen bg-muted/40">
      <Toolbar
        layout={layout}
        onLayoutChange={setLayout}
        themeId={themeId}
        onThemeChange={setThemeId}
        onExport={() => window.print()}
      />

      <main
        className={cn(
          "mx-auto max-w-[1600px] gap-6 p-4 sm:p-6",
          isSplit ? "flex flex-col lg:flex-row" : "flex flex-col",
        )}
      >
        {/* Edit panel */}
        <section
          className={cn(
            "no-print min-w-0",
            isSplit ? "w-full lg:w-[440px] lg:shrink-0" : "mx-auto w-full max-w-3xl",
          )}
        >
          <div
            className={cn(isSplit && "lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-2")}
          >
            <EditPanel data={data} setData={setData} sections={sections} onReorder={reorder} onToggle={toggle} />
          </div>
        </section>

        {/* Preview */}
        <section className="print-region min-w-0 flex-1">
          <PreviewFrame>
            <ResumePreview data={data} theme={theme} sections={sections} />
          </PreviewFrame>
        </section>
      </main>
    </div>
  )
}
