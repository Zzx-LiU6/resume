import { downloadHtmlToPpt } from "html-to-pptx";

export async function exportToPPT() {
  try {
    const previewElement = document.querySelector("#resume-preview") as HTMLElement;
    if (!previewElement) {
      alert("未找到简历预览区域，请确保预览区已加载");
      return;
    }

    // 给预览区一个临时宽高比，让 PPT 导出更规整
    const originalStyles = {
      width: previewElement.style.width,
      transform: previewElement.style.transform,
    };

    // 确保预览区在导出时是可见的
    previewElement.style.width = "100%";
    previewElement.style.transform = "none";

    await downloadHtmlToPpt(".resume-preview", "我的简历");

    // 恢复原样
    previewElement.style.width = originalStyles.width;
    previewElement.style.transform = originalStyles.transform;
  } catch (error) {
    console.error("导出 PPT 失败:", error);
    alert("导出 PPT 失败，请重试。如果持续失败，请尝试在桌面端 Chrome 中使用。");
  }
}
