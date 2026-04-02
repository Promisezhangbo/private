import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { RouterProvider } from 'react-router-dom';
import AuthShell from '@/components/AuthShell';
import { routers } from '@/router';

const loginTheme = {
  token: {
    colorPrimary: '#14b8a6',
    borderRadius: 12,
    colorBgContainer: '#ffffff',
    colorText: '#334155',
    colorTextSecondary: '#64748b',
  },
};

function App() {
  return (
    <ConfigProvider locale={zhCN} theme={loginTheme}>
      <AuthShell>
        <RouterProvider router={routers} />
      </AuthShell>
    </ConfigProvider>
  );
}

export default App;
