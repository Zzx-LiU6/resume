"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { ChevronDown, ImageIcon, Plus, Trash2, Upload, X } from "lucide-react"
import {
  type AwardItem,
  type EducationItem,
  type ExperienceItem,
  type Lang,
  type ProjectItem,
  type ResumeData,
  type SectionMeta,
  type SectionType,
  type SkillItem,
  uid,
} from "@/lib/resume-types"
import { Field, MonthRange, TextArea, TextInput } from "./fields"
import { SectionManager } from "./section-manager"
import { cn } from "@/lib/utils"

type SetData = React.Dispatch<React.SetStateAction<ResumeData>>

function Accordion({
  title,
  hidden,
  children,
  defaultOpen,
}: {
  title: string
  hidden?: boolean
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {title}
          {hidden && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground">
              已隐藏
            </span>
          )}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border p-4">{children}</div>
        </div>
      </div>
    </div>
  )
}

function EntryCard({
  title,
  onDelete,
  children,
}: {
  title: string
  onDelete: () => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</span>
        <button
          type="button"
          onClick={onDelete}
          className="flex items-center gap-1 rounded p-1 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label="删除该条目"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-sm text-muted-foreground transition-colors hover:border-ring hover:text-foreground"
    >
      <Plus className="h-4 w-4" />
      {label}
    </button>
  )
}

/** Editable list of bullet points */
function Bullets({
  bullets,
  onChange,
  lang,
}: {
  bullets: string[]
  onChange: (b: string[]) => void
  lang: Lang
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground">
        {lang === "zh" ? "工作内容" : "Job Description (bullets)"}
      </span>
      {bullets.map((b, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
          <TextArea
            value={b}
            rows={2}
            onChange={(e) => {
              const next = [...bullets]
              next[i] = e.target.value
              onChange(next)
            }}
            className="min-h-0"
          />
          <button
            type="button"
            onClick={() => onChange(bullets.filter((_, idx) => idx !== i))}
            className="mt-1 rounded p-1 text-muted-foreground hover:text-destructive"
            aria-label="删除该条描述"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...bullets, ""])}
        className="flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" /> {lang === "zh" ? "添加描述" : "Add bullet"}
      </button>
    </div>
  )
}

export function EditPanel({
  data,
  setData,
  sections,
  lang,
  showPhoto,
  onTogglePhoto,
  onReorder,
  onToggle,
}: {
  data: ResumeData
  setData: SetData
  sections: SectionMeta[]
  lang: Lang
  showPhoto: boolean
  onTogglePhoto: (v: boolean) => void
  onReorder: (from: number, to: number) => void
  onToggle: (type: SectionType) => void
}) {
  const isHidden = (t: SectionType) => !sections.find((s) => s.type === t)?.visible
  const fileRef = useRef<HTMLInputElement>(null)

  const onPhotoFile = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setData((d) => ({ ...d, personal: { ...d.personal, photo: String(reader.result) } }))
    reader.readAsDataURL(file)
  }

  // ---- generic array helpers ----
  const addTo = <K extends keyof ResumeData>(key: K, item: ResumeData[K] extends Array<infer U> ? U : never) =>
    setData((d) => ({ ...d, [key]: [...(d[key] as unknown[]), item] }) as ResumeData)

  const removeFrom = (key: keyof ResumeData, id: string) =>
    setData((d) => ({ ...d, [key]: (d[key] as { id: string }[]).filter((x) => x.id !== id) }) as ResumeData)

  const patchIn = (key: keyof ResumeData, id: string, patch: Record<string, unknown>) =>
    setData(
      (d) =>
        ({
          ...d,
          [key]: (d[key] as { id: string }[]).map((x) => (x.id === id ? { ...x, ...patch } : x)),
        }) as ResumeData,
    )
  // 草稿本地存储标识
  const DRAFT_STORAGE_KEY = "resume_editor_draft"
  // 自动保存定时器
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 手动保存草稿
  const saveDraft = () => {
    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data))
      alert(lang === "zh" ? "草稿已临时保存到浏览器本地" : "Draft saved locally")
    } catch (err) {
      console.error("保存草稿失败", err)
      alert(lang === "zh" ? "保存失败，浏览器存储空间不足" : "Save failed, storage full")
    }
  }

  // 读取本地草稿覆盖当前表单
  const loadDraft = () => {
    try {
      const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY)
      if (!raw) {
        alert(lang === "zh" ? "暂无本地草稿" : "No local draft found")
        return
      }
      const draftData = JSON.parse(raw) as ResumeData
      setData(draftData)
      alert(lang === "zh" ? "已加载上次草稿内容" : "Draft loaded successfully")
    } catch (err) {
      console.error("读取草稿失败", err)
    }
  }

  // 清除本地存储的草稿
  const clearDraft = () => {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY)
    alert(lang === "zh" ? "本地草稿已清除（页面内容不会清空）" : "Local draft cleared")
  }

  // 页面打开时检测是否有草稿
//  useEffect(() => {
//    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY)
//    if (raw) {
//      const confirmRestore = window.confirm(
//        lang === "zh"
//          ? "检测到上次未保存的草稿，是否直接恢复？"
//          : "Detect unsaved draft, restore now?"
//      )
//      if (confirmRestore) loadDraft()
//    }
//  }, [])

  // 输入停止1秒自动缓存草稿（可选，不需要可删除整块useEffect）
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data))
    }, 1000)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [data])

  const emptyRange = { start: "", end: "", untilNow: false }

  return (
    <div className="flex flex-col gap-4">
      {/* Fixed personal info */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-1 text-sm font-semibold text-foreground">
          {lang === "zh" ? "个人信息" : "Personal Info"}
        </h2>
        <p className="mb-4 text-xs text-muted-foreground">
          {lang === "zh" ? "固定于简历顶部，不可拖动或隐藏" : "Fixed at resume top, cannot drag or hide"}
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={lang === "zh" ? "姓名" : "Full Name"}>
            <TextInput
              value={data.personal.fullName}
              onChange={(e) => setData((d) => ({ ...d, personal: { ...d.personal, fullName: e.target.value } }))}
            />
          </Field>
          <Field label={lang === "zh" ? "性别" : "Gender"}>
            <TextInput
              value={data.personal.gender}
              onChange={(e) => setData((d) => ({ ...d, personal: { ...d.personal, gender: e.target.value } }))}
            />
          </Field>
          <Field label={lang === "zh" ? "出生日期" : "Birth Date"}>
            <input
              type="month"
              value={data.personal.birthDate}
              onChange={(e) => setData((d) => ({ ...d, personal: { ...d.personal, birthDate: e.target.value } }))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </Field>
          <Field label={lang === "zh" ? "电话" : "Phone"}>
            <TextInput
              value={data.personal.phone}
              onChange={(e) => setData((d) => ({ ...d, personal: { ...d.personal, phone: e.target.value } }))}
            />
          </Field>
          <Field label={lang === "zh" ? "邮箱" : "Email"}>
            <TextInput
              value={data.personal.email}
              onChange={(e) => setData((d) => ({ ...d, personal: { ...d.personal, email: e.target.value } }))}
            />
          </Field>
          <Field label={lang === "zh" ? "现居城市" : "City"}>
            <TextInput
              value={data.personal.city}
              onChange={(e) => setData((d) => ({ ...d, personal: { ...d.personal, city: e.target.value } }))}
            />
          </Field>
          <Field label={lang === "zh" ? "求职意向" : "Job Intention"} className="sm:col-span-2">
            <TextInput
              value={data.personal.jobIntention}
              onChange={(e) => setData((d) => ({ ...d, personal: { ...d.personal, jobIntention: e.target.value } }))}
            />
          </Field>
        </div>

        {/* ID photo toggle + upload */}
        <div className="mt-4 border-t border-border pt-4">
          <label className="flex cursor-pointer items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              {lang === "zh" ? "显示证件照" : "ID Photo"}
            </span>
            <span className="relative inline-flex">
              <input
                type="checkbox"
                checked={showPhoto}
                onChange={(e) => onTogglePhoto(e.target.checked)}
                className="peer sr-only"
              />
              <span className="h-5 w-9 rounded-full bg-muted transition-colors peer-checked:bg-primary" />
              <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform peer-checked:translate-x-4" />
            </span>
          </label>

          {showPhoto && (
            <div className="mt-3 flex items-center gap-3">
              {data.personal.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.personal.photo || "/placeholder.svg"}
                  alt="证件照预览"
                  className="h-16 w-[52px] shrink-0 rounded border border-border object-cover"
                />
              ) : (
                <div className="flex h-16 w-[52px] shrink-0 items-center justify-center rounded border border-dashed border-border text-muted-foreground">
                  <ImageIcon className="h-5 w-5" />
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Upload className="h-3.5 w-3.5" />
                  上传照片
                </button>
                {data.personal.photo && (
                  <button
                    type="button"
                    onClick={() => setData((d) => ({ ...d, personal: { ...d.personal, photo: "" } }))}
                    className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    移除
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onPhotoFile(e.target.files?.[0])}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 草稿操作按钮组 */}
      <div className="flex gap-3 flex-wrap">
        <button
          type="button"
          onClick={saveDraft}
          className="px-4 py-2 rounded-md bg-primary text-white text-sm"
        >
          {lang === "zh" ? "临时保存草稿" : "Save Draft"}
        </button>
        <button
          type="button"
          onClick={loadDraft}
          className="px-4 py-2 rounded-md border border-border text-sm"
        >
          {lang === "zh" ? "加载草稿" : "Load Draft"}
        </button>
        <button
          type="button"
          onClick={clearDraft}
          className="px-4 py-2 rounded-md border border-destructive text-destructive text-sm"
        >
          {lang === "zh" ? "清除本地草稿" : "Clear Draft"}
        </button>
      </div>

      {/* Section manager */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-1 text-sm font-semibold text-foreground">
          {lang === "zh" ? "模块管理" : "Sections"}
        </h2>
        <p className="mb-4 text-xs text-muted-foreground">
          {lang === "zh" ? "拖动排序，点击眼睛图标显示 / 隐藏" : "Drag to reorder, click eye icon to show/hide"}
        </p>
        <SectionManager sections={sections} lang={lang} onReorder={onReorder} onToggle={onToggle} />
      </div>

      {/* Self Introduction */}
      <Accordion title={lang === "zh" ? "自我介绍" : "Self Introduction"} hidden={isHidden("intro")}>
        <TextArea
          value={data.intro}
          rows={5}
          placeholder={lang === "zh" ? "写下你的自我介绍..." : "Write your self introduction..."}
          onChange={(e) => setData((d) => ({ ...d, intro: e.target.value }))}
        />
      </Accordion>

      {/* Education */}
      <Accordion title={lang === "zh" ? "教育背景" : "Education"} hidden={isHidden("education")}>
        <div className="flex flex-col gap-3">
          {data.education.map((edu) => (
            <EntryCard key={edu.id} title={edu.school || (lang === "zh" ? "新增院校" : "New School")} onDelete={() => removeFrom("education", edu.id)}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label={lang === "zh" ? "学校" : "School"}>
                  <TextInput value={edu.school} onChange={(e) => patchIn("education", edu.id, { school: e.target.value })} />
                </Field>
                <Field label={lang === "zh" ? "专业" : "Major"}>
                  <TextInput value={edu.major} onChange={(e) => patchIn("education", edu.id, { major: e.target.value })} />
                </Field>
                <Field label={lang === "zh" ? "学位" : "Degree"}>
                  <TextInput value={edu.degree} onChange={(e) => patchIn("education", edu.id, { degree: e.target.value })} />
                </Field>
                <Field label="GPA">
                  <TextInput value={edu.gpa} onChange={(e) => patchIn("education", edu.id, { gpa: e.target.value })} />
                </Field>
              </div>
              <MonthRange value={edu} onChange={(v) => patchIn("education", edu.id, v)} />
              <Field label={lang === "zh" ? "主修课程" : "Major Courses"}>
                <TextArea value={edu.courses} rows={2} onChange={(e) => patchIn("education", edu.id, { courses: e.target.value })} />
              </Field>
            </EntryCard>
          ))}
          <AddButton
            label={lang === "zh" ? "添加教育经历" : "Add Education"}
            onClick={() =>
              addTo("education", {
                id: uid(),
                school: "",
                major: "",
                degree: "",
                gpa: "",
                courses: "",
                ...emptyRange,
              } as EducationItem)
            }
          />
        </div>
      </Accordion>

      {/* Work */}
      <ExperienceSection
        lang={lang}
        title={lang === "zh" ? "工作经历" : "Work Experience"}
        hidden={isHidden("work")}
        items={data.work}
        onAdd={() => addTo("work", { id: uid(), org: "", role: "", bullets: [""], ...emptyRange } as ExperienceItem)}
        onDelete={(id) => removeFrom("work", id)}
        onPatch={(id, p) => patchIn("work", id, p)}
      />

      {/* Internship */}
      <ExperienceSection
        lang={lang}
        title={lang === "zh" ? "实习经历" : "Internship Experience"}
        hidden={isHidden("internship")}
        items={data.internship}
        onAdd={() => addTo("internship", { id: uid(), org: "", role: "", bullets: [""], ...emptyRange } as ExperienceItem)}
        onDelete={(id) => removeFrom("internship", id)}
        onPatch={(id, p) => patchIn("internship", id, p)}
      />

      {/* Project */}
      <Accordion title={lang === "zh" ? "项目经历" : "Project Experience"} hidden={isHidden("project")}>
        <div className="flex flex-col gap-3">
          {data.project.map((p) => (
            <EntryCard key={p.id} title={p.name || (lang === "zh" ? "新增项目" : "New Project")} onDelete={() => removeFrom("project", p.id)}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label={lang === "zh" ? "项目名称" : "Project Name"}>
                  <TextInput value={p.name} onChange={(e) => patchIn("project", p.id, { name: e.target.value })} />
                </Field>
                <Field label={lang === "zh" ? "个人角色" : "Personal Role"}>
                  <TextInput value={p.role} onChange={(e) => patchIn("project", p.id, { role: e.target.value })} />
                </Field>
              </div>
              <MonthRange value={p} onChange={(v) => patchIn("project", p.id, v)} />
              <Field label={lang === "zh" ? "项目简介" : "Project Intro"}>
                <TextArea value={p.intro} rows={2} onChange={(e) => patchIn("project", p.id, { intro: e.target.value })} />
              </Field>
              <Field label={lang === "zh" ? "项目成果" : "Project Outcomes"}>
                <TextInput value={p.skills} onChange={(e) => patchIn("project", p.id, { skills: e.target.value })} />
              </Field>
            </EntryCard>
          ))}
          <AddButton
            label={lang === "zh" ? "添加项目经历" : "Add Project"}
            onClick={() =>
              addTo("project", { id: uid(), name: "", role: "", intro: "", skills: "", ...emptyRange } as ProjectItem)
            }
          />
        </div>
      </Accordion>

      {/* Campus */}
      <ExperienceSection
        lang={lang}
        title={lang === "zh" ? "校园经历" : "Campus Experience"}
        hidden={isHidden("campus")}
        items={data.campus}
        orgLabel={lang === "zh" ? "部门/社团名称" : "Club / Activity Name"}
        onAdd={() => addTo("campus", { id: uid(), org: "", role: "", bullets: [""], ...emptyRange } as ExperienceItem)}
        onDelete={(id) => removeFrom("campus", id)}
        onPatch={(id, p) => patchIn("campus", id, p)}
      />

      {/* Skills */}
      <Accordion title={lang === "zh" ? "专业技能" : "Professional Skills"} hidden={isHidden("skills")}>
  <div className="flex flex-col gap-3">
    {data.skills.map((sk) => (
      <EntryCard
        key={sk.id}
        title={sk.name || (lang === "zh" ? "技能/证书" : "Skill / Cert")}
        onDelete={() => removeFrom("skills", sk.id)}
      >
        <Field label={lang === "zh" ? "名称" : "Name"}>
          <TextInput
            value={sk.name}
            onChange={(e) => patchIn("skills", sk.id, { name: e.target.value })}
          />
        </Field>
        {/* 自定义描述输入框，用来写证书说明、技能详情 */}
        <Field label={lang === "zh" ? "自定义描述" : "Description"}>
          <TextArea
            rows={2}
            value={sk.desc}
            placeholder={
              lang === "zh"
                ? "填写证书等级、掌握内容、技能详情等"
                : "Fill in certificate info or skill details"
            }
            onChange={(e) => patchIn("skills", sk.id, { desc: e.target.value })}
          />
        </Field>
      </EntryCard>
    ))}
    <AddButton
      label={lang === "zh" ? "添加技能/证书" : "Add Skill / Certificate"}
      onClick={() => addTo("skills", { id: uid(), name: "", desc: "" } as SkillItem)}
    />
  </div>
</Accordion>

      {/* Awards */}
      <Accordion title={lang === "zh" ? "荣誉奖项" : "Honors & Awards"} hidden={isHidden("awards")}>
        <div className="flex flex-col gap-3">
          {data.awards.map((a) => (
            <EntryCard key={a.id} title={a.name || (lang === "zh" ? "新增奖项" : "New Award")}
              onDelete={() => removeFrom("awards", a.id)}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label={lang === "zh" ? "奖项名称" : "Award Name"}>
                  <TextInput value={a.name} onChange={(e) => patchIn("awards", a.id, { name: e.target.value })} />
                </Field>
                <Field label={lang === "zh" ? "颁发机构" : "Issuer"}>
                  <TextInput value={a.issuer} onChange={(e) => patchIn("awards", a.id, { issuer: e.target.value })} />
                </Field>
                <Field label={lang === "zh" ? "获奖时间" : "Award Date"}>
                  <input
                    type="month"
                    value={a.date}
                    onChange={(e) => patchIn("awards", a.id, { date: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                </Field>
              </div>
            </EntryCard>
          ))}
          <AddButton
            label={lang === "zh" ? "添加荣誉奖项" : "Add Award"}
            onClick={() => addTo("awards", { id: uid(), name: "", issuer: "", date: "" } as AwardItem)}
          />
        </div>
      </Accordion>

      {/* Self Evaluation */}
      <Accordion title={lang === "zh" ? "自我评价" : "Self Evaluation"} hidden={isHidden("evaluation")}>
        <TextArea
          value={data.evaluation}
          rows={5}
          placeholder={lang === "zh" ? "写下你的自我评价..." : "Write your self evaluation..."}
          onChange={(e) => setData((d) => ({ ...d, evaluation: e.target.value }))}
        />
      </Accordion>
    </div>
  )
}

function ExperienceSection({
  title,
  hidden,
  items,
  orgLabel,
  onAdd,
  onDelete,
  onPatch,
  lang,
}: {
  title: string
  hidden?: boolean
  items: ExperienceItem[]
  orgLabel?: string
  onAdd: () => void
  onDelete: (id: string) => void
  onPatch: (id: string, patch: Record<string, unknown>) => void
  lang: Lang
}) {
  const label = orgLabel ?? (lang === "zh" ? "公司" : "Company")
  return (
    <Accordion title={title} hidden={hidden}>
      <div className="flex flex-col gap-3">
        {items.map((it) => (
          <EntryCard key={it.id} title={it.org || (lang === "zh" ? "新增经历" : "New Entry")}
            onDelete={() => onDelete(it.id)}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label={label}>
                <TextInput value={it.org} onChange={(e) => onPatch(it.id, { org: e.target.value })} />
              </Field>
              <Field label={lang === "zh" ? "职位" : "Position / Role"}>
                <TextInput value={it.role} onChange={(e) => onPatch(it.id, { role: e.target.value })} />
              </Field>
            </div>
            <MonthRange value={it} onChange={(v) => onPatch(it.id, v)} />
            <Bullets bullets={it.bullets} onChange={(b) => onPatch(it.id, { bullets: b })} lang={lang} />
          </EntryCard>
        ))}
        <AddButton label={lang === "zh" ? "添加条目" : "Add Entry"} onClick={onAdd} />
      </div>
    </Accordion>
  )
}
