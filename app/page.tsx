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
    console.log("1. 按钮被点击了！")
    setIsRewritingWork(true)
    try {
      // ====== 只发送有内容的字段 ======
      const nonEmptyData: Partial<ResumeData> = {}
      if (data.intro?.trim()) nonEmptyData.intro = data.intro
      if (data.work?.length) nonEmptyData.work = data.work
      if (data.internship?.length) nonEmptyData.internship = data.internship
      if (data.project?.length) nonEmptyData.project = data.project
      if (data.education?.length) nonEmptyData.education = data.education
      if (data.skills?.length) nonEmptyData.skills = data.skills
      if (data.evaluation?.trim()) nonEmptyData.evaluation = data.evaluation

      console.log("2. 准备发送的数据（仅非空字段）:", nonEmptyData)

      const response = await fetch("https://rewrite-psi.vercel.app/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullResume: nonEmptyData }),
      })

      console.log("3. 收到响应，状态码:", response.status)

      const payload = await response.json()
      console.log("4. 解析后的 payload:", payload)

      if (!response.ok) {
        throw new Error(payload.error || `请求失败（${response.status}）`)
      }

      const content = payload.choices?.[0]?.message?.content
      console.log("5. 提取的 content:", content)

      if (!content) {
        throw new Error("AI 未返回润色内容")
      }

      let result
      try {
        result = JSON.parse(content)
        console.log("6. 解析为 JSON 成功:", result)
      } catch {
        // 如果 AI 只返回了纯文本，当作 intro 处理
        result = { intro: content }
        console.log("6. 解析为纯文本，作为 intro:", result)
      }

      console.log("7. 准备更新 data...")
      setData((oldData) => ({
        ...oldData,
        intro: result.intro ?? oldData.intro,
        work: result.work ?? oldData.work,
        internship: result.internship ?? oldData.internship,
        project: result.project ?? oldData.project,
        education: result.education ?? oldData.education,
        skills: result.skills ?? oldData.skills,
        evaluation: result.evaluation ?? oldData.evaluation,
      }))
      console.log("8. data 更新完成")

      setWorkRewritten(true)
      window.setTimeout(() => setWorkRewritten(false), 3000)
    } catch (error) {
      console.error("润色失败:", error)
      alert(error instanceof Error ? error.message : "简历润色失败，请重试")
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
