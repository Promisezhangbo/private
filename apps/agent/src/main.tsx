import { logDeployTag } from '@packages/vite-build-utils/logDeployTag';
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { qiankunWindow, renderWithQiankun } from 'vite-plugin-qiankun/dist/helper';
import App from './App.tsx';
import './app.scss';
let root: Root | null = null;
function render(props: { container?: HTMLElement }) {
  logDeployTag('agent', 'color:#06b6d4;font-size:16px;font-weight:bold');
  const { container } = props ?? {};
  const rootContainer = container?.querySelector('#root') || document.getElementById('root');
  if (!rootContainer) return;
  if (!root) {
    root = createRoot(rootContainer);
  }
  // 复用 root 实例调用 render 方法
  const embedded = qiankunWindow.__POWERED_BY_QIANKUN__;
  const shell = {
    boxSizing: 'border-box' as const,
    display: 'flex' as const,
    flexDirection: 'column' as const,
    overflow: 'hidden' as const,
  };
  /* 嵌入时父链为 flex，用 flex:1 比 height:100% 更稳（父高曾为 0 会导致整页不可见） */
  const appRootStyle = embedded
    ? { flex: 1, minHeight: 0, minWidth: 0, ...shell }
    : { height: '100vh', minHeight: '100vh', ...shell };
  root.render(
    <React.StrictMode>
      <div id="app-root" style={appRootStyle}>
        <div className="agent-shell">
          <App />
        </div>
      </div>
    </React.StrictMode>,
  );
}
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({});
} else {
  renderWithQiankun({
    bootstrap: async () => {},
    mount: async (props) => {
      render(props);
    },
    unmount: async () => {
      if (root) {
        root.unmount();
        root = null;
      }
    },
    update: async () => {},
  });
}
