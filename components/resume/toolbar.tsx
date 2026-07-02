"use client"

import { Columns2, Download, FileText, Rows2 } from "lucide-react"
import { type ResumeTheme, type ThemeId, THEMES } from "@/lib/resume-types"
import { cn } from "@/lib/utils"

export type LayoutMode = "split" | "stacked"

export function Toolbar({
  layout,
  onLayoutChange,
  themeId,
  onThemeChange,
  onExport,
}: {
  layout: LayoutMode
  onLayoutChange: (l: LayoutMode) => void
  themeId: ThemeId
  onThemeChange: (t: ThemeId) => void
  onExport: () => void
}) {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <FileText className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-semibold text-foreground">Resume Builder</h1>
            <p className="text-[11px] text-muted-foreground">通用简历生成器</p>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {/* Layout switch */}
          <div className="flex items-center rounded-md border border-border p-0.5">
            <ToggleBtn active={layout === "split"} onClick={() => onLayoutChange("split")} label="分栏">
              <Columns2 className="h-4 w-4" />
            </ToggleBtn>
            <ToggleBtn active={layout === "stacked"} onClick={() => onLayoutChange("stacked")} label="上下">
              <Rows2 className="h-4 w-4" />
            </ToggleBtn>
          </div>

          {/* Theme switch */}
          <ThemeSwitcher themeId={themeId} onThemeChange={onThemeChange} />

          {/* Export */}
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
  children,
}: {
  active: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
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
      <span className="hidden sm:inline">{label}</span>
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
    <div className="flex items-center gap-1 rounded-md border border-border px-1.5 py-1">
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
            themeId === t.id ? "scale-110 border-ring" : "border-transparent hover:scale-105",
          )}
          style={{ background: t.swatch }}
        />
      ))}
    </div>
  )
}
