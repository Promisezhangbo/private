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
  }
];

export function registerAppsFn() {
  registerMicroApps(apps, {
    beforeLoad: async props => {
      console.log("加载前", props);
    },
    afterMount: async props => {
      console.log("挂载后", props);
    },
    afterUnmount: async props => {
      console.log("卸载后", props);
    },
    beforeMount: async props => {
      console.log("挂载前", props);
    },
    beforeUnmount: async props => {
      console.log("卸载前", props);
    }
  });
  start({
    // prefetch: true,
    sandbox: {
      strictStyleIsolation: true, // 样式隔离保留
      experimentalStyleIsolation: true
    }
  });
}
