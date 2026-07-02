"use client"

import type React from "react"
import { Mail, MapPin, Phone, Target, User } from "lucide-react"
import {
  type DateRange,
  type Lang,
  RESUME_LABELS,
  type ResumeData,
  type ResumeTheme,
  type SectionMeta,
  type SectionType,
  sectionTitle,
} from "@/lib/resume-types"

export type ResumeLayout = "split" | "stacked"

// 英文月份缩写（英文简历使用：月 年）
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
// 中文数字月份（中文简历使用：2022年9月）
const MONTHS_CN = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]

// 新增lang参数，区分中英文格式
function fmt(ym: string, lang: Lang): string {
  if (!ym) return ""
  const [y, m] = ym.split("-")
  const mi = Number(m) - 1
  if (!y || mi < 0 || mi >= 12) return y

  if (lang === "zh") {
    // 中文：2022年9月
    return `${y}年${MONTHS_CN[mi]}月`
  } else {
    // 英文：Sep 2022（月在前）
    return `${MONTHS_EN[mi]} ${y}`
  }
}

function fmtRange(r: DateRange, lang: Lang): string {
  // 把lang传入fmt函数
  const start = fmt(r.start, lang)
  const end = r.untilNow ? RESUME_LABELS.present[lang] : fmt(r.end, lang)
  if (!start && !end) return ""
  return [start, end].filter(Boolean).join(" – ")
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="resume-section-title mb-2 font-bold uppercase tracking-wide"
      style={{
        fontSize: "0.8125em",
        color: "var(--accent)",
        borderBottom: "2px solid var(--line)",
        paddingBottom: "3px",
      }}
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
        <li
          key={i}
          className="flex gap-1.5 leading-relaxed"
          style={{ fontSize: "0.75em", color: "var(--ink)" }}
        >
          <span style={{ color: "var(--accent)" }}>•</span>
          <span>{b}</span>
        </li>
      ))}
    </ul>
  )
}

function EntryHead({ left, sub, when }: { left: string; sub?: string; when?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className="min-w-0">
        <span className="font-semibold" style={{ fontSize: "0.8125em", color: "var(--ink)" }}>
          {left}
        </span>
        {sub && (
          <span style={{ fontSize: "0.75em", color: "var(--subtle)" }}>
            {"  ·  "}
            {sub}
          </span>
        )}
      </div>
      {when && (
        <span className="shrink-0 tabular-nums" style={{ fontSize: "0.6875em", color: "var(--subtle)" }}>
          {when}
        </span>
      )}
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

export function ResumePreview({
  data,
  theme,
  sections,
  lang,
  layout,
  fontScale,
  showPhoto,
}: {
  data: ResumeData
  theme: ResumeTheme
  sections: SectionMeta[]
  lang: Lang
  layout: ResumeLayout
  fontScale: number
  showPhoto: boolean
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
    // Base font size — all inner text uses em so it scales globally.
    fontSize: `${16 * fontScale}px`,
  } as React.CSSProperties

  const p = data.personal
  const hasPhoto = showPhoto && !!p.photo

  const renderSection = (meta: SectionMeta) => {
    const key = meta.type as SectionType
    const title = sectionTitle(key, lang)
    switch (key) {
      case "intro":
        if (!data.intro.trim()) return null
        return (
          <Section key={key} title={title}>
            <p className="leading-relaxed" style={{ fontSize: "0.75em", color: "var(--ink)" }}>
              {data.intro}
            </p>
          </Section>
        )
      case "education":
        if (!data.education.length) return null
        return (
          <Section key={key} title={title}>
            <div className="flex flex-col gap-2.5">
              {data.education.map((e) => (
                <div key={e.id} className="resume-entry">
                  <EntryHead left={e.school} sub={e.degree} when={fmtRange(e, lang)} />
                  <div className="flex items-baseline justify-between gap-3">
                    <span style={{ fontSize: "0.75em", color: "var(--subtle)" }}>{e.major}</span>
                    {e.gpa && (
                      <span style={{ fontSize: "0.6875em", color: "var(--subtle)" }}>
                        {RESUME_LABELS.gpa[lang]}: {e.gpa}
                      </span>
                    )}
                  </div>
                  {e.courses && (
                    <p className="mt-0.5 leading-relaxed" style={{ fontSize: "0.6875em", color: "var(--subtle)" }}>
                      {RESUME_LABELS.courses[lang]}: {e.courses}
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
          <Section key={key} title={title}>
            <div className="flex flex-col gap-2.5">
              {items.map((it) => (
                <div key={it.id} className="resume-entry">
                  <EntryHead left={it.org} sub={it.role} when={fmtRange(it, lang)} />
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
          <Section key={key} title={title}>
            <div className="flex flex-col gap-2.5">
              {data.project.map((pr) => (
                <div key={pr.id} className="resume-entry">
                  <EntryHead left={pr.name} sub={pr.role} when={fmtRange(pr, lang)} />
                  {pr.intro && (
                    <p className="mt-0.5 leading-relaxed" style={{ fontSize: "0.75em", color: "var(--ink)" }}>
                      {pr.intro}
                    </p>
                  )}
                  {pr.skills && (
                    <p className="mt-0.5" style={{ fontSize: "0.6875em", color: "var(--subtle)" }}>
                      {RESUME_LABELS.skills[lang]}: {pr.skills}
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
          <Section key={key} title={title}>
            <div className="flex flex-col gap-1">
              {data.awards.map((a) => (
                <div key={a.id} className="resume-entry flex items-baseline justify-between gap-3">
                  <span style={{ fontSize: "0.75em", color: "var(--ink)" }}>
                    <span className="font-semibold">{a.name}</span>
                    {a.issuer && <span style={{ color: "var(--subtle)" }}> · {a.issuer}</span>}
                  </span>
                  <span className="shrink-0 tabular-nums" style={{ fontSize: "0.6875em", color: "var(--subtle)" }}>
                    {fmt(a.date, lang)}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )
      case "skills":
        if (!data.skills.length) return null
        return (
          <Section key={key} title={title}>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((s) => (
                <span
                  key={s.id}
                  className="rounded px-2 py-1 font-medium"
                  style={{ fontSize: "0.6875em", background: "var(--tag-bg)", color: "var(--tag-ink)" }}
                >
                  {s.name}
                  <span style={{ color: "var(--subtle)" }}> · {RESUME_LABELS.levels[s.level][lang]}</span>
                </span>
              ))}
            </div>
          </Section>
        )
      case "evaluation":
        if (!data.evaluation.trim()) return null
        return (
          <Section key={key} title={title}>
            <p className="leading-relaxed" style={{ fontSize: "0.75em", color: "var(--ink)" }}>
              {data.evaluation}
            </p>
          </Section>
        )
      default:
        return null
    }
  }

  const contactItems = [
    { icon: User, text: p.gender },
    { icon: Phone, text: p.phone },
    { icon: Mail, text: p.email },
    { icon: MapPin, text: p.city },
  ].filter((c) => c.text)

  const Photo = hasPhoto ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={p.photo || "/placeholder.svg"}
      alt={`${p.fullName} 证件照`}
      className="shrink-0 rounded object-cover"
      style={{ width: "5.5em", height: "7em", border: "1px solid var(--line)" }}
    />
  ) : null

  const NameBlock = (
    <div className="min-w-0">
      <h1 className="font-bold leading-tight" style={{ fontSize: "1.625em", color: "var(--ink)" }}>
        {p.fullName || (lang === "zh" ? "你的姓名" : "Your Name")}
      </h1>
      {p.jobIntention && (
        <div
          className="mt-0.5 flex items-center gap-1.5 font-medium"
          style={{ fontSize: "0.8125em", color: "var(--accent)" }}
        >
          <Target style={{ width: "1em", height: "1em" }} />
          {p.jobIntention}
        </div>
      )}
    </div>
  )

  const Contacts = (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
      {contactItems.map((c, i) => {
        const Icon = c.icon
        return (
          <span
            key={i}
            className="flex items-center gap-1"
            style={{ fontSize: "0.6875em", color: "var(--subtle)" }}
          >
            <Icon style={{ width: "0.9em", height: "0.9em" }} />
            {c.text}
          </span>
        )
      })}
    </div>
  )

  const visibleSections = sections.filter((s) => s.visible)

  // ---- Split two-column layout: sidebar (personal + photo) | sections ----
  if (layout === "split") {
    return (
      <div className="resume-paper mx-auto flex shadow-lg" style={cssVars}>
        <aside
          className="resume-entry flex shrink-0 flex-col gap-3 px-[10mm] py-[14mm]"
          style={{ width: "62mm", background: "var(--tag-bg)" }}
        >
          {Photo && <div className="flex justify-center">{Photo}</div>}
          {NameBlock}
          <div className="flex flex-col gap-1.5">
            {contactItems.map((c, i) => {
              const Icon = c.icon
              return (
                <span
                  key={i}
                  className="flex items-center gap-1.5"
                  style={{ fontSize: "0.6875em", color: "var(--subtle)" }}
                >
                  <Icon style={{ width: "0.95em", height: "0.95em" }} />
                  {c.text}
                </span>
              )
            })}
          </div>
        </aside>
        <div className="min-w-0 flex-1 px-[12mm] py-[14mm]">
          <div className="flex flex-col gap-4">{visibleSections.map(renderSection)}</div>
        </div>
      </div>
    )
  }

  // ---- Single vertical layout: header on top, sections stacked ----
  return (
    <div className="resume-paper mx-auto px-[16mm] py-[14mm] shadow-lg" style={cssVars}>
      <header className="resume-entry flex items-start gap-4 border-b pb-3" style={{ borderColor: "var(--line)" }}>
        {Photo}
        <div className="min-w-0 flex-1">
          {NameBlock}
          {Contacts}
        </div>
      </header>
      <div className="mt-4 flex flex-col gap-4">{visibleSections.map(renderSection)}</div>
    </div>
  )
}
