const norm = (id) => id.replace(/\\/g, '/');

/**
 * 子应用生产构建共用：将 React / 路由 / qiankun / Ant Design 等拆成独立 chunk，
 * 便于浏览器并行请求与长期缓存；其余 node_modules 归入 vendor。
 * @param {string} id
 * @returns {string | undefined}
 */
export function appManualChunks(id) {
  if (!id.includes('node_modules')) return;
  const p = norm(id);

  if (
    /\/node_modules\/react\//.test(p) ||
    /\/node_modules\/react-dom\//.test(p) ||
    /\/node_modules\/scheduler\//.test(p)
  ) {
    return 'react-vendor';
  }

  // if (/\/node_modules\/(react-router|react-router-dom)\//.test(p)) {
  //   return "react-router";
  // }

  // if (/\/node_modules\/qiankun\//.test(p) || /\/node_modules\/vite-plugin-qiankun\//.test(p)) {
  //   return "qiankun";
  // }

  // if (/\/node_modules\/@ant-design\/pro-/.test(p)) {
  //   return 'antd-pro-vendor';
  // }

  // if (/\/node_modules\/@ant-design\/x-markdown\//.test(p)) {
  //   return 'antd-x-vendor';
  // }

  // if (/\/node_modules\/antd\//.test(p) || /\/node_modules\/@ant-design\//.test(p)) {
  //   return 'antd-vendor';
  // }

  return 'vendor';
}
