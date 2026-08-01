import PptxGenJS from "pptxgenjs";
import type { ResumeData } from "@/lib/resume-types";

// 颜色配置（与你的主题保持一致）
const COLORS = {
  primary: "1A1A2E",
  accent: "2D2D44",
  text: "333333",
  muted: "666666",
  line: "E0E0E0",
  white: "FFFFFF",
  tagBg: "F0F0F5",
};

// 字体配置
const FONTS = {
  heading: "Arial",
  body: "Arial",
};

/**
 * 导出简历为 PPT
 * @param data 简历数据
 * @param layout 当前布局模式（split / stacked）
 */
export async function exportToPPT(data: ResumeData, layout: "split" | "stacked" = "split") {
  try {
    // 1. 创建 PPT 实例
    const pptx = new PptxGenJS();
    pptx.defineLayout({ name: "A4_VERTICAL", width: 21, height: 29.7 });
    pptx.layout = "A4_VERTICAL";

    // 2. 生成所有幻灯片
    await generateSlides(pptx, data, layout);

    // 3. 下载
    await pptx.writeFile({ fileName: "我的简历.pptx" });
    console.log("✅ PPT 导出成功");
  } catch (error) {
    console.error("导出 PPT 失败:", error);
    alert("导出 PPT 失败，请重试。");
  }
}

/**
 * 生成 PPT 幻灯片
 */
async function generateSlides(pptx: PptxGenJS, data: ResumeData, layout: "split" | "stacked") {
  const slide = pptx.addSlide();

  // 设置背景色
  slide.background = { color: COLORS.white };

  // 计算边距和可用宽度
  const margin = 1.5; // cm
  const pageWidth = 21;
  const pageHeight = 29.7;
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2;

  let currentY = margin;

  // ---- 个人信息区 ----
  const personalY = currentY;
  const p = data.personal;

  // 姓名
  if (p.fullName) {
    slide.addText(p.fullName, {
      x: margin,
      y: personalY,
      w: contentWidth,
      h: 1.2,
      fontSize: 24,
      fontFace: FONTS.heading,
      color: COLORS.primary,
      bold: true,
      align: "center",
    });
    currentY += 1.4;
  }

  // 求职意向
  if (p.jobIntention) {
    slide.addText(p.jobIntention, {
      x: margin,
      y: currentY,
      w: contentWidth,
      h: 0.8,
      fontSize: 14,
      fontFace: FONTS.body,
      color: COLORS.accent,
      align: "center",
    });
    currentY += 1.0;
  }

  // 联系方式（一行显示）
  const contactParts = [];
  if (p.phone) contactParts.push(`📱 ${p.phone}`);
  if (p.email) contactParts.push(`✉️ ${p.email}`);
  if (p.city) contactParts.push(`📍 ${p.city}`);
  if (p.gender) contactParts.push(p.gender);

  if (contactParts.length > 0) {
    slide.addText(contactParts.join("  ·  "), {
      x: margin,
      y: currentY,
      w: contentWidth,
      h: 0.6,
      fontSize: 11,
      fontFace: FONTS.body,
      color: COLORS.muted,
      align: "center",
    });
    currentY += 0.9;
  }

  // 分隔线
  slide.addShape(pptx.ShapeType.rect, {
    x: margin + 2,
    y: currentY,
    w: contentWidth - 4,
    h: 0.05,
    fill: { color: COLORS.line },
  });
  currentY += 0.5;

  // ---- 自我介绍 ----
  if (data.intro?.trim()) {
    slide.addText("自我介绍", {
      x: margin,
      y: currentY,
      w: contentWidth,
      h: 0.7,
      fontSize: 14,
      fontFace: FONTS.heading,
      color: COLORS.primary,
      bold: true,
    });
    currentY += 0.7;

    slide.addText(data.intro, {
      x: margin + 0.3,
      y: currentY,
      w: contentWidth - 0.6,
      h: 0.8,
      fontSize: 11,
      fontFace: FONTS.body,
      color: COLORS.text,
      valign: "top",
    });
    currentY += 1.0;
  }

  // ---- 工作经历 ----
  if (data.work && data.work.length > 0) {
    const hasContent = data.work.some(job => job.org || job.bullets.some(b => b.trim()));
    if (hasContent) {
      slide.addText("工作经历", {
        x: margin,
        y: currentY,
        w: contentWidth,
        h: 0.7,
        fontSize: 14,
        fontFace: FONTS.heading,
        color: COLORS.primary,
        bold: true,
      });
      currentY += 0.7;

      for (const job of data.work) {
        if (!job.org) continue;
        // 公司 + 职位 + 时间
        const header = `${job.org}${job.role ? " · " + job.role : ""}`;
        const time = job.start || job.end ? `${job.start || ""}${job.start && job.end ? " - " : ""}${job.end || ""}` : "";
        slide.addText(header, {
          x: margin + 0.3,
          y: currentY,
          w: contentWidth - 0.6 - 2.5,
          h: 0.6,
          fontSize: 12,
          fontFace: FONTS.heading,
          color: COLORS.primary,
          bold: true,
        });
        if (time) {
          slide.addText(time, {
            x: margin + contentWidth - 2.5,
            y: currentY,
            w: 2.2,
            h: 0.6,
            fontSize: 10,
            fontFace: FONTS.body,
            color: COLORS.muted,
            align: "right",
          });
        }
        currentY += 0.6;

        // Bullets
        const validBullets = job.bullets.filter(b => b.trim());
        for (const bullet of validBullets) {
          slide.addText(`• ${bullet}`, {
            x: margin + 0.8,
            y: currentY,
            w: contentWidth - 1.6,
            h: 0.5,
            fontSize: 10.5,
            fontFace: FONTS.body,
            color: COLORS.text,
            valign: "top",
          });
          currentY += 0.55;
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
        x: margin,
        y: currentY,
        w: contentWidth,
        h: 0.7,
        fontSize: 14,
        fontFace: FONTS.heading,
        color: COLORS.primary,
        bold: true,
      });
      currentY += 0.7;

      for (const proj of data.project) {
        if (!proj.name) continue;
        const header = `${proj.name}${proj.role ? " · " + proj.role : ""}`;
        slide.addText(header, {
          x: margin + 0.3,
          y: currentY,
          w: contentWidth - 0.6,
          h: 0.6,
          fontSize: 12,
          fontFace: FONTS.heading,
          color: COLORS.primary,
          bold: true,
        });
        currentY += 0.6;

        if (proj.intro) {
          slide.addText(proj.intro, {
            x: margin + 0.8,
            y: currentY,
            w: contentWidth - 1.6,
            h: 0.5,
            fontSize: 10.5,
            fontFace: FONTS.body,
            color: COLORS.text,
          });
          currentY += 0.6;
        }

        if (proj.skills) {
          slide.addText(`技术栈：${proj.skills}`, {
            x: margin + 0.8,
            y: currentY,
            w: contentWidth - 1.6,
            h: 0.5,
            fontSize: 10,
            fontFace: FONTS.body,
            color: COLORS.muted,
          });
          currentY += 0.6;
        }
        currentY += 0.1;
      }
    }
  }

  // ---- 教育背景 ----
  if (data.education && data.education.length > 0) {
    const hasContent = data.education.some(e => e.school);
    if (hasContent) {
      slide.addText("教育背景", {
        x: margin,
        y: currentY,
        w: contentWidth,
        h: 0.7,
        fontSize: 14,
        fontFace: FONTS.heading,
        color: COLORS.primary,
        bold: true,
      });
      currentY += 0.7;

      for (const edu of data.education) {
        if (!edu.school) continue;
        const header = `${edu.school}${edu.major ? " · " + edu.major : ""}${edu.degree ? " · " + edu.degree : ""}`;
        slide.addText(header, {
          x: margin + 0.3,
          y: currentY,
          w: contentWidth - 0.6,
          h: 0.6,
          fontSize: 12,
          fontFace: FONTS.heading,
          color: COLORS.primary,
          bold: true,
        });
        currentY += 0.6;
      }
      currentY += 0.2;
    }
  }

  // ---- 专业技能（如果有内容） ----
  if (data.skills && data.skills.length > 0) {
    const validSkills = data.skills.filter(s => s.name);
    if (validSkills.length > 0) {
      slide.addText("专业技能", {
        x: margin,
        y: currentY,
        w: contentWidth,
        h: 0.7,
        fontSize: 14,
        fontFace: FONTS.heading,
        color: COLORS.primary,
        bold: true,
      });
      currentY += 0.7;

      // 用标签形式展示技能
      const skillNames = validSkills.map(s => s.name).filter(Boolean);
      if (skillNames.length > 0) {
        slide.addText(skillNames.join(" · "), {
          x: margin + 0.3,
          y: currentY,
          w: contentWidth - 0.6,
          h: 0.6,
          fontSize: 11,
          fontFace: FONTS.body,
          color: COLORS.text,
        });
        currentY += 0.8;
      }
    }
  }

  // ---- 自我评价（如果有内容） ----
  if (data.evaluation?.trim()) {
    slide.addText("自我评价", {
      x: margin,
      y: currentY,
      w: contentWidth,
      h: 0.7,
      fontSize: 14,
      fontFace: FONTS.heading,
      color: COLORS.primary,
      bold: true,
    });
    currentY += 0.7;

    slide.addText(data.evaluation, {
      x: margin + 0.3,
      y: currentY,
      w: contentWidth - 0.6,
      h: 0.8,
      fontSize: 11,
      fontFace: FONTS.body,
      color: COLORS.text,
      valign: "top",
    });
    currentY += 1.0;
  }

  // 如果内容超出页面，添加第二页
  // （暂时不处理，因为简历通常在一页内完成）
}
