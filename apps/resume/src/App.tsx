import { AntdLocaleProvider, I18nProvider } from '@packages/i18n';
import { RouterProvider } from 'react-router-dom';
import { routers } from './router';

function App() {
  return (
    <I18nProvider namespaces={['resume']}>
      <AntdLocaleProvider>
        <RouterProvider router={routers} />
      </AntdLocaleProvider>
    </I18nProvider>
  );
}

export default App;
