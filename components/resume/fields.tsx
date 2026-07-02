"use client"

import type React from "react"
import type { DateRange } from "@/lib/resume-types"
import { cn } from "@/lib/utils"

export function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

const baseInput =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"

export function TextInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(baseInput, className)} {...props} />
}

export function TextArea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(baseInput, "min-h-24 resize-y leading-relaxed", className)} {...props} />
}

/** Month/year range picker with an "Until Now" checkbox. */
export function MonthRange({
  value,
  onChange,
}: {
  value: DateRange
  onChange: (v: Partial<DateRange>) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-2">
        <Field label="Start" className="flex-1">
          <input
            type="month"
            value={value.start}
            onChange={(e) => onChange({ start: e.target.value })}
            className={baseInput}
          />
        </Field>
        <span className="pb-2.5 text-muted-foreground">—</span>
        <Field label="End" className="flex-1">
          <input
            type="month"
            value={value.end}
            disabled={value.untilNow}
            onChange={(e) => onChange({ end: e.target.value })}
            className={cn(baseInput, value.untilNow && "opacity-40")}
          />
        </Field>
      </div>
      <label className="flex w-fit cursor-pointer items-center gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={value.untilNow}
          onChange={(e) => onChange({ untilNow: e.target.checked })}
          className="h-3.5 w-3.5 rounded border-input accent-primary"
        />
        至今 (Until Now)
      </label>
    </div>
  )
}
