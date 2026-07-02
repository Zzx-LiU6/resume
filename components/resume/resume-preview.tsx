"use client"

import type React from "react"
import { Mail, MapPin, Phone, Target, User } from "lucide-react"
import type { DateRange, ResumeData, ResumeTheme, SectionMeta, SectionType } from "@/lib/resume-types"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function fmt(ym: string): string {
  if (!ym) return ""
  const [y, m] = ym.split("-")
  const mi = Number(m) - 1
  if (!y) return ""
  return m && mi >= 0 && mi < 12 ? `${MONTHS[mi]} ${y}` : y
}

function fmtRange(r: DateRange): string {
  const start = fmt(r.start)
  const end = r.untilNow ? "Present" : fmt(r.end)
  if (!start && !end) return ""
  return [start, end].filter(Boolean).join(" – ")
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="resume-section-title mb-2 text-[13px] font-bold uppercase tracking-wide"
      style={{ color: "var(--accent)", borderBottom: "2px solid var(--line)", paddingBottom: "3px" }}
    >
      {children}
    </h2>
  )
}

function Bullets({ bullets }: { bullets: string[] }) {
  const list = bullets.filter((b) => b.trim())
  if (!list.length) return null
  return (
    <ul className="mt-1 flex flex-col gap-0.5">
      {list.map((b, i) => (
        <li key={i} className="flex gap-1.5 text-[12px] leading-relaxed" style={{ color: "var(--ink)" }}>
          <span style={{ color: "var(--accent)" }}>•</span>
          <span>{b}</span>
        </li>
      ))}
    </ul>
  )
}

function EntryHead({
  left,
  right,
  sub,
  when,
}: {
  left: string
  right?: string
  sub?: string
  when?: string
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className="min-w-0">
        <span className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>
          {left}
        </span>
        {sub && (
          <span className="text-[12px]" style={{ color: "var(--subtle)" }}>
            {"  ·  "}
            {sub}
          </span>
        )}
      </div>
      {when && (
        <span className="shrink-0 text-[11px] tabular-nums" style={{ color: "var(--subtle)" }}>
          {when}
        </span>
      )}
      {right && !when && (
        <span className="shrink-0 text-[11px]" style={{ color: "var(--subtle)" }}>
          {right}
        </span>
      )}
    </div>
  )
}

export function ResumePreview({
  data,
  theme,
  sections,
}: {
  data: ResumeData
  theme: ResumeTheme
  sections: SectionMeta[]
}) {
  const cssVars = {
    "--paper": theme.vars.paper,
    "--ink": theme.vars.ink,
    "--subtle": theme.vars.subtle,
    "--accent": theme.vars.accent,
    "--line": theme.vars.line,
    "--tag-bg": theme.vars.tagBg,
    "--tag-ink": theme.vars.tagInk,
    backgroundColor: theme.vars.paper,
    color: theme.vars.ink,
  } as React.CSSProperties

  const p = data.personal
  const contactItems = [
    { icon: User, text: p.gender },
    { icon: Phone, text: p.phone },
    { icon: Mail, text: p.email },
    { icon: MapPin, text: p.city },
  ].filter((c) => c.text)

  const renderSection = (meta: SectionMeta) => {
    const key = meta.type as SectionType
    switch (key) {
      case "intro":
        if (!data.intro.trim()) return null
        return (
          <Section key={key} title={meta.title}>
            <p className="text-[12px] leading-relaxed" style={{ color: "var(--ink)" }}>
              {data.intro}
            </p>
          </Section>
        )
      case "education":
        if (!data.education.length) return null
        return (
          <Section key={key} title={meta.title}>
            <div className="flex flex-col gap-2.5">
              {data.education.map((e) => (
                <div key={e.id} className="resume-entry">
                  <EntryHead left={e.school} sub={e.degree} when={fmtRange(e)} />
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[12px]" style={{ color: "var(--subtle)" }}>
                      {e.major}
                    </span>
                    {e.gpa && (
                      <span className="text-[11px]" style={{ color: "var(--subtle)" }}>
                        GPA: {e.gpa}
                      </span>
                    )}
                  </div>
                  {e.courses && (
                    <p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: "var(--subtle)" }}>
                      Courses: {e.courses}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )
      case "work":
      case "internship":
      case "campus": {
        const items = data[key]
        if (!items.length) return null
        return (
          <Section key={key} title={meta.title}>
            <div className="flex flex-col gap-2.5">
              {items.map((it) => (
                <div key={it.id} className="resume-entry">
                  <EntryHead left={it.org} sub={it.role} when={fmtRange(it)} />
                  <Bullets bullets={it.bullets} />
                </div>
              ))}
            </div>
          </Section>
        )
      }
      case "project":
        if (!data.project.length) return null
        return (
          <Section key={key} title={meta.title}>
            <div className="flex flex-col gap-2.5">
              {data.project.map((pr) => (
                <div key={pr.id} className="resume-entry">
                  <EntryHead left={pr.name} sub={pr.role} when={fmtRange(pr)} />
                  {pr.intro && (
                    <p className="mt-0.5 text-[12px] leading-relaxed" style={{ color: "var(--ink)" }}>
                      {pr.intro}
                    </p>
                  )}
                  {pr.skills && (
                    <p className="mt-0.5 text-[11px]" style={{ color: "var(--subtle)" }}>
                      Skills: {pr.skills}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )
      case "awards":
        if (!data.awards.length) return null
        return (
          <Section key={key} title={meta.title}>
            <div className="flex flex-col gap-1">
              {data.awards.map((a) => (
                <div key={a.id} className="resume-entry flex items-baseline justify-between gap-3">
                  <span className="text-[12px]" style={{ color: "var(--ink)" }}>
                    <span className="font-semibold">{a.name}</span>
                    {a.issuer && <span style={{ color: "var(--subtle)" }}> · {a.issuer}</span>}
                  </span>
                  <span className="shrink-0 text-[11px] tabular-nums" style={{ color: "var(--subtle)" }}>
                    {fmt(a.date)}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )
      case "skills":
        if (!data.skills.length) return null
        return (
          <Section key={key} title={meta.title}>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((s) => (
                <span
                  key={s.id}
                  className="rounded px-2 py-1 text-[11px] font-medium"
                  style={{ background: "var(--tag-bg)", color: "var(--tag-ink)" }}
                >
                  {s.name}
                  <span style={{ color: "var(--subtle)" }}> · {s.level}</span>
                </span>
              ))}
            </div>
          </Section>
        )
      case "evaluation":
        if (!data.evaluation.trim()) return null
        return (
          <Section key={key} title={meta.title}>
            <p className="text-[12px] leading-relaxed" style={{ color: "var(--ink)" }}>
              {data.evaluation}
            </p>
          </Section>
        )
      default:
        return null
    }
  }

  return (
    <div className="resume-paper mx-auto px-[16mm] py-[14mm] shadow-lg" style={cssVars}>
      {/* Fixed header */}
      <header className="resume-entry border-b pb-3" style={{ borderColor: "var(--line)" }}>
        <h1 className="text-[26px] font-bold leading-tight" style={{ color: "var(--ink)" }}>
          {p.fullName || "Your Name"}
        </h1>
        {p.jobIntention && (
          <div className="mt-0.5 flex items-center gap-1.5 text-[13px] font-medium" style={{ color: "var(--accent)" }}>
            <Target className="h-3.5 w-3.5" />
            {p.jobIntention}
          </div>
        )}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {contactItems.map((c, i) => {
            const Icon = c.icon
            return (
              <span key={i} className="flex items-center gap-1 text-[11px]" style={{ color: "var(--subtle)" }}>
                <Icon className="h-3 w-3" />
                {c.text}
              </span>
            )
          })}
        </div>
      </header>

      <div className="mt-4 flex flex-col gap-4">
        {sections.filter((s) => s.visible).map(renderSection)}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="resume-section">
      <SectionTitle>{title}</SectionTitle>
      {children}
    </section>
  )
}
