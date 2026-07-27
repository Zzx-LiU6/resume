"use client"

import { useMemo, useState, useEffect } from "react"
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

// 本地存储统一key
const STORAGE_KEY = "resume_ui_config"

export default function Page() {
  const [data, setData] = useState<ResumeData>(MOCK_DATA)
  const [isRewritingWork, setIsRewritingWork] = useState(false)
  const [workRewritten, setWorkRewritten] = useState(false)

  // 统一UI配置状态，读取本地缓存
  const [uiConfig, setUiConfig] = useState(() => {
    const defaultConfig = {
      sections: DEFAULT_SECTIONS,
      themeId: "classic" as ThemeId,
      layout: "split" as LayoutMode,
      fontScale: 1,
      showPhoto: true,
      lang: "zh" as Lang,
    }

    if (typeof window === "undefined") return defaultConfig
    try {
      const cache = localStorage.getItem(STORAGE_KEY)
      return cache ? JSON.parse(cache) : defaultConfig
    } catch {
      return defaultConfig
    }
  })

  // 解包变量，下方渲染完全不用改
  const { sections, themeId, layout, lang, fontScale, showPhoto } = uiConfig

  // 统一更新UI配置
  const updateUiConfig = (partial: Partial<typeof uiConfig>) => {
    setUiConfig(prev => ({ ...prev, ...partial }))
  }

  // 统一存入本地存储，仅1个useEffect，简洁不冗余
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(uiConfig))
  }, [uiConfig])

  const theme = useMemo(() => THEMES.find((t) => t.id === themeId) ?? THEMES[0], [themeId])

  // 重写拖拽排序，使用统一更新方法
  const reorder = (from: number, to: number) => {
    const next = [...sections]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    updateUiConfig({ sections: next })
  }

  // 重写模块显示隐藏
  const toggle = (type: SectionType) => {
    const newSections = sections.map((s) =>
      s.type === type ? { ...s, visible: !s.visible } : s
    )
    updateUiConfig({ sections: newSections })
  }

  // ============ 下面这段润色函数完全原样保留，不用修改 ============
  const rewriteWork = async () => {
    setIsRewritingWork(true)
    try {
      const response = await fetch("https://rewrite-psi.vercel.app/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullResume: data }),
      })
      const payload = await response.json()
      if (!response.ok || !payload.success || !payload.result) {
        throw new Error(payload.error ?? "简历润色失败")
      }

      setData((oldData) => ({
        ...oldData,
        intro: payload.result.intro,
        work: payload.result.work,
        project: payload.result.project,
        education: payload.result.education,
        skills: payload.result.skills
      }))

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
        onLayoutChange={(val) => updateUiConfig({ layout: val })}
        themeId={themeId}
        onThemeChange={(val) => updateUiConfig({ themeId: val })}
        lang={lang}
        onLangChange={(val) => updateUiConfig({ lang: val })}
        fontScale={fontScale}
        onFontScaleChange={(val) => updateUiConfig({ fontScale: val })}
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
              onTogglePhoto={(val) => updateUiConfig({ showPhoto: val })}
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
