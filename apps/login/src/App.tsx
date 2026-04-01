import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Layouts from '@/layouts';

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
      <Layouts />
    </ConfigProvider>
  );
}

export default App;
