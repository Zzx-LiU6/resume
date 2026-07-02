import type { ResumeData, SectionMeta } from "./resume-types"

export const DEFAULT_SECTIONS: SectionMeta[] = [
  { type: "intro", visible: true },
  { type: "education", visible: true },
  { type: "work", visible: true },
  { type: "internship", visible: true },
  { type: "project", visible: true },
  { type: "campus", visible: true },
  { type: "skills", visible: true },
  { type: "awards", visible: true },
  { type: "evaluation", visible: true },
]

export const MOCK_DATA: ResumeData = {
  personal: {
    fullName: "",
    gender: "",
    birthDate: "",
    phone: "+86 ",
    email: "",
    city: "",
    jobIntention: "",
    photo: "",
  },
  intro:
    "",
  evaluation:
    "",
  education: [
    {
      id: "edu1",
      school: "",
      major: "",
      degree: "",
      start: "",
      end: "",
      untilNow: false,
      gpa: "",
      courses: "",
    },
    {
      id: "edu2",
      school: "",
      major: "",
      degree: "",
      start: "",
      end: "",
      untilNow: false,
      gpa: "",
      courses: "",
    },
  ],
  work: [
    {
      id: "work1",
      org: "",
      role: "",
      start: "",
      end: "",
      untilNow: true,
      bullets: [
        "",
        "",
        "",
      ],
    },
  ],
  internship: [
    {
      id: "int1",
      org: "",
      role: "",
      start: "",
      end: "",
      untilNow: false,
      bullets: [
        "",
        "",
      ],
    },
  ],
  project: [
    {
      id: "proj1",
      name: "",
      role: "",
      start: "",
      end: "",
      untilNow: false,
      intro:
        "",
      skills: "",
    },
  ],
  campus: [
    {
      id: "camp1",
      org: "",
      role: "",
      start: "",
      end: "",
      untilNow: false,
      bullets: [
        "",
        "",
      ],
    },
  ],
  awards: [
    {
      id: "award1",
      name: "",
      issuer: "",
      date: "",
    },
    {
      id: "award2",
      name: "",
      issuer: "",
      date: "",
    },
  ],
  skills: [],
}
