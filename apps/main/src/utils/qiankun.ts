import { qiankunState } from "@/utils/qiankunGlobalState";
import { registerMicroApps, start } from "qiankun";

export const apps = [
  {
    name: "agent",
    entry: "//localhost:9001",
    container: "#sub-app",
    activeRule: "/agent",
    props: {}
  },
  {
    name: "blog",
    entry: "//localhost:9002",
    container: "#sub-app",
    activeRule: "/blog",
    props: {}
  },
  {
    name: "login",
    entry: "//localhost:9003",
    container: "#sub-app",
    activeRule: "/login",
    props: {}
  }
];

export function registerAppsFn() {
  registerMicroApps(apps, {
    beforeLoad: async (app) => {
      console.log("全局加载前", app);
    },
    beforeMount: async (app) => {
      qiankunState.globalState.setGlobalState({ loading: true, loadingAppName: app.name });

      console.log("全局挂载qiankun");
    },
    afterMount: async (app) => {
      setTimeout(() => {
        qiankunState.globalState.setGlobalState({ loading: false, loadingAppName: app.name });
      }, 1000);
      console.log("全局挂载后", app, qiankunState.globalState);
    },
    beforeUnmount: async () => {},
    afterUnmount: async () => {}
  });

  start({
    sandbox: {
      experimentalStyleIsolation: false
    },
    prefetch: false
  });
}
