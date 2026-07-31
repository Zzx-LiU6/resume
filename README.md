### 📄 AI 简历生成器
---
一个支持实时预览、多主题切换的简历制作工具，可导出为 PDF。

在线地址: https://cvflow.pages.dev

## 主要功能
---
• 左侧编辑 + 右侧实时预览
• 分栏/单栏布局切换
• 5 种配色主题
• 模块拖拽排序 + 显示/隐藏
• PDF 导出
• AI 润色（支持根据岗位描述定向优化）

## 技术栈
---
### 前端（简历编辑器，Cloudflare Pages 部署）
• React 19 + TypeScript
• TanStack Start
• Tailwind CSS + shadcn/ui
• Cloudflare Pages
### AI 后端接口（独立服务，Vercel 部署）
• Next.js API Route
• 硅基流动大模型 API
• Vercel 托管部署

## 本地运行
---
```bash
npm install
npm run dev
