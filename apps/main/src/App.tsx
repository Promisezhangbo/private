import { I18nProvider } from '@packages/i18n';
import { router } from '@/router';
import QiankunProvider from './components/QiankunProvider';
import { ThemeRoot } from './theme/ThemeRoot';
import { RouterProvider } from 'react-router-dom';

function App() {
  return (
    <I18nProvider>
      <ThemeRoot>
        <QiankunProvider>
          <RouterProvider router={router} />
        </QiankunProvider>
      </ThemeRoot>
    </I18nProvider>
  );
}
export default App;
