let logged = false;

interface DeployImportMeta extends ImportMeta {
  readonly env: { readonly VITE_DEPLOY_TAG?: string };
}

/**
 * 在应用入口调用一次；无 `VITE_DEPLOY_TAG` 时静默跳过。
 * @param appName 子应用 / 主应用标识（如 main、login、skill），会显示在日志前缀
 */
export function logDeployTag(appName: string, style = 'color:#0f766e;font-size:14px;font-weight:600'): void {
  if (logged) return;
  const tag = (import.meta as DeployImportMeta).env.VITE_DEPLOY_TAG;
  if (typeof tag !== 'string' || tag.length === 0) return;
  logged = true;
  console.log(`%c【${appName}】 %c${tag}`, `${style};letter-spacing:0.02em`, style);
}
