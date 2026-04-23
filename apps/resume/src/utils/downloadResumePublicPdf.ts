/** 与 `apps/resume/public/` 下文件名一致 */
const RESUME_PDF_PUBLIC_FILE = 'xx.pdf';

function resumePdfAssetPath(): string {
  const base = import.meta.env.BASE_URL;
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}${RESUME_PDF_PUBLIC_FILE}`;
}

/**
 * 下载 `public/xx.pdf`（构建后位于站点 `/resume/xx.pdf` 等同路径）。
 * 使用 blob 以便本地保存为中文文件名。
 */
export async function downloadResumePublicPdf(downloadAsName: string): Promise<void> {
  const path = resumePdfAssetPath();
  const res = await fetch(path, { credentials: 'same-origin' });
  if (!res.ok) {
    throw new Error(`未找到静态简历文件（${RESUME_PDF_PUBLIC_FILE}），请放入 apps/resume/public/ 后重新构建`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = downloadAsName;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
