import PptxGenJS from "pptxgenjs";
import type { ResumeData, ResumeTheme } from "@/lib/resume-types";

function mapThemeToPPT(theme: ResumeTheme) {
  return {
    paper: theme.vars.paper.replace("#", ""),
    ink: theme.vars.ink.replace("#", ""),
    subtle: theme.vars.subtle.replace("#", ""),
    accent: theme.vars.accent.replace("#", ""),
    line: theme.vars.line.replace("#", ""),
    tagBg: theme.vars.tagBg.replace("#", ""),
    tagInk: theme.vars.tagInk.replace("#", ""),
  };
}

export async function exportToPPT(
  data: ResumeData,
  theme: ResumeTheme,
  layout: "split" | "stacked" = "split"
) {
  try {
    const pptx = new PptxGenJS();
    pptx.defineLayout({ name: "A4_VERTICAL", width: 21, height: 29.7 });
    pptx.layout = "A4_VERTICAL";

    const colors = mapThemeToPPT(theme);

    if (layout === "split") {
      await generateSplitLayout(pptx, data, colors);
    } else {
      await generateStackedLayout(pptx, data, colors);
    }

    await pptx.writeFile({ fileName: "我的简历.pptx" });
  } catch (error) {
    console.error("导出 PPT 失败:", error);
    alert("导出 PPT 失败，请重试。");
  }
}

// ============ 分栏布局 ============
async function generateSplitLayout(pptx: PptxGenJS, data: ResumeData, colors: any) {
  const slide = pptx.addSlide();
  slide.background = { color: colors.paper };

  const margin = 1.2;
  const pageW = 21;
  const pageH = 29.7;
  const sidebarW = 5.8;
  const contentX = margin + sidebarW + 0.8;
  const contentW = pageW - contentX - margin;

  // ---- 侧边栏背景 ----
  slide.addShape(pptx.ShapeType.rect, {
    x: margin,
    y: margin,
    w: sidebarW,
    h: pageH - margin * 2,
    fill: { color: colors.tagBg },
  });

  // ---- 侧边栏内容 ----
  let sy = margin + 1.0;
  const p = data.personal;

  if (p.fullName) {
    slide.addText(p.fullName, {
      x: margin + 0.2,
      y: sy,
      w: sidebarW - 0.4,
      h: 1.2,
      fontSize: 20,
      fontFace: "Arial",
      color: colors.ink,
      bold: true,
      align: "center",
    });
    sy += 1.4;
  }

  if (p.jobIntention) {
    slide.addText(p.jobIntention, {
      x: margin + 0.2,
      y: sy,
      w: sidebarW - 0.4,
      h: 0.7,
      fontSize: 13,
      fontFace: "Arial",
      color: colors.accent,
      align: "center",
    });
    sy += 0.9;
  }

  const contacts = [];
  if (p.phone) contacts.push(`📱 ${p.phone}`);
  if (p.email) contacts.push(`✉️ ${p.email}`);
  if (p.city) contacts.push(`📍 ${p.city}`);
  if (p.gender) contacts.push(p.gender);

  for (const c of contacts) {
    slide.addText(c, {
      x: margin + 0.2,
      y: sy,
      w: sidebarW - 0.4,
      h: 0.5,
      fontSize: 10,
      fontFace: "Arial",
      color: colors.subtle,
      align: "center",
    });
    sy += 0.55;
  }

  // ---- 右侧内容区 ----
  let cy = margin + 0.5;

  // 右侧标题（姓名再次出现，作为主标题）
  if (p.fullName) {
    slide.addText(p.fullName, {
      x: contentX,
      y: cy,
      w: contentW,
      h: 0.9,
      fontSize: 24,
      fontFace: "Arial",
      color: colors.ink,
      bold: true,
    });
    cy += 1.1;
  }

  if (p.jobIntention) {
    slide.addText(p.jobIntention, {
      x: contentX,
      y: cy,
      w: contentW,
      h: 0.6,
      fontSize: 14,
      fontFace: "Arial",
      color: colors.accent,
    });
    cy += 0.8;
  }

  // 分隔线
  slide.addShape(pptx.ShapeType.rect, {
    x: contentX,
    y: cy,
    w: contentW,
    h: 0.06,
    fill: { color: colors.line },
  });
  cy += 0.5;

  // ---- 渲染内容模块 ----
  cy = await renderModules(slide, data, contentX, cy, contentW, colors);
}

// ============ 单栏布局 ============
async function generateStackedLayout(pptx: PptxGenJS, data: ResumeData, colors: any) {
  const slide = pptx.addSlide();
  slide.background = { color: colors.paper };

  const margin = 1.5;
  const pageW = 21;
  const contentW = pageW - margin * 2;
  let y = margin;

  const p = data.personal;

  // 姓名
  if (p.fullName) {
    slide.addText(p.fullName, {
      x: margin,
      y: y,
      w: contentW,
      h: 1.0,
      fontSize: 26,
      fontFace: "Arial",
      color: colors.ink,
      bold: true,
      align: "center",
    });
    y += 1.2;
  }

  if (p.jobIntention) {
    slide.addText(p.jobIntention, {
      x: margin,
      y: y,
      w: contentW,
      h: 0.6,
      fontSize: 14,
      fontFace: "Arial",
      color: colors.accent,
      align: "center",
    });
    y += 0.8;
  }

  const contacts = [];
  if (p.phone) contacts.push(`📱 ${p.phone}`);
  if (p.email) contacts.push(`✉️ ${p.email}`);
  if (p.city) contacts.push(`📍 ${p.city}`);

  if (contacts.length > 0) {
    slide.addText(contacts.join("  ·  "), {
      x: margin,
      y: y,
      w: contentW,
      h: 0.5,
      fontSize: 11,
      fontFace: "Arial",
      color: colors.subtle,
      align: "center",
    });
    y += 0.7;
  }

  // 分隔线
  slide.addShape(pptx.ShapeType.rect, {
    x: margin + 1,
    y: y,
    w: contentW - 2,
    h: 0.06,
    fill: { color: colors.line },
  });
  y += 0.6;

  await renderModules(slide, data, margin, y, contentW, colors);
}

// ============ 通用模块渲染 ============
async function renderModules(
  slide: any,
  data: ResumeData,
  x: number,
  y: number,
  w: number,
  colors: any
): Promise<number> {
  let cy = y;

  // 模块标题 + 横线
  function addSection(title: string) {
    slide.addText(title, {
      x: x,
      y: cy,
      w: w,
      h: 0.7,
      fontSize: 16,
      fontFace: "Arial",
      color: colors.accent,
      bold: true,
    });
    cy += 0.7;
    // 横线
    slide.addShape(pptx.ShapeType.rect, {
      x: x,
      y: cy,
      w: w * 0.3,
      h: 0.05,
      fill: { color: colors.accent },
    });
    cy += 0.4;
  }

  // ---- 自我介绍 ----
  if (data.intro?.trim()) {
    addSection("自我介绍");
    slide.addText(data.intro, {
      x: x + 0.2,
      y: cy,
      w: w - 0.2,
      h: 0.8,
      fontSize: 12,
      fontFace: "Arial",
      color: colors.ink,
      valign: "top",
    });
    cy += 1.0;
  }

  // ---- 工作经历 ----
  if (data.work?.some(j => j.org)) {
    addSection("工作经历");
    for (const job of data.work) {
      if (!job.org) continue;
      const header = `${job.org}${job.role ? " · " + job.role : ""}`;
      slide.addText(header, {
        x: x + 0.2,
        y: cy,
        w: w - 0.2,
        h: 0.6,
        fontSize: 14,
        fontFace: "Arial",
        color: colors.ink,
        bold: true,
      });
      cy += 0.6;

      const bullets = job.bullets.filter(b => b.trim());
      for (const b of bullets) {
        slide.addText(`• ${b}`, {
          x: x + 0.6,
          y: cy,
          w: w - 0.6,
          h: 0.5,
          fontSize: 11.5,
          fontFace: "Arial",
          color: colors.ink,
          valign: "top",
        });
        cy += 0.55;
      }
      cy += 0.2;
    }
  }

  // ---- 项目经历 ----
  if (data.project?.some(p => p.name)) {
    addSection("项目经历");
    for (const proj of data.project) {
      if (!proj.name) continue;
      const header = `${proj.name}${proj.role ? " · " + proj.role : ""}`;
      slide.addText(header, {
        x: x + 0.2,
        y: cy,
        w: w - 0.2,
        h: 0.6,
        fontSize: 14,
        fontFace: "Arial",
        color: colors.ink,
        bold: true,
      });
      cy += 0.6;

      if (proj.intro) {
        slide.addText(proj.intro, {
          x: x + 0.6,
          y: cy,
          w: w - 0.6,
          h: 0.5,
          fontSize: 11.5,
          fontFace: "Arial",
          color: colors.ink,
        });
        cy += 0.55;
      }
      cy += 0.2;
    }
  }

  // ---- 教育背景 ----
  if (data.education?.some(e => e.school)) {
    addSection("教育背景");
    for (const edu of data.education) {
      if (!edu.school) continue;
      const header = `${edu.school}${edu.major ? " · " + edu.major : ""}${edu.degree ? " · " + edu.degree : ""}`;
      slide.addText(header, {
        x: x + 0.2,
        y: cy,
        w: w - 0.2,
        h: 0.6,
        fontSize: 14,
        fontFace: "Arial",
        color: colors.ink,
        bold: true,
      });
      cy += 0.6;
    }
    cy += 0.2;
  }

  // ---- 专业技能 ----
  if (data.skills?.some(s => s.name)) {
    addSection("专业技能");
    const names = data.skills.map(s => s.name).filter(Boolean);
    if (names.length > 0) {
      slide.addText(names.join("  ·  "), {
        x: x + 0.2,
        y: cy,
        w: w - 0.2,
        h: 0.6,
        fontSize: 12,
        fontFace: "Arial",
        color: colors.ink,
      });
      cy += 0.8;
    }
  }

  // ---- 自我评价 ----
  if (data.evaluation?.trim()) {
    addSection("自我评价");
    slide.addText(data.evaluation, {
      x: x + 0.2,
      y: cy,
      w: w - 0.2,
      h: 0.8,
      fontSize: 12,
      fontFace: "Arial",
      color: colors.ink,
      valign: "top",
    });
    cy += 1.0;
  }

  return cy;
}
