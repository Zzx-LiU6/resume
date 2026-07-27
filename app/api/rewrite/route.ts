import { NextResponse } from "next/server"
import type { ResumeData } from "@/lib/resume-types"

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    // 接收完整简历对象
    const { fullResume } = (await request.json()) as { fullResume?: ResumeData }

    if (!fullResume) {
      return NextResponse.json({ success: false, error: "缺少完整简历数据" }, { status: 400 })
    }

    const apiKey = process.env.SILICONFLOW_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "服务端未配置 SILICONFLOW_API_KEY" }, { status: 500 })
    }

    const response = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "Qwen/Qwen2.5-7B-Instruct",
        temperature: 0.35,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "你是资深中文简历优化师。仅输出标准JSON，不要额外文字、markdown、注释。严禁虚构项目、数据、工作内容，仅优化原有文字措辞；保留简历全部字段、ID、条目数量不变，只优化语句，突出专业度与成果量化表达。",
          },
          {
            role: "user",
            content: `对下面整份简历所有内容统一润色：个人简介、全部工作经历、项目经历、教育、技能。返回完整和输入结构完全一致的简历JSON对象，不要包裹额外key。
简历原始数据：
${JSON.stringify(fullResume)}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`硅基流动请求失败（${response.status}）`)
    }

    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> }
    const content = payload.choices?.[0]?.message?.content
    if (!content) throw new Error("硅基流动未返回润色结果")

    // 直接解析完整简历
    const newResume = JSON.parse(content) as ResumeData

    return NextResponse.json({ success: true, result: newResume })
  } catch (error) {
    const message = error instanceof Error ? error.message : "简历润色失败"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
