import App from "@/App";
import QiankunProvider from "@/components/QiankunProvider";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import 'antd/dist/reset.css';
import 'antd/dist/antd.css';
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QiankunProvider>
      <App />
    </QiankunProvider>
  </StrictMode>
);
if (__BUILD_TIME__) {
  console.log(`%c【main】${__BUILD_TIME__}`, 'color: #48a19e; font-size: 18px; font-weight: bold;'); // 调试
}
