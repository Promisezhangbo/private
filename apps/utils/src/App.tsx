import { AntdLocaleProvider, I18nProvider } from '@packages/i18n';
import { RouterProvider } from 'react-router-dom';
import { routers } from './router';

const utilsTheme = {
  token: {
    colorBgLayout: 'transparent',
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 8,
  },
};

function App() {
  return (
    <I18nProvider namespaces={['utils']}>
      <AntdLocaleProvider theme={utilsTheme}>
        <RouterProvider router={routers} />
      </AntdLocaleProvider>
    </I18nProvider>
  );
}

export default App;
