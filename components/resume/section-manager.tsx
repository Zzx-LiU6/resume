"use client"

import { useState } from "react"
import { Eye, EyeOff, GripVertical } from "lucide-react"
import { type Lang, type SectionMeta, type SectionType, SECTION_TITLES } from "@/lib/resume-types"
import { cn } from "@/lib/utils"

export function SectionManager({
  sections,
  lang,
  onReorder,
  onToggle,
}: {
  sections: SectionMeta[]
  lang: Lang
  onReorder: (from: number, to: number) => void
  onToggle: (type: SectionType) => void
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  return (
    <ul className="flex flex-col gap-1.5">
      {sections.map((s, i) => (
        <li
          key={s.type}
          draggable
          onDragStart={() => setDragIndex(i)}
          onDragEnter={() => setOverIndex(i)}
          onDragOver={(e) => e.preventDefault()}
          onDragEnd={() => {
            if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex) {
              onReorder(dragIndex, overIndex)
            }
            setDragIndex(null)
            setOverIndex(null)
          }}
          className={cn(
            "flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-2 transition-all duration-200",
            dragIndex === i && "opacity-50",
            overIndex === i && dragIndex !== i && "border-ring ring-2 ring-ring/30",
            !s.visible && "opacity-60",
          )}
        >
          <button
            type="button"
            className="cursor-grab text-muted-foreground active:cursor-grabbing"
            aria-label="拖动排序"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="flex-1 truncate text-sm text-foreground">
            {SECTION_TITLES[s.type].zh}
            {lang === "en" && (
              <span className="ml-1.5 text-xs text-muted-foreground">{SECTION_TITLES[s.type].en}</span>
            )}
          </span>
          <button
            type="button"
            onClick={() => onToggle(s.type)}
            aria-label={s.visible ? "隐藏该模块" : "显示该模块"}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {s.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </li>
      ))}
    </ul>
  )
}
