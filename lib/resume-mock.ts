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
    fullName: "Alex",
    gender: "Male",
    birthDate: "1999-05",
    phone: "+86 138 0000 0000",
    email: "alex@example.com",
    city: "Shanghai",
    jobIntention: "Financial Risk Analyst",
    photo: "",
  },
  intro:
    "Insurance & Risk Management graduate with a strong quantitative foundation and hands-on experience in financial data analysis, risk modeling, and statement review. Passionate about translating complex data into actionable risk insights. Holder of Korean TOPIK II certification with the ability to work in bilingual environments.",
  evaluation:
    "Detail-oriented and analytical professional who combines rigorous risk methodology with clear communication. Comfortable owning end-to-end analysis, from data cleaning in SQL and Excel to building risk models and presenting findings to stakeholders. Reliable under deadlines and eager to grow within a data-driven finance team.",
  education: [
    {
      id: "edu1",
      school: "Fudan University",
      major: "Insurance & Risk Management",
      degree: "Master",
      start: "2022-09",
      end: "2024-06",
      untilNow: false,
      gpa: "3.8 / 4.0",
      courses: "Risk Theory, Actuarial Science, Financial Econometrics, Quantitative Risk Management",
    },
    {
      id: "edu2",
      school: "Shanghai University of Finance and Economics",
      major: "Finance",
      degree: "Bachelor",
      start: "2018-09",
      end: "2022-06",
      untilNow: false,
      gpa: "3.6 / 4.0",
      courses: "Corporate Finance, Statistics, Financial Accounting, Data Structures",
    },
  ],
  work: [
    {
      id: "work1",
      org: "Ping An Insurance",
      role: "Risk Analyst",
      start: "2024-07",
      end: "",
      untilNow: true,
      bullets: [
        "Built credit risk scoring models that reduced default misclassification by 18% across the SME portfolio.",
        "Automated weekly risk dashboards in SQL and Excel, cutting reporting time from 6 hours to 40 minutes.",
        "Partnered with underwriting to review financial statements and flag high-exposure accounts.",
      ],
    },
    {
      id: "work2",
      org: "China Life",
      role: "Junior Financial Analyst",
      start: "2023-01",
      end: "2024-06",
      untilNow: false,
      bullets: [
        "Performed financial statement analysis for 40+ corporate clients to assess solvency and liquidity.",
        "Supported quarterly risk-modeling refresh and back-testing of assumptions.",
      ],
    },
  ],
  internship: [
    {
      id: "int1",
      org: "Deloitte",
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
