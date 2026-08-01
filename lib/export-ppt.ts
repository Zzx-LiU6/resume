import PptxGenJS from "pptxgenjs";
import type { ResumeData, ResumeTheme, SectionMeta } from "@/lib/resume-types";

function hexToPptx(hex: string): string {
  return hex.replace("#", "");
}

function safeText(text: any): string {
  return typeof text === "string" ? text.trim() : "";
}

function hasSectionContent(data: ResumeData, type: string): boolean {
  switch (type) {
    case "intro": return !!safeText(data.intro);
    case "work": return data.work?.some(j => safeText(j.org)) ?? false;
    case "internship": return data.internship?.some(j => safeText(j.org)) ?? false;
    case "project": return data.project?.some(p => safeText(p.name)) ?? false;
    case "education": return data.education?.some(e => safeText(e.school)) ?? false;
    case "skills": return data.skills?.some(s => safeText(s.name)) ?? false;
    case "awards": return data.awards?.some(a => safeText(a.name)) ?? false;
    case "evaluation": return !!safeText(data.evaluation);
    default: return false;
  }
}

export async function exportToPPT(
  data: ResumeData,
  theme: ResumeTheme,
  sections: SectionMeta[],
  layout: "split" | "stacked" = "split"
) {
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

    const visibleSections = sections.filter(s => s.visible && hasSectionContent(data, s.type));

    if (layout === "split") {
      await generateSplitLayout(pptx, data, colors, visibleSections);
    } else {
      await generateStackedLayout(pptx, data, colors, visibleSections);
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
async function generateSplitLayout(
  pptx: PptxGenJS,
  data: ResumeData,
  colors: any,
  sections: SectionMeta[]
) {
  const slide = pptx.addSlide();
  slide.background = { color: colors.paper };

  const margin = 1.2;
  const pageWidth = 21;
  const pageHeight = 29.7;
  const sidebarWidth = 6.5;
  const contentX = margin + sidebarWidth + 0.6;
  const contentWidth = pageWidth - contentX - margin;

  slide.addShape(pptx.ShapeType.rect, {
    x: margin,
    y: margin,
    w: sidebarWidth,
    h: pageHeight - margin * 2,
    fill: { color: colors.tagBg },
  });

  let sideY = margin + 0.8;
  const p = data.personal;

  // ===== 侧边栏：姓名 =====
  const name = safeText(p.fullName);
  if (name) {
    slide.addText(name, {
      x: margin + 0.3,
      y: sideY,
      w: sidebarWidth - 0.6,
      h: 1.6,
      fontSize: 38,
      fontFace: "Microsoft YaHei",
      color: colors.ink,
      bold: true,
      align: "center",
    });
    sideY += 1.9;
  }

  // ===== 侧边栏：求职意向 =====
  const jobIntention = safeText(p.jobIntention);
  if (jobIntention) {
    slide.addText(jobIntention, {
      x: margin + 0.3,
      y: sideY,
      w: sidebarWidth - 0.6,
      h: 0.9,
      fontSize: 24,
      fontFace: "Microsoft YaHei",
      color: colors.accent,
      align: "center",
      bold: true,
    });
    sideY += 1.1;
  }

  // ===== 侧边栏：联系方式（字体 20pt） =====
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
        h: 0.7,
        fontSize: 20,  // ← 改为 20pt
        fontFace: "Microsoft YaHei",
        color: colors.subtle,
        align: "center",
      });
      sideY += 0.7;
    }
  }

  // ===== 右侧内容区 =====
  let y = margin + 0.3;

  for (const sec of sections) {
    const type = sec.type;
    switch (type) {
      case "intro": {
        const text = safeText(data.intro);
        if (text) {
          addSectionTitle(pptx, slide, "自我介绍", contentX, y, contentWidth, colors);
          y += 0.8;
          const used = addTextBlock(slide, text, contentX + 0.2, y, contentWidth - 0.4, colors);
          y += used + 0.4;
        }
        break;
      }
      case "work": {
        if (data.work?.some(j => safeText(j.org))) {
          addSectionTitle(pptx, slide, "工作经历", contentX, y, contentWidth, colors);
          y += 0.8;
          for (const job of data.work) {
            const org = safeText(job.org);
            if (!org) continue;
            const role = safeText(job.role);
            const time = (job.start || job.end) ? `  ${job.start || ''} - ${job.end || ''}` : '';
            const header = role ? `${org} · ${role}${time}` : `${org}${time}`;
            slide.addText(header, {
              x: contentX + 0.2,
              y: y,
              w: contentWidth - 0.4,
              h: 0.7,
              fontSize: 18,
              fontFace: "Microsoft YaHei",
              color: colors.ink,
              bold: true,
            });
            y += 0.7;
            const bullets = (job.bullets || []).map(safeText).filter(b => b);
            for (const b of bullets) {
              slide.addText(`• ${b}`, {
                x: contentX + 0.7,
                y: y,
                w: contentWidth - 1.0,
                h: 0.6,
                fontSize: 16,
                fontFace: "Microsoft YaHei",
                color: colors.ink,
                valign: "top",
              });
              y += 0.6;
            }
            y += 0.3;
          }
        }
        break;
      }
      case "internship": {
        if (data.internship?.some(j => safeText(j.org))) {
          addSectionTitle(pptx, slide, "实习经历", contentX, y, contentWidth, colors);
          y += 0.8;
          for (const job of data.internship) {
            const org = safeText(job.org);
            if (!org) continue;
            const role = safeText(job.role);
            const time = (job.start || job.end) ? `  ${job.start || ''} - ${job.end || ''}` : '';
            const header = role ? `${org} · ${role}${time}` : `${org}${time}`;
            slide.addText(header, {
              x: contentX + 0.2,
              y: y,
              w: contentWidth - 0.4,
              h: 0.7,
              fontSize: 18,
              fontFace: "Microsoft YaHei",
              color: colors.ink,
              bold: true,
            });
            y += 0.7;
            const bullets = (job.bullets || []).map(safeText).filter(b => b);
            for (const b of bullets) {
              slide.addText(`• ${b}`, {
                x: contentX + 0.7,
                y: y,
                w: contentWidth - 1.0,
                h: 0.6,
                fontSize: 16,
                fontFace: "Microsoft YaHei",
                color: colors.ink,
                valign: "top",
              });
              y += 0.6;
            }
            y += 0.3;
          }
        }
        break;
      }
      case "project": {
        if (data.project?.some(p => safeText(p.name))) {
          addSectionTitle(pptx, slide, "项目经历", contentX, y, contentWidth, colors);
          y += 0.8;
          for (const proj of data.project) {
            const name = safeText(proj.name);
            if (!name) continue;
            const role = safeText(proj.role);
            const time = (proj.start || proj.end) ? `  ${proj.start || ''} - ${proj.end || ''}` : '';
            const header = role ? `${name} · ${role}${time}` : `${name}${time}`;
            slide.addText(header, {
              x: contentX + 0.2,
              y: y,
              w: contentWidth - 0.4,
              h: 0.7,
              fontSize: 18,
              fontFace: "Microsoft YaHei",
              color: colors.ink,
              bold: true,
            });
            y += 0.7;
            const introText = safeText(proj.intro);
            if (introText) {
              slide.addText(introText, {
                x: contentX + 0.7,
                y: y,
                w: contentWidth - 1.0,
                h: 0.6,
                fontSize: 16,
                fontFace: "Microsoft YaHei",
                color: colors.ink,
                valign: "top",
              });
              y += 0.6;
            }
            if (proj.skills) {
              slide.addText(`技术栈：${proj.skills}`, {
                x: contentX + 0.7,
                y: y,
                w: contentWidth - 1.0,
                h: 0.6,
                fontSize: 16,
                fontFace: "Microsoft YaHei",
                color: colors.subtle,
                valign: "top",
              });
              y += 0.6;
            }
            y += 0.3;
          }
        }
        break;
      }
      case "education": {
        if (data.education?.some(e => safeText(e.school))) {
          addSectionTitle(pptx, slide, "教育背景", contentX, y, contentWidth, colors);
          y += 0.8;
          for (const edu of data.education) {
            const school = safeText(edu.school);
            if (!school) continue;
            const major = safeText(edu.major);
            const degree = safeText(edu.degree);
            const time = (edu.start || edu.end) ? `  ${edu.start || ''} - ${edu.end || ''}` : '';
            let header = school;
            if (major) header += ` · ${major}`;
            if (degree) header += ` · ${degree}`;
            header += time;
            slide.addText(header, {
              x: contentX + 0.2,
              y: y,
              w: contentWidth - 0.4,
              h: 0.7,
              fontSize: 18,
              fontFace: "Microsoft YaHei",
              color: colors.ink,
              bold: true,
            });
            y += 0.7;
            if (edu.gpa) {
              slide.addText(`GPA：${edu.gpa}`, {
                x: contentX + 0.5,
                y: y,
                w: contentWidth - 0.7,
                h: 0.5,
                fontSize: 16,
                fontFace: "Microsoft YaHei",
                color: colors.subtle,
                valign: "top",
              });
              y += 0.5;
            }
            if (edu.courses) {
              slide.addText(`主修课程：${edu.courses}`, {
                x: contentX + 0.5,
                y: y,
                w: contentWidth - 0.7,
                h: 0.5,
                fontSize: 16,
                fontFace: "Microsoft YaHei",
                color: colors.subtle,
                valign: "top",
              });
              y += 0.5;
            }
            y += 0.2;
          }
          y += 0.3;
        }
        break;
      }
      case "skills": {
        const skillNames = data.skills?.map(s => safeText(s.name)).filter(Boolean) ?? [];
        if (skillNames.length > 0) {
          addSectionTitle(pptx, slide, "专业技能", contentX, y, contentWidth, colors);
          y += 0.8;
          slide.addText(skillNames.join(" · "), {
            x: contentX + 0.2,
            y: y,
            w: contentWidth - 0.4,
            h: 0.7,
            fontSize: 18,
            fontFace: "Microsoft YaHei",
            color: colors.ink,
            valign: "top",
          });
          y += 0.8;
        }
        break;
      }
      case "awards": {
        if (data.awards?.some(a => safeText(a.name))) {
          addSectionTitle(pptx, slide, "荣誉奖项", contentX, y, contentWidth, colors);
          y += 0.8;
          for (const award of data.awards) {
            const name = safeText(award.name);
            if (!name) continue;
            const issuer = safeText(award.issuer);
            const date = safeText(award.date);
            let text = name;
            if (issuer) text += ` · ${issuer}`;
            if (date) text += `  ${date}`;
            slide.addText(text, {
              x: contentX + 0.2,
              y: y,
              w: contentWidth - 0.4,
              h: 0.6,
              fontSize: 16,
              fontFace: "Microsoft YaHei",
              color: colors.ink,
              valign: "top",
            });
            y += 0.6;
          }
          y += 0.3;
        }
        break;
      }
      case "evaluation": {
        const text = safeText(data.evaluation);
        if (text) {
          addSectionTitle(pptx, slide, "自我评价", contentX, y, contentWidth, colors);
          y += 0.8;
          const used = addTextBlock(slide, text, contentX + 0.2, y, contentWidth - 0.4, colors);
          y += used + 0.4;
        }
        break;
      }
    }
  }
}

// ============================================================
// 单栏布局（逻辑与分栏一致，仅位置参数不同）
// ============================================================
async function generateStackedLayout(
  pptx: PptxGenJS,
  data: ResumeData,
  colors: any,
  sections: SectionMeta[]
) {
  const slide = pptx.addSlide();
  slide.background = { color: colors.paper };

  const margin = 1.8;
  const contentWidth = 21 - margin * 2;
  let y = margin;
  const p = data.personal;

  // ===== 姓名 =====
  const name = safeText(p.fullName);
  if (name) {
    slide.addText(name, {
      x: margin,
      y: y,
      w: contentWidth,
      h: 1.6,
      fontSize: 42,
      fontFace: "Microsoft YaHei",
      color: colors.ink,
      bold: true,
      align: "center",
    });
    y += 1.9;
  }

  // ===== 求职意向 =====
  const jobIntention = safeText(p.jobIntention);
  if (jobIntention) {
    slide.addText(jobIntention, {
      x: margin,
      y: y,
      w: contentWidth,
      h: 0.9,
      fontSize: 24,
      fontFace: "Microsoft YaHei",
      color: colors.accent,
      align: "center",
      bold: true,
    });
    y += 1.1;
  }

  // ===== 联系方式 =====
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
      h: 0.7,
      fontSize: 18,
      fontFace: "Microsoft YaHei",
      color: colors.subtle,
      align: "center",
    });
    y += 0.8;
  }

  // ===== 分隔线 =====
  slide.addShape(pptx.ShapeType.rect, {
    x: margin + 1,
    y: y,
    w: contentWidth - 2,
    h: 0.06,
    fill: { color: colors.line },
  });
  y += 0.7;

  // ===== 内容区（与分栏逻辑完全相同，只是 x 坐标用 margin） =====
  for (const sec of sections) {
    const type = sec.type;
    switch (type) {
      case "intro": {
        const text = safeText(data.intro);
        if (text) {
          addSectionTitle(pptx, slide, "自我介绍", margin, y, contentWidth, colors);
          y += 0.8;
          const used = addTextBlock(slide, text, margin + 0.2, y, contentWidth - 0.4, colors);
          y += used + 0.4;
        }
        break;
      }
      case "work": {
        if (data.work?.some(j => safeText(j.org))) {
          addSectionTitle(pptx, slide, "工作经历", margin, y, contentWidth, colors);
          y += 0.8;
          for (const job of data.work) {
            const org = safeText(job.org);
            if (!org) continue;
            const role = safeText(job.role);
            const time = (job.start || job.end) ? `  ${job.start || ''} - ${job.end || ''}` : '';
            const header = role ? `${org} · ${role}${time}` : `${org}${time}`;
            slide.addText(header, {
              x: margin + 0.2,
              y: y,
              w: contentWidth - 0.4,
              h: 0.7,
              fontSize: 18,
              fontFace: "Microsoft YaHei",
              color: colors.ink,
              bold: true,
            });
            y += 0.7;
            const bullets = (job.bullets || []).map(safeText).filter(b => b);
            for (const b of bullets) {
              slide.addText(`• ${b}`, {
                x: margin + 0.7,
                y: y,
                w: contentWidth - 1.0,
                h: 0.6,
                fontSize: 16,
                fontFace: "Microsoft YaHei",
                color: colors.ink,
                valign: "top",
              });
              y += 0.6;
            }
            y += 0.3;
          }
        }
        break;
      }
      case "internship": {
        if (data.internship?.some(j => safeText(j.org))) {
          addSectionTitle(pptx, slide, "实习经历", margin, y, contentWidth, colors);
          y += 0.8;
          for (const job of data.internship) {
            const org = safeText(job.org);
            if (!org) continue;
            const role = safeText(job.role);
            const time = (job.start || job.end) ? `  ${job.start || ''} - ${job.end || ''}` : '';
            const header = role ? `${org} · ${role}${time}` : `${org}${time}`;
            slide.addText(header, {
              x: margin + 0.2,
              y: y,
              w: contentWidth - 0.4,
              h: 0.7,
              fontSize: 18,
              fontFace: "Microsoft YaHei",
              color: colors.ink,
              bold: true,
            });
            y += 0.7;
            const bullets = (job.bullets || []).map(safeText).filter(b => b);
            for (const b of bullets) {
              slide.addText(`• ${b}`, {
                x: margin + 0.7,
                y: y,
                w: contentWidth - 1.0,
                h: 0.6,
                fontSize: 16,
                fontFace: "Microsoft YaHei",
                color: colors.ink,
                valign: "top",
              });
              y += 0.6;
            }
            y += 0.3;
          }
        }
        break;
      }
      case "project": {
        if (data.project?.some(p => safeText(p.name))) {
          addSectionTitle(pptx, slide, "项目经历", margin, y, contentWidth, colors);
          y += 0.8;
          for (const proj of data.project) {
            const name = safeText(proj.name);
            if (!name) continue;
            const role = safeText(proj.role);
            const time = (proj.start || proj.end) ? `  ${proj.start || ''} - ${proj.end || ''}` : '';
            const header = role ? `${name} · ${role}${time}` : `${name}${time}`;
            slide.addText(header, {
              x: margin + 0.2,
              y: y,
              w: contentWidth - 0.4,
              h: 0.7,
              fontSize: 18,
              fontFace: "Microsoft YaHei",
              color: colors.ink,
              bold: true,
            });
            y += 0.7;
            const introText = safeText(proj.intro);
            if (introText) {
              slide.addText(introText, {
                x: margin + 0.7,
                y: y,
                w: contentWidth - 1.0,
                h: 0.6,
                fontSize: 16,
                fontFace: "Microsoft YaHei",
                color: colors.ink,
                valign: "top",
              });
              y += 0.6;
            }
            if (proj.skills) {
              slide.addText(`技术栈：${proj.skills}`, {
                x: margin + 0.7,
                y: y,
                w: contentWidth - 1.0,
                h: 0.6,
                fontSize: 16,
                fontFace: "Microsoft YaHei",
                color: colors.subtle,
                valign: "top",
              });
              y += 0.6;
            }
            y += 0.3;
          }
        }
        break;
      }
      case "education": {
        if (data.education?.some(e => safeText(e.school))) {
          addSectionTitle(pptx, slide, "教育背景", margin, y, contentWidth, colors);
          y += 0.8;
          for (const edu of data.education) {
            const school = safeText(edu.school);
            if (!school) continue;
            const major = safeText(edu.major);
            const degree = safeText(edu.degree);
            const time = (edu.start || edu.end) ? `  ${edu.start || ''} - ${edu.end || ''}` : '';
            let header = school;
            if (major) header += ` · ${major}`;
            if (degree) header += ` · ${degree}`;
            header += time;
            slide.addText(header, {
              x: margin + 0.2,
              y: y,
              w: contentWidth - 0.4,
              h: 0.7,
              fontSize: 18,
              fontFace: "Microsoft YaHei",
              color: colors.ink,
              bold: true,
            });
            y += 0.7;
            if (edu.gpa) {
              slide.addText(`GPA：${edu.gpa}`, {
                x: margin + 0.5,
                y: y,
                w: contentWidth - 0.7,
                h: 0.5,
                fontSize: 16,
                fontFace: "Microsoft YaHei",
                color: colors.subtle,
                valign: "top",
              });
              y += 0.5;
            }
            if (edu.courses) {
              slide.addText(`主修课程：${edu.courses}`, {
                x: margin + 0.5,
                y: y,
                w: contentWidth - 0.7,
                h: 0.5,
                fontSize: 16,
                fontFace: "Microsoft YaHei",
                color: colors.subtle,
                valign: "top",
              });
              y += 0.5;
            }
            y += 0.2;
          }
          y += 0.3;
        }
        break;
      }
      case "skills": {
        const skillNames = data.skills?.map(s => safeText(s.name)).filter(Boolean) ?? [];
        if (skillNames.length > 0) {
          addSectionTitle(pptx, slide, "专业技能", margin, y, contentWidth, colors);
          y += 0.8;
          slide.addText(skillNames.join(" · "), {
            x: margin + 0.2,
            y: y,
            w: contentWidth - 0.4,
            h: 0.7,
            fontSize: 18,
            fontFace: "Microsoft YaHei",
            color: colors.ink,
            valign: "top",
          });
          y += 0.8;
        }
        break;
      }
      case "awards": {
        if (data.awards?.some(a => safeText(a.name))) {
          addSectionTitle(pptx, slide, "荣誉奖项", margin, y, contentWidth, colors);
          y += 0.8;
          for (const award of data.awards) {
            const name = safeText(award.name);
            if (!name) continue;
            const issuer = safeText(award.issuer);
            const date = safeText(award.date);
            let text = name;
            if (issuer) text += ` · ${issuer}`;
            if (date) text += `  ${date}`;
            slide.addText(text, {
              x: margin + 0.2,
              y: y,
              w: contentWidth - 0.4,
              h: 0.6,
              fontSize: 16,
              fontFace: "Microsoft YaHei",
              color: colors.ink,
              valign: "top",
            });
            y += 0.6;
          }
          y += 0.3;
        }
        break;
      }
      case "evaluation": {
        const text = safeText(data.evaluation);
        if (text) {
          addSectionTitle(pptx, slide, "自我评价", margin, y, contentWidth, colors);
          y += 0.8;
          const used = addTextBlock(slide, text, margin + 0.2, y, contentWidth - 0.4, colors);
          y += used + 0.4;
        }
        break;
      }
    }
  }
}

// ============================================================
// 辅助函数
// ============================================================
function addSectionTitle(pptx: PptxGenJS, slide: any, title: string, x: number, y: number, width: number, colors: any) {
  slide.addText(title, {
    x: x,
    y: y,
    w: width,
    h: 0.8,
    fontSize: 24,
    fontFace: "Microsoft YaHei",
    color: colors.accent,
    bold: true,
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: x,
    y: y + 0.75,
    w: width,
    h: 0.06,
    fill: { color: colors.line },
  });
}

function addTextBlock(slide: any, text: string, x: number, y: number, width: number, colors: any): number {
  const lines = text.split("\n").filter(line => line.trim() !== "");
  const lineHeight = 0.7;
  const lineSpacing = 0.15;

  if (lines.length === 0) return 0;

  let currentY = y;
  for (const line of lines) {
    slide.addText(line.trim(), {
      x: x,
      y: currentY,
      w: width,
      h: lineHeight,
      fontSize: 18,
      fontFace: "Microsoft YaHei",
      color: colors.ink,
      valign: "top",
    });
    currentY += lineHeight + lineSpacing;
  }

  return lines.length * (lineHeight + lineSpacing);
}
