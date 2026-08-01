import PptxGenJS from "pptxgenjs";
import type { ResumeData, ResumeTheme } from "@/lib/resume-types";

function hexToPptx(hex: string): string {
  return hex.replace("#", "");
}

function safeText(text: any): string {
  return typeof text === "string" ? text.trim() : "";
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
    alert("导出 PPT 失败，请重试。如果持续失败，请尝试使用 PDF 导出。");
  }
}

// ============================================================
// 分栏布局
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

  // 侧边栏背景
  slide.addShape(pptx.ShapeType.rect, {
    x: margin,
    y: margin,
    w: sidebarWidth,
    h: pageHeight - margin * 2,
    fill: { color: colors.tagBg },
  });

  let sideY = margin + 0.8;
  const p = data.personal;

  // 姓名
  const name = safeText(p.fullName);
  if (name) {
    slide.addText(name, {
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

  // 求职意向
  const jobIntention = safeText(p.jobIntention);
  if (jobIntention) {
    slide.addText(jobIntention, {
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

  // 联系方式
  const contactItems = [
    { icon: "📞", text: p.phone },
    { icon: "✉️", text: p.email },
    { icon: "📍", text: p.city },
    { icon: "", text: p.gender },
  ];
  for (const item of contactItems) {
    const txt = safeText(item.text);
    if (txt) {
      const label = item.icon ? `${item.icon} ${txt}` : txt;
      slide.addText(label, {
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
  }

  // ---------- 右侧内容 ----------
  let y = margin + 0.3;

  // 自我介绍
  const intro = safeText(data.intro);
  if (intro) {
    addSectionTitle(slide, "自我介绍", contentX, y, contentWidth, colors);
    y += 0.8;
    addTextBlock(slide, intro, contentX + 0.2, y, contentWidth - 0.4, 0.9, colors);
    y += 1.1;
  }

  // 工作经历
  if (data.work && data.work.length > 0) {
    const hasWork = data.work.some(j => safeText(j.org));
    if (hasWork) {
      addSectionTitle(slide, "工作经历", contentX, y, contentWidth, colors);
      y += 0.8;

      for (const job of data.work) {
        const org = safeText(job.org);
        if (!org) continue;
        const role = safeText(job.role);
        const header = role ? `${org} · ${role}` : org;
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

        const bullets = (job.bullets || []).map(safeText).filter(b => b);
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
  }

  // 项目经历
  if (data.project && data.project.length > 0) {
    const hasProject = data.project.some(p => safeText(p.name));
    if (hasProject) {
      addSectionTitle(slide, "项目经历", contentX, y, contentWidth, colors);
      y += 0.8;

      for (const proj of data.project) {
        const name = safeText(proj.name);
        if (!name) continue;
        const role = safeText(proj.role);
        const header = role ? `${name} · ${role}` : name;
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

        const introText = safeText(proj.intro);
        if (introText) {
          slide.addText(introText, {
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
  }

  // 教育背景
  if (data.education && data.education.length > 0) {
    const hasEdu = data.education.some(e => safeText(e.school));
    if (hasEdu) {
      addSectionTitle(slide, "教育背景", contentX, y, contentWidth, colors);
      y += 0.8;

      for (const edu of data.education) {
        const school = safeText(edu.school);
        if (!school) continue;
        const major = safeText(edu.major);
        const degree = safeText(edu.degree);
        let header = school;
        if (major) header += ` · ${major}`;
        if (degree) header += ` · ${degree}`;
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
  }

  // 专业技能
  if (data.skills && data.skills.length > 0) {
    const skillNames = data.skills.map(s => safeText(s.name)).filter(Boolean);
    if (skillNames.length > 0) {
      addSectionTitle(slide, "专业技能", contentX, y, contentWidth, colors);
      y += 0.8;
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
  const evalText = safeText(data.evaluation);
  if (evalText) {
    addSectionTitle(slide, "自我评价", contentX, y, contentWidth, colors);
    y += 0.8;
    addTextBlock(slide, evalText, contentX + 0.2, y, contentWidth - 0.4, 0.9, colors);
    y += 1.0;
  }
}

// ============================================================
// 单栏布局（与分栏类似，只是去掉侧边栏，内容居中）
// ============================================================
async function generateStackedLayout(pptx: PptxGenJS, data: ResumeData, colors: any) {
  const slide = pptx.addSlide();
  slide.background = { color: colors.paper };

  const margin = 1.8;
  const contentWidth = 21 - margin * 2;
  let y = margin;
  const p = data.personal;

  const name = safeText(p.fullName);
  if (name) {
    slide.addText(name, {
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

  const jobIntention = safeText(p.jobIntention);
  if (jobIntention) {
    slide.addText(jobIntention, {
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

  const contactItems = [
    { icon: "📞", text: p.phone },
    { icon: "✉️", text: p.email },
    { icon: "📍", text: p.city },
    { icon: "", text: p.gender },
  ];
  const contactParts = contactItems
    .map(item => {
      const txt = safeText(item.text);
      return txt ? (item.icon ? `${item.icon} ${txt}` : txt) : null;
    })
    .filter(Boolean);
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

  // 分隔线
  slide.addShape(pptx.ShapeType.rect, {
    x: margin + 1,
    y: y,
    w: contentWidth - 2,
    h: 0.06,
    fill: { color: colors.line },
  });
  y += 0.6;

  // ---- 内容模块（复用辅助函数） ----
  // 自我介绍
  const intro = safeText(data.intro);
  if (intro) {
    addSectionTitle(slide, "自我介绍", margin, y, contentWidth, colors);
    y += 0.8;
    addTextBlock(slide, intro, margin + 0.2, y, contentWidth - 0.4, 0.9, colors);
    y += 1.1;
  }

  // 工作经历
  if (data.work && data.work.length > 0) {
    const hasWork = data.work.some(j => safeText(j.org));
    if (hasWork) {
      addSectionTitle(slide, "工作经历", margin, y, contentWidth, colors);
      y += 0.8;
      for (const job of data.work) {
        const org = safeText(job.org);
        if (!org) continue;
        const role = safeText(job.role);
        const header = role ? `${org} · ${role}` : org;
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
        const bullets = (job.bullets || []).map(safeText).filter(b => b);
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
  }

  // 项目经历
  if (data.project && data.project.length > 0) {
    const hasProject = data.project.some(p => safeText(p.name));
    if (hasProject) {
      addSectionTitle(slide, "项目经历", margin, y, contentWidth, colors);
      y += 0.8;
      for (const proj of data.project) {
        const name = safeText(proj.name);
        if (!name) continue;
        const role = safeText(proj.role);
        const header = role ? `${name} · ${role}` : name;
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
        const introText = safeText(proj.intro);
        if (introText) {
          slide.addText(introText, {
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
  }

  // 教育背景
  if (data.education && data.education.length > 0) {
    const hasEdu = data.education.some(e => safeText(e.school));
    if (hasEdu) {
      addSectionTitle(slide, "教育背景", margin, y, contentWidth, colors);
      y += 0.8;
      for (const edu of data.education) {
        const school = safeText(edu.school);
        if (!school) continue;
        const major = safeText(edu.major);
        const degree = safeText(edu.degree);
        let header = school;
        if (major) header += ` · ${major}`;
        if (degree) header += ` · ${degree}`;
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
  }

  // 专业技能
  if (data.skills && data.skills.length > 0) {
    const skillNames = data.skills.map(s => safeText(s.name)).filter(Boolean);
    if (skillNames.length > 0) {
      addSectionTitle(slide, "专业技能", margin, y, contentWidth, colors);
      y += 0.8;
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

  const evalText = safeText(data.evaluation);
  if (evalText) {
    addSectionTitle(slide, "自我评价", margin, y, contentWidth, colors);
    y += 0.8;
    addTextBlock(slide, evalText, margin + 0.2, y, contentWidth - 0.4, 0.9, colors);
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
