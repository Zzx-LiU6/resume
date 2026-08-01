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

    const slide = pptx.addSlide();
    slide.background = { color: colors.paper };

    const margin = 1.8;
    const pageWidth = 21;
    const pageHeight = 29.7;
    const contentWidth = pageWidth - margin * 2;

    let y = margin;

    // ---- 标题：姓名 ----
    if (data.personal.fullName) {
      slide.addText(data.personal.fullName, {
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
    if (data.personal.jobIntention) {
      slide.addText(data.personal.jobIntention, {
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
    if (data.personal.phone) contactParts.push(`📞 ${data.personal.phone}`);
    if (data.personal.email) contactParts.push(`✉️ ${data.personal.email}`);
    if (data.personal.city) contactParts.push(`📍 ${data.personal.city}`);
    if (data.personal.gender) contactParts.push(data.personal.gender);

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
      slide.addText("自我介绍", {
        x: margin,
        y: y,
        w: contentWidth,
        h: 0.7,
        fontSize: 15,
        fontFace: "Arial",
        color: colors.accent,
        bold: true,
      });
      // 标题横线
      slide.addShape(pptx.ShapeType.rect, {
        x: margin,
        y: y + 0.65,
        w: contentWidth,
        h: 0.05,
        fill: { color: colors.line },
      });
      y += 0.8;

      slide.addText(data.intro, {
        x: margin + 0.2,
        y: y,
        w: contentWidth - 0.4,
        h: 0.9,
        fontSize: 11.5,
        fontFace: "Arial",
        color: colors.ink,
        valign: "top",
        lineSpacing: 18,
      });
      y += 1.1;
    }

    // ---- 工作经历 ----
    if (data.work && data.work.some(j => j.org)) {
      slide.addText("工作经历", {
        x: margin,
        y: y,
        w: contentWidth,
        h: 0.7,
        fontSize: 15,
        fontFace: "Arial",
        color: colors.accent,
        bold: true,
      });
      slide.addShape(pptx.ShapeType.rect, {
        x: margin,
        y: y + 0.65,
        w: contentWidth,
        h: 0.05,
        fill: { color: colors.line },
      });
      y += 0.8;

      for (const job of data.work) {
        if (!job.org) continue;
        // 公司名 + 职位
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
            lineSpacing: 16,
          });
          y += 0.55;
        }
        y += 0.3;
      }
    }

    // ---- 项目经历 ----
    if (data.project && data.project.some(p => p.name)) {
      slide.addText("项目经历", {
        x: margin,
        y: y,
        w: contentWidth,
        h: 0.7,
        fontSize: 15,
        fontFace: "Arial",
        color: colors.accent,
        bold: true,
      });
      slide.addShape(pptx.ShapeType.rect, {
        x: margin,
        y: y + 0.65,
        w: contentWidth,
        h: 0.05,
        fill: { color: colors.line },
      });
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
            lineSpacing: 16,
          });
          y += 0.55;
        }
        y += 0.2;
      }
    }

    // ---- 教育背景 ----
    if (data.education && data.education.some(e => e.school)) {
      slide.addText("教育背景", {
        x: margin,
        y: y,
        w: contentWidth,
        h: 0.7,
        fontSize: 15,
        fontFace: "Arial",
        color: colors.accent,
        bold: true,
      });
      slide.addShape(pptx.ShapeType.rect, {
        x: margin,
        y: y + 0.65,
        w: contentWidth,
        h: 0.05,
        fill: { color: colors.line },
      });
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
      slide.addText("专业技能", {
        x: margin,
        y: y,
        w: contentWidth,
        h: 0.7,
        fontSize: 15,
        fontFace: "Arial",
        color: colors.accent,
        bold: true,
      });
      slide.addShape(pptx.ShapeType.rect, {
        x: margin,
        y: y + 0.65,
        w: contentWidth,
        h: 0.05,
        fill: { color: colors.line },
      });
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
      slide.addText("自我评价", {
        x: margin,
        y: y,
        w: contentWidth,
        h: 0.7,
        fontSize: 15,
        fontFace: "Arial",
        color: colors.accent,
        bold: true,
      });
      slide.addShape(pptx.ShapeType.rect, {
        x: margin,
        y: y + 0.65,
        w: contentWidth,
        h: 0.05,
        fill: { color: colors.line },
      });
      y += 0.8;

      slide.addText(data.evaluation, {
        x: margin + 0.2,
        y: y,
        w: contentWidth - 0.4,
        h: 0.9,
        fontSize: 11,
        fontFace: "Arial",
        color: colors.ink,
        valign: "top",
        lineSpacing: 18,
      });
      y += 1.0;
    }

    await pptx.writeFile({ fileName: "我的简历.pptx" });
  } catch (error) {
    console.error("导出 PPT 失败:", error);
    alert("导出 PPT 失败，请重试。");
  }
}
