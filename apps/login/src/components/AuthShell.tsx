import type { ReactNode } from 'react';
type AuthShellProps = {
  children: ReactNode;
};
/**
 * 登录/注册页统一外壳：全屏渐变背景 + 居中玻璃卡片插槽
 */
export default function AuthShell({ children }: AuthShellProps) {
  return <div className="login-auth-shell">{children}</div>;
}
