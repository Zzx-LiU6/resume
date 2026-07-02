export type ThemeId =
  | "classic"
  | "blue"
  | "gray"
  | "dark"
  | "mint"
  | "coffee"
  | "sky"
  | "minimal"

export type Lang = "zh" | "en"

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
  {
    id: "mint",
    name: "薄荷绿",
    swatch: "#0d9488",
    dark: false,
    vars: {
      paper: "#ffffff",
      ink: "#134e4a",
      subtle: "#5f8b86",
      accent: "#0d9488",
      line: "#0d9488",
      tagBg: "#ecfdf5",
      tagInk: "#0f766e",
    },
  },
  {
    id: "coffee",
    name: "咖啡棕",
    swatch: "#7c5230",
    dark: false,
    vars: {
      paper: "#faf6f1",
      ink: "#3f2d1e",
      subtle: "#8a7360",
      accent: "#7c5230",
      line: "#c8a888",
      tagBg: "#f1e7db",
      tagInk: "#5b3d24",
    },
  },
  {
    id: "sky",
    name: "天空蓝",
    swatch: "#0284c7",
    dark: false,
    vars: {
      paper: "#f8fbfe",
      ink: "#0c344b",
      subtle: "#5b7d92",
      accent: "#0284c7",
      line: "#7dd3fc",
      tagBg: "#e0f2fe",
      tagInk: "#075985",
    },
  },
  {
    id: "minimal",
    name: "极简白",
    swatch: "#e5e7eb",
    dark: false,
    vars: {
      paper: "#ffffff",
      ink: "#1f2937",
      subtle: "#9ca3af",
      accent: "#374151",
      line: "#e5e7eb",
      tagBg: "#f9fafb",
      tagInk: "#4b5563",
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
  /** Data URL of the uploaded ID photo (optional) */
  photo: string
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

export interface SkillItem {
  id: string
  name: string
  desc: string
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
  visible: boolean
}

export const SKILL_LEVELS: SkillLevel[] = ["Master", "Skilled", "Basic"]

/** Bilingual section titles rendered on the resume. */
export const SECTION_TITLES: Record<SectionType, { zh: string; en: string }> = {
  intro: { zh: "自我介绍", en: "Self Introduction" },
  education: { zh: "教育背景", en: "Education" },
  internship: { zh: "实习经历", en: "Internship Experience" },
  work: { zh: "工作经历", en: "Work Experience" },
  campus: { zh: "校园经历", en: "Campus Experience" },
  project: { zh: "项目经历", en: "Project Experience" },
  awards: { zh: "荣誉奖项", en: "Honors & Awards" },
  skills: { zh: "专业技能", en: "Professional Skills" },
  evaluation: { zh: "自我评价", en: "Self Evaluation" },
}

/** Bilingual inline labels used inside the resume body. */
export const RESUME_LABELS = {
  present: { zh: "至今", en: "Present" },
  gpa: { zh: "绩点", en: "GPA" },
  courses: { zh: "主修课程", en: "Courses" },
  skills: { zh: "相关技能", en: "Skills" },
  levels: {
    Master: { zh: "精通", en: "Master" },
    Skilled: { zh: "熟练", en: "Skilled" },
    Basic: { zh: "了解", en: "Basic" },
  } as Record<SkillLevel, { zh: string; en: string }>,
}

export const sectionTitle = (t: SectionType, lang: Lang) => SECTION_TITLES[t][lang]

export const uid = () => Math.random().toString(36).slice(2, 10)
