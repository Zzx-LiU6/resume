"use client"

import { Columns2, Download, FileText, Languages, LoaderCircle, Rows2, Sparkles, Type, RotateCcw } from "lucide-react"
import { type Lang, type ResumeTheme, type ThemeId, THEMES } from "@/lib/resume-types"
import { cn } from "@/lib/utils"

export type LayoutMode = "split" | "stacked"

export function Toolbar({
  layout,
  onLayoutChange,
  themeId,
  onThemeChange,
  lang,
  onLangChange,
  fontScale,
  onFontScaleChange,
  onExport,
  onRewriteWork,
  isRewritingWork,
  workRewritten,
  onRestoreOriginal,   // 👈 新增
  progressText,        // 👈 新增
}: {
  layout: LayoutMode
  onLayoutChange: (l: LayoutMode) => void
  themeId: ThemeId
  onThemeChange: (t: ThemeId) => void
  lang: Lang
  onLangChange: (l: Lang) => void
  fontScale: number
  onFontScaleChange: (v: number) => void
  onExport: () => void
  onRewriteWork: () => void
  isRewritingWork: boolean
  workRewritten: boolean
  onRestoreOriginal: () => void   // 👈 新增
  progressText: string            // 👈 新增
}) {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <FileText className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-semibold text-foreground">Resume Builder</h1>
            <p className="text-[11px] text-muted-foreground">通用简历生成器</p>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-2">
          {/* 布局切换 */}
          <div className="flex items-center rounded-md border border-border p-0.5" role="group" aria-label="简历布局">
            <ToggleBtn active={layout === "split"} onClick={() => onLayoutChange("split")} label="分栏">
              <Columns2 className="h-4 w-4" />
            </ToggleBtn>
            <ToggleBtn active={layout === "stacked"} onClick={() => onLayoutChange("stacked")} label="单栏">
              <Rows2 className="h-4 w-4" />
            </ToggleBtn>
          </div>

          {/* 语言切换 */}
          <div className="flex items-center rounded-md border border-border p-0.5" role="group" aria-label="标题语言">
            <Languages className="ml-1.5 h-4 w-4 text-muted-foreground" />
            <ToggleBtn active={lang === "zh"} onClick={() => onLangChange("zh")} label="中" alwaysLabel />
            <ToggleBtn active={lang === "en"} onClick={() => onLangChange("en")} label="EN" alwaysLabel />
          </div>

          {/* 字号缩放 */}
          <div className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5">
            <Type className="h-4 w-4 text-muted-foreground" />
            <input
              type="range"
              min={0.8}
              max={1.3}
              step={0.05}
              value={fontScale}
              onChange={(e) => onFontScaleChange(Number(e.target.value))}
              aria-label="字号缩放"
              className="h-1.5 w-20 cursor-pointer accent-primary sm:w-24"
            />
            <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
              {Math.round(fontScale * 100)}%
            </span>
          </div>

          {/* 主题切换 */}
          <ThemeSwitcher themeId={themeId} onThemeChange={onThemeChange} />

          {/* 👇 恢复原文按钮 */}
          {workRewritten && (
            <button
              type="button"
              onClick={onRestoreOriginal}
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="恢复到润色前的版本"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">恢复原文</span>
            </button>
          )}

          {/* 👇 润色按钮（带进度文字） */}
          <button
            type="button"
            onClick={onRewriteWork}
            disabled={isRewritingWork}
            aria-busy={isRewritingWork}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRewritingWork ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>
              {isRewritingWork
                ? progressText || "润色中..."
                : workRewritten
                ? "✅ 已润色"
                : "AI一键润色"}
            </span>
          </button>

          {/* 导出 PDF */}
          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">导出 PDF</span>
          </button>
        </div>
      </div>
    </header>
  )
}

function ToggleBtn({
  active,
  onClick,
  label,
  alwaysLabel,
  children,
}: {
  active: boolean
  onClick: () => void
  label: string
  alwaysLabel?: boolean
  children?: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
      <span className={cn(!alwaysLabel && "hidden sm:inline")}>{label}</span>
    </button>
  )
}

function ThemeSwitcher({
  themeId,
  onThemeChange,
}: {
  themeId: ThemeId
  onThemeChange: (t: ThemeId) => void
}) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-border px-1.5 py-1" role="group" aria-label="配色主题">
      {THEMES.map((t: ResumeTheme) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onThemeChange(t.id)}
          title={t.name}
          aria-label={`主题 ${t.name}`}
          aria-pressed={themeId === t.id}
          className={cn(
            "h-6 w-6 rounded-full border-2 transition-all",
            themeId === t.id ? "scale-110 border-ring" : "border-border/50 hover:scale-105",
          )}
          style={{ background: t.swatch }}
        />
      ))}
    </div>
  )
}
