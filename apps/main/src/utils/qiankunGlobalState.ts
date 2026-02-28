import { initGlobalState, type OnGlobalStateChangeCallback } from "qiankun";

type InitQiankunState = {
  loading: boolean;
  loadingAppName: string;
};

const initState: InitQiankunState = {
  loading: false,
  loadingAppName: ""
};

// 创建全局状态容器
const globalState = initGlobalState(initState);
// 暴露订阅方法
export const subscribeGlobalState = (callback: OnGlobalStateChangeCallback) => {
  return globalState.onGlobalStateChange(callback);
};

export const qiankunState = {
  globalState
};
