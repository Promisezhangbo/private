import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { motion } from "framer-motion";
import { RouterProvider } from "react-router-dom";
import { routers } from "./router";

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorBgLayout: "transparent",
          borderRadiusLG: 10,
        },
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
        style={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <RouterProvider router={routers} />
      </motion.div>
    </ConfigProvider>
  );
}

export default App;
