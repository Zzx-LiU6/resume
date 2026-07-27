export const runtime = 'nodejs'
import { NextResponse } from "next/server"
import { MOCK_DATA } from "@/lib/resume-mock"
import type { ExperienceItem } from "@/lib/resume-types"

// Replace this mock with the current resume record when persistence is added.
const data = MOCK_DATA

type RewriteResponse = {
  work?: Array<Pick<ExperienceItem, "id" | "bullets">>
}

export async function POST(request: Request) {
  try {
    const { section } = (await request.json()) as { section?: string }

    if (section !== "work") {
      return NextResponse.json({ success: false, error: "仅支持润色工作经历" }, { status: 400 })
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
              "你是资深中文简历顾问。只返回合法 JSON，不要 markdown。不得虚构不存在的数字、成果或职责；只有原文提供明确数据时才保留或强化数据表达。",
          },
          {
            role: "user",
            content: `请润色以下工作经历的 bullets，使表述更专业、行动导向且尽量体现已有的数据、范围或影响。保留每个条目的 id 和 bullets 数量。返回格式：{\"work\":[{\"id\":\"...\",\"bullets\":[\"...\"]}]}。\n\n${JSON.stringify(data.work)}`,
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

    const rewritten = JSON.parse(content) as RewriteResponse
    if (!Array.isArray(rewritten.work) || rewritten.work.length !== data.work.length) {
      throw new Error("润色结果格式不正确")
    }

    const result = data.work.map((item, index) => ({
      ...item,
      bullets: Array.isArray(rewritten.work?.[index]?.bullets)
        ? rewritten.work[index].bullets.filter((bullet): bullet is string => typeof bullet === "string")
        : item.bullets,
    }))

    return NextResponse.json({ success: true, result })
  } catch (error) {
    const message = error instanceof Error ? error.message : "工作经历润色失败"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
