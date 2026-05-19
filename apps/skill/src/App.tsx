import { AntdLocaleProvider, I18nProvider } from '@packages/i18n';
import { motion } from 'framer-motion';
import { RouterProvider } from 'react-router-dom';
import { routers } from './router';

const skillTheme = {
  token: {
    colorBgLayout: 'transparent',
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 8,
  },
};

function App() {
  return (
    <I18nProvider namespaces={['skill']}>
      <AntdLocaleProvider theme={skillTheme}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
          style={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <RouterProvider router={routers} />
        </motion.div>
      </AntdLocaleProvider>
    </I18nProvider>
  );
}

export default App;
