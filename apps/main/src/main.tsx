import App from "@/App";
import { createRoot } from "react-dom/client";
import "./app.scss";
createRoot(document.getElementById("root")!).render(
  <App />
);
console.log(__BUILD_TIME__, '测试时间');
if (__BUILD_TIME__) {
  console.log(`%c【main】${__BUILD_TIME__}`, 'color: #48a19e; font-size: 18px; font-weight: bold;'); // 调试
}
