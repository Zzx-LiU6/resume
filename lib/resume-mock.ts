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
      school: "北京大学",
      major: "金融学",
      degree: "硕士",
      start: "2022-09",
      end: "2024-06",
      untilNow: false,
      gpa: "3.8 / 4.0",
      courses: "金融计量学、量化投资、公司金融、数理统计",
    },
    {
      id: "edu2",
      school: "清华大学",
      major: "金融学",
      degree: "学士",
      start: "2018-09",
      end: "2022-06",
      untilNow: false,
      gpa: "3.6 / 5.0",
      courses: "金融学、统计学、财务会计、数据结构",
    },
  ],
  work: [
    {
      id: "work1",
      org: "平安证券",
      role: "金融分析专员",
      start: "2024-07",
      end: "",
      untilNow: true,
      bullets: [
        "搭建企业信用量化评估模型，将中小企业客户违约误判率降低18%。",
        "使用SQL与Excel自动化每周经营数据看板，报表制作时长由6小时缩短至40分钟。",
        "协同业务部门完成企业财务报表核查，识别高风险授信客户。",
      ],
    },
    {
      id: "work2",
      org: "中信证券",
      role: "初级金融分析师",
      start: "2023-01",
      end: "2024-06",
      untilNow: false,
      bullets: [
        "完成40余家企业客户财务报表分析，评估企业偿债与流动性水平。",
        "参与季度量化模型迭代，完成模型假设回测与效果验证工作。",
      ],
    },
  ],
  internship: [
    {
      id: "int1",
      org: "德勤咨询"",
      role: "Risk Advisory Intern",
      start: "2021-06",
      end: "2021-09",
      untilNow: false,
      bullets: [
        "Assisted in operational risk assessments for two banking clients.",
        "Cleaned and consolidated datasets of 100k+ records for the modeling team.",
      ],
    },
  ],
  project: [
    {
      id: "proj1",
      name: "SME Default Prediction Model",
      role: "Lead Analyst",
      start: "2023-03",
      end: "2023-08",
      untilNow: false,
      intro:
        "Developed a logistic-regression and gradient-boosting pipeline to predict small-business loan defaults using historical financial ratios.",
      skills: "Python, SQL, Risk Modeling, Logistic Regression",
    },
    {
      id: "proj2",
      name: "Bilingual Insurance Market Report",
      role: "Author",
      start: "2022-10",
      end: "2022-12",
      untilNow: false,
      intro:
        "Authored a Korean-Chinese comparative report on personal insurance products, leveraging TOPIK II language skills.",
      skills: "Data Analysis, Excel, Financial Statement Analysis, Korean",
    },
  ],
  campus: [
    {
      id: "camp1",
      org: "Finance & Investment Club",
      role: "Vice President",
      start: "2019-09",
      end: "2021-06",
      untilNow: false,
      bullets: [
        "Led a 30-member team organizing the annual campus investment competition with 200+ participants.",
        "Hosted 5 workshops on financial modeling and risk fundamentals.",
      ],
    },
  ],
  awards: [
    {
      id: "award1",
      name: "National Scholarship",
      issuer: "Ministry of Education",
      date: "2020-11",
    },
    {
      id: "award2",
      name: "Korean TOPIK II Certification",
      issuer: "NIIED",
      date: "2021-04",
    },
  ],
  skills: [
    { id: "sk1", name: "Data Analysis", level: "Master" },
    { id: "sk2", name: "SQL", level: "Skilled" },
    { id: "sk3", name: "Excel", level: "Master" },
    { id: "sk4", name: "Risk Modeling", level: "Skilled" },
    { id: "sk5", name: "Financial Statement Analysis", level: "Skilled" },
    { id: "sk6", name: "Korean TOPIK II", level: "Basic" },
  ],
}
