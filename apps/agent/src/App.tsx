import { AntdLocaleProvider, I18nProvider } from '@packages/i18n';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

export default function App() {
  return (
    <I18nProvider namespaces={['agent']}>
      <AntdLocaleProvider>
        <div className="agent-app-root">
          <RouterProvider router={router} />
        </div>
      </AntdLocaleProvider>
    </I18nProvider>
  );
}
