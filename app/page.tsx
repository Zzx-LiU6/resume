"use client"

import { useMemo, useState } from "react"
import { EditPanel } from "@/components/resume/edit-panel"
import { PreviewFrame } from "@/components/resume/preview-frame"
import { ResumePreview } from "@/components/resume/resume-preview"
import { type LayoutMode, Toolbar } from "@/components/resume/toolbar"
import { DEFAULT_SECTIONS, MOCK_DATA } from "@/lib/resume-mock"
import {
  type Lang,
  type ResumeData,
  type SectionMeta,
  type SectionType,
  type ThemeId,
  THEMES,
} from "@/lib/resume-types"

export default function Page() {
  const [data, setData] = useState<ResumeData>(MOCK_DATA)
  const [isRewritingWork, setIsRewritingWork] = useState(false)
  const [workRewritten, setWorkRewritten] = useState(false)
  const [sections, setSections] = useState<SectionMeta[]>(DEFAULT_SECTIONS)
  const [themeId, setThemeId] = useState<ThemeId>("classic")
  const [layout, setLayout] = useState<LayoutMode>("split")
  const [lang, setLang] = useState<Lang>("zh")
  const [fontScale, setFontScale] = useState(1)
  const [showPhoto, setShowPhoto] = useState(true)

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
  const rewriteWork = async () => {
    console.log('按钮被点击了！')
    setIsRewritingWork(true)
    try {
      // 传递完整简历，不再只传work模块
      const response = await fetch("https://rewrite-psi.vercel.app/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullResume: data }),
      })
      const payload = await response.json()
      // 判断返回完整简历对象，不再判断数组
      if (!response.ok || !payload.success || !payload.result) {
        throw new Error(payload.error ?? "简历润色失败")
      }

      // ============核心修改============
      // 只覆盖简历文字字段，完全保留你现有的所有UI配置，不会重置隐藏板块、字号
      setData((oldData) => ({
        ...oldData,
        intro: payload.result.intro,
        work: payload.result.work,
        project: payload.result.project,
        education: payload.result.education,
        skills: payload.result.skills
      }))
      // ==================================

      setWorkRewritten(true)
      window.setTimeout(() => setWorkRewritten(false), 3000)
    } catch (error) {
      alert(error instanceof Error ? error.message : "简历润色失败")
    } finally {
      setIsRewritingWork(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <Toolbar
        layout={layout}
        onLayoutChange={setLayout}
        themeId={themeId}
        onThemeChange={setThemeId}
        lang={lang}
        onLangChange={setLang}
        fontScale={fontScale}
        onFontScaleChange={setFontScale}
        onExport={() => window.print()}
        onRewriteWork={rewriteWork}
        isRewritingWork={isRewritingWork}
        workRewritten={workRewritten}
      />

      <main className="mx-auto flex max-w-[1600px] flex-col gap-6 p-4 sm:p-6 lg:flex-row">
        {/* Edit panel */}
        <section className="no-print w-full min-w-0 lg:w-[440px] lg:shrink-0">
          <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-2">
            <EditPanel
              data={data}
              setData={setData}
              sections={sections}
              lang={lang}
              showPhoto={showPhoto}
              onTogglePhoto={setShowPhoto}
              onReorder={reorder}
              onToggle={toggle}
            />
          </div>
        </section>

        {/* Preview */}
        <section className="print-region min-w-0 flex-1 w-full max-w-full overflow-x-auto">
          <PreviewFrame>
            <ResumePreview
              data={data}
              theme={theme}
              sections={sections}
              lang={lang}
              layout={layout}
              fontScale={fontScale}
              showPhoto={showPhoto}
            />
          </PreviewFrame>
        </section>
      </main>
    </div>
  )
}
