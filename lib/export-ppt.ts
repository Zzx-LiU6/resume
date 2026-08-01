import PptxGenJS from "pptxgenjs";
import type { ResumeData, ResumeTheme } from "@/lib/resume-types";

// 将你的主题颜色映射到 PPT 可用的颜色格式
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

    // 根据布局选择不同的排版策略
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

// 分栏布局
async function generateSplitLayout(pptx: PptxGenJS, data: ResumeData, colors: any) {
  const slide = pptx.addSlide();
  slide.background = { color: colors.paper };

  const margin = 1.2;
  const pageWidth = 21;
  const pageHeight = 29.7;
  const sidebarWidth = 5.8;
  const contentWidth = pageWidth - sidebarWidth - margin * 2;

  let currentY = margin + 0.5;

  // ---- 侧边栏（左栏）- 深色背景 ----
  const p = data.personal;

  // 侧边栏背景（模拟 split 布局的左侧深色区域）
  slide.addShape(pptx.ShapeType.rect, {
    x: margin,
    y: margin,
    w: sidebarWidth,
    h: pageHeight - margin * 2,
    fill: { color: colors.tagBg },
    rectRadius: 0,
  });

  // 侧边栏内容
  let sidebarY = margin + 0.8;

  // 姓名（在侧边栏中居中）
  if (p.fullName) {
    slide.addText(p.fullName, {
      x: margin + 0.3,
      y: sidebarY,
      w: sidebarWidth - 0.6,
      h: 1.0,
      fontSize: 18,
      fontFace: "Arial",
      color: colors.ink,
      bold: true,
      align: "center",
    });
    sidebarY += 1.2;
  }

  // 求职意向（在侧边栏中）
  if (p.jobIntention) {
    slide.addText(p.jobIntention, {
      x: margin + 0.3,
      y: sidebarY,
      w: sidebarWidth - 0.6,
      h: 0.6,
      fontSize: 11,
      fontFace: "Arial",
      color: colors.accent,
      align: "center",
    });
    sidebarY += 0.8;
  }

  // 联系方式（在侧边栏中）
  const contactParts = [];
  if (p.phone) contactParts.push(`📱 ${p.phone}`);
  if (p.email) contactParts.push(`✉️ ${p.email}`);
  if (p.city) contactParts.push(`📍 ${p.city}`);
  if (p.gender) contactParts.push(p.gender);

  if (contactParts.length > 0) {
    for (const part of contactParts) {
      slide.addText(part, {
        x: margin + 0.3,
        y: sidebarY,
        w: sidebarWidth - 0.6,
        h: 0.4,
        fontSize: 9,
        fontFace: "Arial",
        color: colors.subtle,
        align: "center",
      });
      sidebarY += 0.45;
    }
    sidebarY += 0.3;
  }

  // ---- 右侧内容区 ----
  let rightY = margin + 0.5;
  const rightX = margin + sidebarWidth + 0.6;
  const rightW = contentWidth - 0.6;

  // 右侧内容逐项渲染（工作经历、项目等）
  // 这里复用之前 generateSlides 中的内容逻辑
  await renderContentArea(slide, data, rightX, rightY, rightW, colors);
}

// 单栏布局
async function generateStackedLayout(pptx: PptxGenJS, data: ResumeData, colors: any) {
  const slide = pptx.addSlide();
  slide.background = { color: colors.paper };

  const margin = 1.5;
  const pageWidth = 21;
  const pageHeight = 29.7;
  const contentWidth = pageWidth - margin * 2;

  let currentY = margin;

  // ---- 顶部个人信息区 ----
  const p = data.personal;

  // 姓名
  if (p.fullName) {
    slide.addText(p.fullName, {
      x: margin,
      y: currentY,
      w: contentWidth,
      h: 0.8,
      fontSize: 22,
      fontFace: "Arial",
      color: colors.ink,
      bold: true,
      align: "center",
    });
    currentY += 1.0;
  }

  // 求职意向
  if (p.jobIntention) {
    slide.addText(p.jobIntention, {
      x: margin,
      y: currentY,
      w: contentWidth,
      h: 0.6,
      fontSize: 12,
      fontFace: "Arial",
      color: colors.accent,
      align: "center",
    });
    currentY += 0.8;
  }

  // 联系方式
  const contactParts = [];
  if (p.phone) contactParts.push(`📱 ${p.phone}`);
  if (p.email) contactParts.push(`✉️ ${p.email}`);
  if (p.city) contactParts.push(`📍 ${p.city}`);

  if (contactParts.length > 0) {
    slide.addText(contactParts.join("  ·  "), {
      x: margin,
      y: currentY,
      w: contentWidth,
      h: 0.5,
      fontSize: 10,
      fontFace: "Arial",
      color: colors.subtle,
      align: "center",
    });
    currentY += 0.8;
  }

  // 分隔线
  slide.addShape(pptx.ShapeType.rect, {
    x: margin + 2,
    y: currentY,
    w: contentWidth - 4,
    h: 0.05,
    fill: { color: colors.line },
  });
  currentY += 0.6;

  // ---- 内容区域 ----
  await renderContentArea(slide, data, margin, currentY, contentWidth, colors);
}

// 内容区域渲染（工作经历、项目、教育等）
async function renderContentArea(
  slide: any,
  data: ResumeData,
  x: number,
  y: number,
  width: number,
  colors: any
) {
  let currentY = y;

  // ---- 自我介绍 ----
  if (data.intro?.trim()) {
    slide.addText("自我介绍", {
      x: x,
      y: currentY,
      w: width,
      h: 0.6,
      fontSize: 13,
      fontFace: "Arial",
      color: colors.accent,
      bold: true,
    });
    currentY += 0.6;

    slide.addText(data.intro, {
      x: x + 0.2,
      y: currentY,
      w: width - 0.2,
      h: 0.7,
      fontSize: 10,
      fontFace: "Arial",
      color: colors.ink,
      valign: "top",
    });
    currentY += 0.9;
  }

  // ---- 工作经历 ----
  if (data.work && data.work.length > 0) {
    const hasContent = data.work.some(job => job.org || job.bullets.some(b => b.trim()));
    if (hasContent) {
      slide.addText("工作经历", {
        x: x,
        y: currentY,
        w: width,
        h: 0.6,
        fontSize: 13,
        fontFace: "Arial",
        color: colors.accent,
        bold: true,
      });
      currentY += 0.6;

      for (const job of data.work) {
        if (!job.org) continue;
        // 公司 + 职位（加粗）
        const header = `${job.org}${job.role ? " · " + job.role : ""}`;
        slide.addText(header, {
          x: x + 0.2,
          y: currentY,
          w: width - 0.2,
          h: 0.5,
          fontSize: 11,
          fontFace: "Arial",
          color: colors.ink,
          bold: true,
        });
        currentY += 0.5;

        const validBullets = job.bullets.filter(b => b.trim());
        for (const bullet of validBullets) {
          slide.addText(`• ${bullet}`, {
            x: x + 0.6,
            y: currentY,
            w: width - 0.6,
            h: 0.45,
            fontSize: 9.5,
            fontFace: "Arial",
            color: colors.ink,
            valign: "top",
          });
          currentY += 0.5;
        }
        currentY += 0.2;
      }
    }
  }

  // ---- 项目经历 ----
  if (data.project && data.project.length > 0) {
    const hasContent = data.project.some(p => p.name);
    if (hasContent) {
      slide.addText("项目经历", {
        x: x,
        y: currentY,
        w: width,
        h: 0.6,
        fontSize: 13,
        fontFace: "Arial",
        color: colors.accent,
        bold: true,
      });
      currentY += 0.6;

      for (const proj of data.project) {
        if (!proj.name) continue;
        const header = `${proj.name}${proj.role ? " · " + proj.role : ""}`;
        slide.addText(header, {
          x: x + 0.2,
          y: currentY,
          w: width - 0.2,
          h: 0.5,
          fontSize: 11,
          fontFace: "Arial",
          color: colors.ink,
          bold: true,
        });
        currentY += 0.5;

        if (proj.intro) {
          slide.addText(proj.intro, {
            x: x + 0.6,
            y: currentY,
            w: width - 0.6,
            h: 0.45,
            fontSize: 9.5,
            fontFace: "Arial",
            color: colors.ink,
          });
          currentY += 0.5;
        }
        currentY += 0.2;
      }
    }
  }

  // ---- 教育背景 ----
  if (data.education && data.education.length > 0) {
    const hasContent = data.education.some(e => e.school);
    if (hasContent) {
      slide.addText("教育背景", {
        x: x,
        y: currentY,
        w: width,
        h: 0.6,
        fontSize: 13,
        fontFace: "Arial",
        color: colors.accent,
        bold: true,
      });
      currentY += 0.6;

      for (const edu of data.education) {
        if (!edu.school) continue;
        const header = `${edu.school}${edu.major ? " · " + edu.major : ""}${edu.degree ? " · " + edu.degree : ""}`;
        slide.addText(header, {
          x: x + 0.2,
          y: currentY,
          w: width - 0.2,
          h: 0.5,
          fontSize: 11,
          fontFace: "Arial",
          color: colors.ink,
          bold: true,
        });
        currentY += 0.5;
      }
      currentY += 0.3;
    }
  }

  // ---- 专业技能 ----
  if (data.skills && data.skills.length > 0) {
    const validSkills = data.skills.filter(s => s.name);
    if (validSkills.length > 0) {
      slide.addText("专业技能", {
        x: x,
        y: currentY,
        w: width,
        h: 0.6,
        fontSize: 13,
        fontFace: "Arial",
        color: colors.accent,
        bold: true,
      });
      currentY += 0.6;

      const skillNames = validSkills.map(s => s.name).filter(Boolean);
      if (skillNames.length > 0) {
        // 用标签样式展示（浅色背景）
        const skillText = skillNames.join("  ");
        slide.addText(skillText, {
          x: x + 0.2,
          y: currentY,
          w: width - 0.2,
          h: 0.5,
          fontSize: 10,
          fontFace: "Arial",
          color: colors.tagInk,
          fill: { color: colors.tagBg },
          align: "center",
          valign: "middle",
        });
        currentY += 0.7;
      }
    }
  }

  // ---- 自我评价 ----
  if (data.evaluation?.trim()) {
    slide.addText("自我评价", {
      x: x,
      y: currentY,
      w: width,
      h: 0.6,
      fontSize: 13,
      fontFace: "Arial",
      color: colors.accent,
      bold: true,
    });
    currentY += 0.6;

    slide.addText(data.evaluation, {
      x: x + 0.2,
      y: currentY,
      w: width - 0.2,
      h: 0.7,
      fontSize: 10,
      fontFace: "Arial",
      color: colors.ink,
      valign: "top",
    });
    currentY += 0.9;
  }
}
