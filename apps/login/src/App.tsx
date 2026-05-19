import { AntdLocaleProvider, I18nProvider } from '@packages/i18n';
import { RouterProvider } from 'react-router-dom';
import AuthShell from '@/components/AuthShell';
import LoginSeoSync from '@/components/LoginSeoSync';
import { routers } from '@/router';

const loginTheme = {
  token: {
    colorPrimary: '#14b8a6',
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
    <I18nProvider namespaces={['login']}>
      <AntdLocaleProvider theme={loginTheme}>
        <LoginSeoSync />
        <AuthShell>
          <RouterProvider router={routers} />
        </AuthShell>
      </AntdLocaleProvider>
    </I18nProvider>
  );
}

export default App;
