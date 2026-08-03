# 📄 AI 简历生成器

一个支持实时预览、多主题切换的简历制作工具，可导出为 PDF 和 PPTX。

在线地址: [https://cvflow.pages.dev](https://cvflow.pages.dev)

## ✨ 主要功能

### 📝 实时编辑与预览
- 左侧编辑区输入内容，右侧实时预览简历效果
- 支持分栏/单栏布局切换
- 所见即所得的编辑体验

### 🎨 多主题与样式
- 5 种配色主题，一键切换
- 模块拖拽排序，自由调整简历结构
- 每个模块支持独立的显示/隐藏控制

### 📤 多格式导出
- **PDF 导出**：一键导出高清 PDF 简历
- **PPTX 导出**：支持导出为 PowerPoint 格式（基于 `pptxgenjs`）

### 🤖 AI 润色
- 根据目标岗位描述，AI 自动优化简历内容
- 支持定向润色，精准匹配职位要求
- 后端基于硅基流动大模型 API

### ⚡ 技术亮点
- **零依赖后端渲染**：所有简历生成在浏览器端完成，无需服务器渲染
- **实时预览**：编辑内容即时反映在预览区
- **数据持久化**：编辑内容自动保存在浏览器本地

## 🛠 技术栈

### 前端（简历编辑器）
- **Next.js 16** — React 全栈框架
- **React 19** + **TypeScript** — 类型安全的组件开发
- **Tailwind CSS 4** + **shadcn/ui** — 样式与组件库
- **pptxgenjs** — PPTX 导出
- **html-to-pptx** — HTML 转 PPTX
- **Cloudflare Pages** — 部署托管

### AI 后端接口（独立服务）
- **Next.js API Route** — API 接口
- **硅基流动大模型 API** — AI 润色服务
- **Vercel** — 部署托管

## 📁 项目结构

```
/
├── app/
│   ├── api/rewrite/          # AI 润色 API 路由
│   ├── globals.css           # 全局样式
│   ├── layout.tsx            # 根布局
│   └── page.tsx              # 主页面
├── components/               # UI 组件
├── lib/                      # 工具函数
├── public/                   # 静态资源
├── .env                      # 环境变量
├── package.json
└── tsconfig.json
```

## 🚀 本地运行

```bash
# 克隆项目
git clone https://github.com/Zzx-LiU6/resume.git
cd resume

# 安装依赖
npm install

# 配置环境变量
# 复制 .env.example 为 .env.local，填入你的 API 密钥
cp .env.example .env.local

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 🔧 环境变量

| 变量名 | 说明 |
|:---|:---|
| `DEEPSEEK_API_KEY` | 硅基流动 API 密钥（用于 AI 润色） |

## 📦 依赖说明

| 依赖 | 用途 |
|:---|:---|
| `next` | React 全栈框架 |
| `react` + `react-dom` | UI 渲染 |
| `tailwindcss` + `shadcn/ui` | 样式与组件 |
| `pptxgenjs` | PPTX 导出 |
| `html-to-pptx` | HTML 转 PPTX |
| `@vercel/analytics` | 访问统计 |

## 📄 License

MIT

- [六爻铜钱起卦工具](https://github.com/Zzx-LiU6/liuyao) — 铜钱摇卦，自动演算
- [大六壬排盘工具](https://github.com/Zzx-LiU6/daliuren) — 天地盘、四课、三传
- [个人作品集](https://github.com/Zzx-LiU6/Zzx-LiU6) — 所有项目汇总
