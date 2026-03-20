import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { qiankunWindow, renderWithQiankun } from "vite-plugin-qiankun/dist/helper";
import App from "./App.tsx";
import "./app.scss";
let root: Root | null = null;
function render(props: { container?: HTMLElement }) {
  const { container } = props ?? {};
  const rootContainer = container?.querySelector("#root") || document.getElementById("root");
  if (!rootContainer) return;
  if (!root) {
    root = createRoot(rootContainer);
  }
  // 复用 root 实例调用 render 方法
  const embedded = qiankunWindow.__POWERED_BY_QIANKUN__;
  const appRootStyle = embedded
    ? { height: '100%', minHeight: '100%', overflow: 'auto' as const, boxSizing: 'border-box' as const }
    : { height: '100vh', minHeight: '100vh', overflow: 'auto' as const, boxSizing: 'border-box' as const };
  root.render(
    <React.StrictMode>
      <div id="app-root" style={appRootStyle}>
        <App />
      </div>
    </React.StrictMode>
  );
}
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({});
} else {
  renderWithQiankun({
    bootstrap: async () => { },
    mount: async (props) => {
      render(props);
      if (__BUILD_TIME__) {
        console.log(`%c【blog】${__BUILD_TIME__}`, 'color: #48a19e; font-size: 18px; font-weight: bold;'); // 调试
      }
    },
    unmount: async () => {
      if (root) {
        root.unmount();
        root = null;
      }
    },
    update: async () => { }
  });
}
