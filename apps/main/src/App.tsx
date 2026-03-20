import { router } from "@/router";
import { ConfigProvider } from "antd";
import { RouterProvider } from "react-router-dom";
import QiankunProvider from "./components/QiankunProvider";
import zhCN from 'antd/locale/zh_CN';
function App() {
  return <ConfigProvider theme={{}} locale={zhCN}>
    <QiankunProvider>
      <RouterProvider router={router} />
    </QiankunProvider>
  </ConfigProvider>
}
export default App;
