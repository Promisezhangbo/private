let logged = false;

/** 在子应用入口调用一次；无 `VITE_DEPLOY_TAG` 时静默跳过 */
export function logDeployTag(style = 'color:#0f766e;font-size:14px;font-weight:600'): void {
  if (logged) return;
  const tag = import.meta.env.VITE_DEPLOY_TAG;
  if (typeof tag !== 'string' || tag.length === 0) return;
  logged = true;
  console.log(`%c${tag}`, style);
}
