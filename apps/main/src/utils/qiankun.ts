import { qiankunState } from '@/utils/qiankunGlobalState';
import { registerMicroApps, start } from 'qiankun';

const isDev = process.env.NODE_ENV === 'development';

export const apps = [
  {
    name: 'agent',
    entry: isDev ? '//localhost:9001' : '/agent/',
    container: '#sub-app',
    activeRule: '/agent',
    props: {},
  },
  {
    name: 'blog',
    entry: isDev ? '//localhost:9002' : '/blog/',
    container: '#sub-app',
    activeRule: '/blog',
    props: {},
  },
  {
    name: 'login',
    entry: isDev ? '//localhost:9003' : '/login/',
    container: '#sub-app',
    activeRule: '/login',
    props: {},
  },
  {
    name: 'skill',
    entry: isDev ? '//localhost:9004' : '/skill/',
    container: '#sub-app',
    activeRule: '/skill',
    props: {},
  },
  {
    name: 'resume',
    entry: isDev ? '//localhost:9005' : '/resume/',
    container: '#sub-app',
    activeRule: '/resume',
    props: {},
  },
];

export function registerAppsFn() {
  registerMicroApps(apps, {
    beforeLoad: async () => {},
    beforeMount: async (app) => {
      qiankunState.globalState.setGlobalState({ loading: true, loadingAppName: app.name });
    },
    afterMount: async (app) => {
      setTimeout(() => {
        qiankunState.globalState.setGlobalState({ loading: false, loadingAppName: app.name });
      }, 1000);
    },
    beforeUnmount: async () => {},
    afterUnmount: async () => {},
  });

  start({
    sandbox: {
      experimentalStyleIsolation: false,
    },
    prefetch: false,
  });
}
