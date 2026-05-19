import { AntdLocaleProvider, I18nProvider } from '@packages/i18n';
import { RouterProvider } from 'react-router-dom';
import { routers } from './router';

const appTheme = {
  token: {
    colorBgLayout: 'transparent',
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 8,
  },
};

function App() {
  return (
    <I18nProvider namespaces={['__NAME__']}>
      <AntdLocaleProvider theme={appTheme}>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <RouterProvider router={routers} />
        </div>
      </AntdLocaleProvider>
    </I18nProvider>
  );
}

export default App;
