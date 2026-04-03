import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { RouterProvider } from 'react-router-dom';
import AuthShell from '@/components/AuthShell';
import { routers } from '@/router';

const loginTheme = {
  token: {
    colorPrimary: '#14b8a6',
    // 与 @packages/style-config $radius-sm / $radius-md（8px / 12px）一致
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 8,
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
