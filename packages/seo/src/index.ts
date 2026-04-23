export type DocumentSeoInput = {
  title: string;
  description: string;
  keywords?: string;
  /** 用于 canonical 与 og:url；省略时使用当前页 pathname */
  pathname?: string;
  robots?: string;
  ogType?: string;
};

function upsertMetaByName(doc: Document, name: string, content: string) {
  let el = doc.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = doc.createElement('meta');
    el.setAttribute('name', name);
    doc.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertMetaByProperty(doc: Document, property: string, content: string) {
  let el = doc.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = doc.createElement('meta');
    el.setAttribute('property', property);
    doc.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLinkCanonical(doc: Document, href: string) {
  let el = doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = doc.createElement('link');
    el.setAttribute('rel', 'canonical');
    doc.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * 在浏览器主文档上同步 title、description、Open Graph、Twitter Card 与 canonical。
 * qiankun 子应用嵌入时仍操作宿主 document，便于爬虫与分享预览读取一致元数据。
 */
export function applyDocumentSeo(doc: Document, input: DocumentSeoInput) {
  const win = doc.defaultView;
  const origin = win?.location?.origin ?? '';
  const path =
    input.pathname ?? win?.location?.pathname ?? '/';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = origin ? `${origin}${normalizedPath}` : normalizedPath;

  doc.documentElement.lang = 'zh-CN';
  doc.title = input.title;

  upsertMetaByName(doc, 'description', input.description);
  if (input.keywords) {
    upsertMetaByName(doc, 'keywords', input.keywords);
  }
  upsertMetaByName(doc, 'robots', input.robots ?? 'index, follow');

  upsertMetaByProperty(doc, 'og:title', input.title);
  upsertMetaByProperty(doc, 'og:description', input.description);
  upsertMetaByProperty(doc, 'og:url', url);
  upsertMetaByProperty(doc, 'og:type', input.ogType ?? 'website');
  upsertMetaByProperty(doc, 'og:locale', 'zh_CN');

  upsertMetaByName(doc, 'twitter:card', 'summary_large_image');
  upsertMetaByName(doc, 'twitter:title', input.title);
  upsertMetaByName(doc, 'twitter:description', input.description);

  upsertLinkCanonical(doc, url);
}

/** 各子应用 / 主控制台默认文案（pathname 默认取当前 URL） */
export const appSeoPresets = {
  main: {
    title: '张博 工作台 | 控制台',
    description:
      '张博的个人工作台：基于 pnpm workspace 与 qiankun，主应用承载布局与微前端容器，子应用独立构建并按路由挂载。',
    keywords: 'zhangbo, 张博, 微前端, qiankun, React, Vite, 工作台, monorepo',
    pathname: '/home',
  },
  agent: {
    title: 'AI 工作台 | 张博',
    description: '对话式 AI 工作台：流式与非流式大模型调用、Markdown 渲染与可配置模型能力。',
    keywords: 'zhangbo, 张博, AI, LLM, Markdown, 对话, Agent',
  },
  blog: {
    title: '技术博客 | 张博',
    description: '技术文章列表与详情，本地内容驱动的阅读体验。',
    keywords: 'zhangbo, 张博, 博客, 技术文章, 前端',
  },
  login: {
    title: '登录与注册 | 张博',
    description: '账户登录与注册入口。',
    keywords: 'zhangbo, 张博, 登录, 注册',
    robots: 'noindex, nofollow',
  },
  skill: {
    title: '技能图谱 | 张博',
    description: '技术栈与熟练度等信息的可视化展示。',
    keywords: 'zhangbo, 张博, 技能, 可视化, 技术栈',
  },
  resume: {
    title: '在线简历 | 张博',
    description: '在线简历：技能、经历、项目与教育等结构化展示，支持导出 PDF。',
    keywords: 'zhangbo, 张博, 简历, 在线简历, PDF',
  },
} as const satisfies Record<string, DocumentSeoInput>;
