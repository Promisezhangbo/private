import type { ReactNode } from 'react';
import './AuthShell.scss';

type AuthShellProps = {
  children: ReactNode;
};
/**
 * 登录/注册页统一外壳：浅色渐变底 + 柔和装饰 + 居中内容区
 */
export default function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="login-warp">
      <div className="login-auth-shell">
        <div className="login-auth-inner">{children}</div>
      </div>
    </div>
  );
}
