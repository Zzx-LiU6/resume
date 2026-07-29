import { z } from 'zod'

// 定义简历数据的 Zod Schema（和你的 ResumeData 类型保持一致）
const PersonalSchema = z.object({
  fullName: z.string().optional(),
  gender: z.string().optional(),
  birthDate: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  city: z.string().optional(),
  jobIntention: z.string().optional(),
  photo: z.string().optional(),
})

const DateRangeSchema = z.object({
  start: z.string().optional(),
  end: z.string().optional(),
  untilNow: z.boolean().optional(),
})

const ExperienceItemSchema = z.object({
  id: z.string(),
  org: z.string().optional(),
  role: z.string().optional(),
  bullets: z.array(z.string()),
}).merge(DateRangeSchema)

const EducationItemSchema = z.object({
  id: z.string(),
  school: z.string().optional(),
  major: z.string().optional(),
  degree: z.string().optional(),
  gpa: z.string().optional(),
  courses: z.string().optional(),
}).merge(DateRangeSchema)

// 完整的 ResumeData Schema
export const ResumeSchema = z.object({
  personal: PersonalSchema.optional(),
  intro: z.string().optional(),
  education: z.array(EducationItemSchema).optional(),
  work: z.array(ExperienceItemSchema).optional(),
  internship: z.array(ExperienceItemSchema).optional(),
  project: z.array(z.object({
    id: z.string(),
    name: z.string().optional(),
    role: z.string().optional(),
    intro: z.string().optional(),
    skills: z.string().optional(),
  }).merge(DateRangeSchema)).optional(),
  campus: z.array(ExperienceItemSchema).optional(),
  skills: z.array(z.object({
    id: z.string(),
    name: z.string().optional(),
    desc: z.string().optional(),
  })).optional(),
  awards: z.array(z.object({
    id: z.string(),
    name: z.string().optional(),
    issuer: z.string().optional(),
    date: z.string().optional(),
  })).optional(),
  evaluation: z.string().optional(),
})

export type ResumeData = z.infer<typeof ResumeSchema>
