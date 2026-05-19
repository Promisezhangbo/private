import { logDeployTag } from '@packages/vite-build-utils/logDeployTag';
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { qiankunWindow, renderWithQiankun } from 'vite-plugin-qiankun/dist/helper';
import App from './App.tsx';
import './app.scss';

let root: Root | null = null;

function render(props: { container?: HTMLElement }) {
  logDeployTag('login', 'color:#0d9488;font-size:16px;font-weight:bold');
  const { container } = props ?? {};
  const rootContainer = container?.querySelector('#root') || document.getElementById('root');
  if (!rootContainer) return;
  if (!root) {
    root = createRoot(rootContainer);
  }
  root.render(
    <React.StrictMode>
      <div id="app-root">
        <App />
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
