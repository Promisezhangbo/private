import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { RouterProvider } from 'react-router-dom';
import { routers } from './router';

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorBgLayout: 'transparent',
          borderRadius: 8,
          borderRadiusLG: 12,
          borderRadiusSM: 8,
        },
      }}
    >
      <RouterProvider router={routers} />
    </ConfigProvider>
  );
}

export default App;
