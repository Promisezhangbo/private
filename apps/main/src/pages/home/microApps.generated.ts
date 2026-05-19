/** AUTO-GENERATED — 请勿手改。运行 pnpm micro-app:sync 或 create/remove 后自动更新。 */

export const MICRO_APP_SUB_APPS = [
  {
    key: 'skill',
    name: 'skill',
    path: '/skill',
    devPort: '9004',
    role: '子应用',
    desc: "技能图谱展示：技术栈熟练度等可视化（含动效）。",
  },
  {
    key: 'resume',
    name: 'resume',
    path: '/resume',
    devPort: '9005',
    role: '子应用',
    desc: "在线简历：技能、工作经历、项目、教育与自我评价等结构化展示；样式与主题与主应用对齐。导出为下载静态文件 apps/resume/public/xx.pdf（构建后同源路径 /resume/xx.pdf）。",
  },
  {
    key: 'agent',
    name: 'agent',
    path: '/agent',
    devPort: '9001',
    role: '子应用',
    desc: "对话式 AI 工作台：流式/非流式 LLM 调用、Markdown 渲染(@ant-design/x-markdown),可通过环境变量配置模型 Key。",
  },
  {
    key: 'blog',
    name: 'blog',
    path: '/blog',
    devPort: '9002',
    role: '子应用',
    desc: "技术博客：文章列表与详情、本地 posts 数据驱动的阅读体验。",
  },
  {
    key: 'utils',
    name: 'utils',
    path: '/utils',
    devPort: '9006',
    role: '子应用',
    desc: "工具箱：股票持仓成本、OpenAPI SDK 使用说明（基于 api-server.yaml 的静态演示）等页面。",
  },
  {
    key: 'login',
    name: 'login',
    path: '/login',
    devPort: '9003',
    role: '子应用',
    desc: "登录与注册:独立构建与部署入口,qiankun 场景下开发期通过固定 publicPath 保证静态资源指向子应用 origin。",
  },
] as const;
