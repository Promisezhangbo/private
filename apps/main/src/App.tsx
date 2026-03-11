import { router } from "@/router";
import { ConfigProvider, type ThemeConfig } from "antd";
import { RouterProvider } from "react-router-dom";
import QiankunProvider from "./components/QiankunProvider";
import { getCssVar } from "./utils/cssvar";
import zhCN from 'antd/locale/zh_CN';
function App() {
  // const tokenTheme: ThemeConfig = {
  //   token: getCssVar(),
  // };
  return <ConfigProvider theme={{}} locale={zhCN}>
    <QiankunProvider>
      <RouterProvider router={router} />;
    </QiankunProvider>
  </ConfigProvider>
}
export default App;
