import { AntdLocaleProvider, I18nProvider } from '@packages/i18n';
import { router } from '@/router';
import { RouterProvider } from 'react-router-dom';

function App() {
  return (
    <I18nProvider namespaces={['blog']}>
      <AntdLocaleProvider>
        <RouterProvider router={router} />
      </AntdLocaleProvider>
    </I18nProvider>
  );
}

export default App;
