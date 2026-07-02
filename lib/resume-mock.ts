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
    fullName: "小明",
    gender: "女",
    birthDate: "2000-01",
    phone: "+86 138 0000 0000",
    email: "1380000000@qq.com",
    city: "北京",
    jobIntention: "风控",
    photo: "",
  },
  intro:
    "金融学专业毕业生，拥有扎实的数理与金融理论基础，具备金融数据处理、量化分析、财务报表分析相关实操经验。擅长从海量业务数据中梳理清晰的投资与经营分析结论，持有雅思 6.5 证书，可流畅完成全英文办公沟通。",
  evaluation:
    "做事细致、逻辑分析能力突出，能以严谨的量化分析思路输出清晰易懂的业务结论。可独立完成全流程数据分析工作，涵盖 Excel 数据清洗、SQL 数据提取、量化模型搭建，并向业务负责人汇报分析成果。能够高效应对多任务截止节点，希望加入数据驱动型金融团队持续成长。",
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
