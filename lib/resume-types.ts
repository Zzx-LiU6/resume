export type ThemeId = "classic" | "blue" | "gray" | "dark"

export type SectionType =
  | "intro"
  | "education"
  | "internship"
  | "work"
  | "campus"
  | "project"
  | "awards"
  | "skills"
  | "evaluation"

export interface ResumeTheme {
  id: ThemeId
  /** Chinese display name for the switcher */
  name: string
  /** swatch color shown in the switcher */
  swatch: string
  /** whether the paper is dark (affects the app chrome hint only) */
  dark: boolean
  vars: {
    paper: string
    ink: string
    subtle: string
    accent: string
    line: string
    tagBg: string
    tagInk: string
  }
}

export const THEMES: ResumeTheme[] = [
  {
    id: "classic",
    name: "经典黑",
    swatch: "#111827",
    dark: false,
    vars: {
      paper: "#ffffff",
      ink: "#111827",
      subtle: "#6b7280",
      accent: "#111827",
      line: "#111827",
      tagBg: "#f3f4f6",
      tagInk: "#1f2937",
    },
  },
  {
    id: "blue",
    name: "商务蓝",
    swatch: "#1d4ed8",
    dark: false,
    vars: {
      paper: "#ffffff",
      ink: "#0f172a",
      subtle: "#64748b",
      accent: "#1d4ed8",
      line: "#1d4ed8",
      tagBg: "#eff6ff",
      tagInk: "#1e40af",
    },
  },
  {
    id: "gray",
    name: "中性灰",
    swatch: "#4b5563",
    dark: false,
    vars: {
      paper: "#ffffff",
      ink: "#374151",
      subtle: "#9ca3af",
      accent: "#4b5563",
      line: "#9ca3af",
      tagBg: "#f4f4f5",
      tagInk: "#3f3f46",
    },
  },
  {
    id: "dark",
    name: "暗夜黑",
    swatch: "#0b0f19",
    dark: true,
    vars: {
      paper: "#0f172a",
      ink: "#f8fafc",
      subtle: "#94a3b8",
      accent: "#38bdf8",
      line: "#334155",
      tagBg: "#1e293b",
      tagInk: "#e2e8f0",
    },
  },
]

export interface PersonalInfo {
  fullName: string
  gender: string
  birthDate: string
  phone: string
  email: string
  city: string
  jobIntention: string
}

export interface DateRange {
  start: string
  end: string
  untilNow: boolean
}

export interface EducationItem extends DateRange {
  id: string
  school: string
  major: string
  degree: string
  gpa: string
  courses: string
}

export interface ExperienceItem extends DateRange {
  id: string
  org: string
  role: string
  bullets: string[]
}

export interface ProjectItem extends DateRange {
  id: string
  name: string
  role: string
  intro: string
  skills: string
}

export interface AwardItem {
  id: string
  name: string
  issuer: string
  date: string
}

export type SkillLevel = "Master" | "Skilled" | "Basic"

export interface SkillItem {
  id: string
  name: string
  level: SkillLevel
}

export interface ResumeData {
  personal: PersonalInfo
  intro: string
  evaluation: string
  education: EducationItem[]
  internship: ExperienceItem[]
  work: ExperienceItem[]
  campus: ExperienceItem[]
  project: ProjectItem[]
  awards: AwardItem[]
  skills: SkillItem[]
}

export interface SectionMeta {
  type: SectionType
  /** Title rendered on the resume */
  title: string
  visible: boolean
}

export const SKILL_LEVELS: SkillLevel[] = ["Master", "Skilled", "Basic"]

export const uid = () => Math.random().toString(36).slice(2, 10)
