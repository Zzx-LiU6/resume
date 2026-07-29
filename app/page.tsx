"use client"

import { useMemo, useState, useRef } from "react"
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
import { ChevronDown, ChevronRight, RotateCcw } from "lucide-react"

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

  // JD 相关状态
  const [jd, setJd] = useState("")
  const [jdExpanded, setJdExpanded] = useState(false)

  // 润色进度状态
  const [progressText, setProgressText] = useState("")

  // 🔄 备份数据（用于恢复原文）
  const originalDataRef = useRef<ResumeData | null>(null)

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

  // ✅ 恢复原文
  const restoreOriginal = () => {
    if (!originalDataRef.current) {
      alert("没有可恢复的原文（请先进行一次润色）")
      return
    }
    setData(originalDataRef.current)
    setWorkRewritten(false)
  }

  // ✅ 润色主函数（带进度提示）
  const rewriteWork = async () => {
    console.log("1. 按钮被点击了！")
    setIsRewritingWork(true)
    setWorkRewritten(false)

    // 💾 润色前保存原始数据
    originalDataRef.current = JSON.parse(JSON.stringify(data))

    try {
      // 只发送有内容的字段
      const nonEmptyData: Partial<ResumeData> = {}
      if (data.intro?.trim()) nonEmptyData.intro = data.intro
      if (data.work?.length) nonEmptyData.work = data.work
      if (data.internship?.length) nonEmptyData.internship = data.internship
      if (data.project?.length) nonEmptyData.project = data.project
      if (data.education?.length) nonEmptyData.education = data.education
      if (data.skills?.length) nonEmptyData.skills = data.skills
      if (data.evaluation?.trim()) nonEmptyData.evaluation = data.evaluation

      const fields = Object.keys(nonEmptyData)
      setProgressText(`📡 正在发送 ${fields.length} 个字段...`)

      console.log("2. 准备发送的数据（仅非空字段）:", nonEmptyData)
      console.log("3. JD 内容:", jd || "(无)")

      const response = await fetch("https://rewrite-psi.vercel.app/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullResume: nonEmptyData,
          jd: jd.trim(),
        }),
      })

      setProgressText("⏳ AI 正在润色中，请稍候...")

      console.log("4. 收到响应，状态码:", response.status)

      const payload = await response.json()
      console.log("5. 解析后的 payload:", payload)

      if (!response.ok) {
        throw new Error(payload.error || `请求失败（${response.status}）`)
      }

      const content = payload.choices?.[0]?.message?.content
      console.log("6. 提取的 content:", content)

      if (!content) {
        throw new Error("AI 未返回润色内容")
      }

      let result
      try {
        result = JSON.parse(content)
        console.log("7. 解析为 JSON 成功:", result)
      } catch {
        result = { intro: content }
        console.log("7. 解析为纯文本，作为 intro:", result)
      }

      setProgressText("📝 正在应用润色结果...")

      console.log("8. 准备更新 data...")
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
      console.log("9. data 更新完成")

      setWorkRewritten(true)
      setProgressText("✅ 润色完成！")
      window.setTimeout(() => setProgressText(""), 3000)
    } catch (error) {
      console.error("润色失败:", error)
      setProgressText("❌ 润色失败，请重试")
      window.setTimeout(() => setProgressText(""), 3000)
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
        // 👇 新增：传递恢复原文函数
        onRestoreOriginal={restoreOriginal}
        // 👇 新增：传递进度文本
        progressText={progressText}
      />

      {/* 👇 JD 输入框（可折叠） */}
      <div className="mx-auto max-w-[1600px] px-4 py-2 sm:px-6">
        <div className="rounded-lg border border-border bg-background p-2">
          <button
            type="button"
            onClick={() => setJdExpanded(!jdExpanded)}
            className="flex w-full items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            {jdExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            🎯 JD 定向润色
            {jd.trim() && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {jd.length > 20 ? jd.slice(0, 20) + "..." : jd}
              </span>
            )}
            <span className="ml-auto text-xs text-muted-foreground">
              {jdExpanded ? "点击收起" : "点击展开"}
            </span>
          </button>

          {jdExpanded && (
            <div className="mt-2">
              <textarea
                id="jd-input"
                placeholder="粘贴目标岗位的职责描述（选填）。填写后，AI 会针对该岗位定向润色简历。"
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 resize-y"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                💡 填写 JD 后，AI 会针对该岗位关键词定向优化简历内容
              </p>
            </div>
          )}
        </div>
      </div>

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
