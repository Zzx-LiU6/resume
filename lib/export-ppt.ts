import PptxGenJS from "pptxgenjs";
import type { ResumeData, ResumeTheme } from "@/lib/resume-types";

function hexToPptx(hex: string): string {
  return hex.replace("#", "");
}

export async function exportToPPT(data: ResumeData, theme: ResumeTheme, layout: "split" | "stacked" = "split") {
  try {
    const pptx = new PptxGenJS();
    pptx.defineLayout({ name: "A4_VERTICAL", width: 21, height: 29.7 });
    pptx.layout = "A4_VERTICAL";

    const colors = {
      paper: hexToPptx(theme.vars.paper),
      ink: hexToPptx(theme.vars.ink),
      subtle: hexToPptx(theme.vars.subtle),
      accent: hexToPptx(theme.vars.accent),
      line: hexToPptx(theme.vars.line),
      tagBg: hexToPptx(theme.vars.tagBg),
      tagInk: hexToPptx(theme.vars.tagInk),
    };

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

// ============================================================
// 分栏布局（左侧侧边栏 + 右侧内容）
// ============================================================
async function generateSplitLayout(pptx: PptxGenJS, data: ResumeData, colors: any) {
  const slide = pptx.addSlide();
  slide.background = { color: colors.paper };

  const margin = 1.2;
  const pageWidth = 21;
  const pageHeight = 29.7;
  const sidebarWidth = 5.8;
  const contentX = margin + sidebarWidth + 0.6;
  const contentWidth = pageWidth - contentX - margin;

  // ---- 侧边栏背景 ----
  slide.addShape(pptx.ShapeType.rect, {
    x: margin,
    y: margin,
    w: sidebarWidth,
    h: pageHeight - margin * 2,
    fill: { color: colors.tagBg },
  });

  // ---- 侧边栏内容 ----
  let sideY = margin + 0.8;
  const p = data.personal;

  // 姓名（侧边栏居中）
  if (p.fullName) {
    slide.addText(p.fullName, {
      x: margin + 0.3,
      y: sideY,
      w: sidebarWidth - 0.6,
      h: 1.2,
      fontSize: 20,
      fontFace: "Arial",
      color: colors.ink,
      bold: true,
      align: "center",
    });
    sideY += 1.4;
  }

  // 求职意向（侧边栏居中）
  if (p.jobIntention) {
    slide.addText(p.jobIntention, {
      x: margin + 0.3,
      y: sideY,
      w: sidebarWidth - 0.6,
      h: 0.7,
      fontSize: 13,
      fontFace: "Arial",
      color: colors.accent,
      align: "center",
    });
    sideY += 0.9;
  }

  // 联系方式（侧边栏居中）
  const contactParts = [];
  if (p.phone) contactParts.push(`📞 ${p.phone}`);
  if (p.email) contactParts.push(`✉️ ${p.email}`);
  if (p.city) contactParts.push(`📍 ${p.city}`);
  if (p.gender) contactParts.push(p.gender);

  for (const part of contactParts) {
    slide.addText(part, {
      x: margin + 0.3,
      y: sideY,
      w: sidebarWidth - 0.6,
      h: 0.5,
      fontSize: 10,
      fontFace: "Arial",
      color: colors.subtle,
      align: "center",
    });
    sideY += 0.5;
  }

  // ---- 右侧内容区 ----
  let y = margin + 0.3;

  // 自我介绍
  if (data.intro?.trim()) {
    addSectionTitle(slide, "自我介绍", contentX, y, contentWidth, colors);
    y += 0.8;
    addTextBlock(slide, data.intro, contentX + 0.2, y, contentWidth - 0.4, 0.9, colors);
    y += 1.1;
  }

  // 工作经历
  if (data.work && data.work.some(j => j.org)) {
    addSectionTitle(slide, "工作经历", contentX, y, contentWidth, colors);
    y += 0.8;

    for (const job of data.work) {
      if (!job.org) continue;
      const header = `${job.org}${job.role ? " · " + job.role : ""}`;
      slide.addText(header, {
        x: contentX + 0.2,
        y: y,
        w: contentWidth - 0.4,
        h: 0.6,
        fontSize: 13,
        fontFace: "Arial",
        color: colors.ink,
        bold: true,
      });
      y += 0.6;

      const bullets = job.bullets.filter(b => b.trim());
      for (const b of bullets) {
        slide.addText(`• ${b}`, {
          x: contentX + 0.7,
          y: y,
          w: contentWidth - 1.0,
          h: 0.5,
          fontSize: 11,
          fontFace: "Arial",
          color: colors.ink,
          valign: "top",
          lineSpacing: 18,
        });
        y += 0.55;
      }
      y += 0.3;
    }
  }

  // 项目经历
  if (data.project && data.project.some(p => p.name)) {
    addSectionTitle(slide, "项目经历", contentX, y, contentWidth, colors);
    y += 0.8;

    for (const proj of data.project) {
      if (!proj.name) continue;
      const header = `${proj.name}${proj.role ? " · " + proj.role : ""}`;
      slide.addText(header, {
        x: contentX + 0.2,
        y: y,
        w: contentWidth - 0.4,
        h: 0.6,
        fontSize: 13,
        fontFace: "Arial",
        color: colors.ink,
        bold: true,
      });
      y += 0.6;

      if (proj.intro) {
        slide.addText(proj.intro, {
          x: contentX + 0.7,
          y: y,
          w: contentWidth - 1.0,
          h: 0.5,
          fontSize: 11,
          fontFace: "Arial",
          color: colors.ink,
          valign: "top",
          lineSpacing: 18,
        });
        y += 0.55;
      }
      y += 0.2;
    }
  }

  // 教育背景
  if (data.education && data.education.some(e => e.school)) {
    addSectionTitle(slide, "教育背景", contentX, y, contentWidth, colors);
    y += 0.8;

    for (const edu of data.education) {
      if (!edu.school) continue;
      const header = `${edu.school}${edu.major ? " · " + edu.major : ""}${edu.degree ? " · " + edu.degree : ""}`;
      slide.addText(header, {
        x: contentX + 0.2,
        y: y,
        w: contentWidth - 0.4,
        h: 0.6,
        fontSize: 13,
        fontFace: "Arial",
        color: colors.ink,
        bold: true,
      });
      y += 0.6;
    }
    y += 0.3;
  }

  // 专业技能
  if (data.skills && data.skills.some(s => s.name)) {
    addSectionTitle(slide, "专业技能", contentX, y, contentWidth, colors);
    y += 0.8;

    const skillNames = data.skills.map(s => s.name).filter(Boolean);
    if (skillNames.length > 0) {
      slide.addText(skillNames.join(" · "), {
        x: contentX + 0.2,
        y: y,
        w: contentWidth - 0.4,
        h: 0.6,
        fontSize: 11,
        fontFace: "Arial",
        color: colors.ink,
        valign: "top",
      });
      y += 0.8;
    }
  }

  // 自我评价
  if (data.evaluation?.trim()) {
    addSectionTitle(slide, "自我评价", contentX, y, contentWidth, colors);
    y += 0.8;
    addTextBlock(slide, data.evaluation, contentX + 0.2, y, contentWidth - 0.4, 0.9, colors);
    y += 1.0;
  }
}

// ============================================================
// 单栏布局
// ============================================================
async function generateStackedLayout(pptx: PptxGenJS, data: ResumeData, colors: any) {
  const slide = pptx.addSlide();
  slide.background = { color: colors.paper };

  const margin = 1.8;
  const pageWidth = 21;
  const pageHeight = 29.7;
  const contentWidth = pageWidth - margin * 2;

  let y = margin;
  const p = data.personal;

  // ---- 姓名 ----
  if (p.fullName) {
    slide.addText(p.fullName, {
      x: margin,
      y: y,
      w: contentWidth,
      h: 1.2,
      fontSize: 26,
      fontFace: "Arial",
      color: colors.ink,
      bold: true,
      align: "center",
    });
    y += 1.4;
  }

  // ---- 求职意向 ----
  if (p.jobIntention) {
    slide.addText(p.jobIntention, {
      x: margin,
      y: y,
      w: contentWidth,
      h: 0.7,
      fontSize: 14,
      fontFace: "Arial",
      color: colors.accent,
      align: "center",
    });
    y += 0.9;
  }

  // ---- 联系方式 ----
  const contactParts = [];
  if (p.phone) contactParts.push(`📞 ${p.phone}`);
  if (p.email) contactParts.push(`✉️ ${p.email}`);
  if (p.city) contactParts.push(`📍 ${p.city}`);
  if (p.gender) contactParts.push(p.gender);

  if (contactParts.length > 0) {
    slide.addText(contactParts.join("  ·  "), {
      x: margin,
      y: y,
      w: contentWidth,
      h: 0.6,
      fontSize: 11,
      fontFace: "Arial",
      color: colors.subtle,
      align: "center",
    });
    y += 0.8;
  }

  // ---- 分隔线 ----
  slide.addShape(pptx.ShapeType.rect, {
    x: margin + 1,
    y: y,
    w: contentWidth - 2,
    h: 0.06,
    fill: { color: colors.line },
  });
  y += 0.6;

  // ---- 自我介绍 ----
  if (data.intro?.trim()) {
    addSectionTitle(slide, "自我介绍", margin, y, contentWidth, colors);
    y += 0.8;
    addTextBlock(slide, data.intro, margin + 0.2, y, contentWidth - 0.4, 0.9, colors);
    y += 1.1;
  }

  // ---- 工作经历 ----
  if (data.work && data.work.some(j => j.org)) {
    addSectionTitle(slide, "工作经历", margin, y, contentWidth, colors);
    y += 0.8;

    for (const job of data.work) {
      if (!job.org) continue;
      const header = `${job.org}${job.role ? " · " + job.role : ""}`;
      slide.addText(header, {
        x: margin + 0.2,
        y: y,
        w: contentWidth - 0.4,
        h: 0.6,
        fontSize: 13,
        fontFace: "Arial",
        color: colors.ink,
        bold: true,
      });
      y += 0.6;

      const bullets = job.bullets.filter(b => b.trim());
      for (const b of bullets) {
        slide.addText(`• ${b}`, {
          x: margin + 0.7,
          y: y,
          w: contentWidth - 1.0,
          h: 0.5,
          fontSize: 11,
          fontFace: "Arial",
          color: colors.ink,
          valign: "top",
          lineSpacing: 18,
        });
        y += 0.55;
      }
      y += 0.3;
    }
  }

  // ---- 项目经历 ----
  if (data.project && data.project.some(p => p.name)) {
    addSectionTitle(slide, "项目经历", margin, y, contentWidth, colors);
    y += 0.8;

    for (const proj of data.project) {
      if (!proj.name) continue;
      const header = `${proj.name}${proj.role ? " · " + proj.role : ""}`;
      slide.addText(header, {
        x: margin + 0.2,
        y: y,
        w: contentWidth - 0.4,
        h: 0.6,
        fontSize: 13,
        fontFace: "Arial",
        color: colors.ink,
        bold: true,
      });
      y += 0.6;

      if (proj.intro) {
        slide.addText(proj.intro, {
          x: margin + 0.7,
          y: y,
          w: contentWidth - 1.0,
          h: 0.5,
          fontSize: 11,
          fontFace: "Arial",
          color: colors.ink,
          valign: "top",
          lineSpacing: 18,
        });
        y += 0.55;
      }
      y += 0.2;
    }
  }

  // ---- 教育背景 ----
  if (data.education && data.education.some(e => e.school)) {
    addSectionTitle(slide, "教育背景", margin, y, contentWidth, colors);
    y += 0.8;

    for (const edu of data.education) {
      if (!edu.school) continue;
      const header = `${edu.school}${edu.major ? " · " + edu.major : ""}${edu.degree ? " · " + edu.degree : ""}`;
      slide.addText(header, {
        x: margin + 0.2,
        y: y,
        w: contentWidth - 0.4,
        h: 0.6,
        fontSize: 13,
        fontFace: "Arial",
        color: colors.ink,
        bold: true,
      });
      y += 0.6;
    }
    y += 0.3;
  }

  // ---- 专业技能 ----
  if (data.skills && data.skills.some(s => s.name)) {
    addSectionTitle(slide, "专业技能", margin, y, contentWidth, colors);
    y += 0.8;

    const skillNames = data.skills.map(s => s.name).filter(Boolean);
    if (skillNames.length > 0) {
      slide.addText(skillNames.join(" · "), {
        x: margin + 0.2,
        y: y,
        w: contentWidth - 0.4,
        h: 0.6,
        fontSize: 11,
        fontFace: "Arial",
        color: colors.ink,
        valign: "top",
      });
      y += 0.8;
    }
  }

  // ---- 自我评价 ----
  if (data.evaluation?.trim()) {
    addSectionTitle(slide, "自我评价", margin, y, contentWidth, colors);
    y += 0.8;
    addTextBlock(slide, data.evaluation, margin + 0.2, y, contentWidth - 0.4, 0.9, colors);
    y += 1.0;
  }
}

// ============================================================
// 辅助函数
// ============================================================

function addSectionTitle(slide: any, title: string, x: number, y: number, width: number, colors: any) {
  slide.addText(title, {
    x: x,
    y: y,
    w: width,
    h: 0.7,
    fontSize: 15,
    fontFace: "Arial",
    color: colors.accent,
    bold: true,
  });
  slide.addShape(slide.pptx.ShapeType.rect, {
    x: x,
    y: y + 0.65,
    w: width,
    h: 0.06,
    fill: { color: colors.line },
  });
}

function addTextBlock(slide: any, text: string, x: number, y: number, width: number, height: number, colors: any) {
  slide.addText(text, {
    x: x,
    y: y,
    w: width,
    h: height,
    fontSize: 11.5,
    fontFace: "Arial",
    color: colors.ink,
    valign: "top",
    lineSpacing: 20,
  });
}
