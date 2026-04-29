/**
 * 简历正文(Web 展示源)
 * 在保留真实经历与量化数据的前提下,按工程化表达习惯做过润色:术语统一、笔误修正、STAR 化表述。
 */

export const profile = {
  name: '张博',
  meta: '前端开发 · 5 年经验 | 28 岁 | 15270882756@163.com(同号) | 本科',
  portfolio: 'https://promisezhangbo.github.io',
} as const;

/** 约 10 条:合并相近能力,避免与项目段落逐字重复 */
export const skills: string[] = [
  'React / Vue:Hooks 与函数式为主组织中后台;可阅读维护存量 Vue,与 React 栈并行协作。',
  'TypeScript:Props、领域模型与接口响应类型约束;习惯用收窄与工具类型减少运行时意外。',
  '样式与响应式:Flex / Grid;Less / SCSS / Tailwind 做组件封装、变量与主题扩展。',
  '组件与文档:Ant Design 深度使用;基于 Sense Design 二次封装、dumi 沉淀示例与 API。',
  '复杂表单与可视化:react-hook-form 动态表单与联动;ECharts 运营指标与数据看板。',
  '多端:Taro、React Native 项目经验;熟悉构建差异、调试与体验对齐的常见处理。',
  '工程化脚手架:Umi(约定路由、dva)、Vite;pnpm workspace + Turborepo 管理多包与缓存。',
  '构建优化:Webpack / Vite 环境变量、代码分割、HMR、产物体积与依赖分析。',
  '接口层与质量:axios、鉴权与错误拦截;OpenAPI → TS 生成;ESLint / Prettier / Husky / Commitlint 规范网。',
  '微前端与交付:qiankun 接入、路由与样式隔离、主子通信;Docker 与 CI/CD 基础,关注可回滚发布。',
];

export type ResumeWorkExperienceItem = {
  company: string;
  role: string;
  /** 一段总述:角色定位 + 业务域 */
  summary: string;
  /** 分条亮点,与项目经验呼应,便于 HR 快速扫读 */
  highlights: string[];
  stack: string;
};

export const workExperience: ResumeWorkExperienceItem[] = [
  {
    company: '上海微创软件股份有限公司',
    role: 'Web 前端开发工程师 | 2022.09 - 至今',
    summary:
      '参与商汤系企业级控制台与平台类产品:负责前端方案、研发协同与发布闭环,工作重心在微前端基座、组件库与构建治理。',
    highlights: [
      '大装置多产品线:控制台与运营侧迭代,推动微前端拆分与跨团队 UI / 物料复用。',
      'Agent 知识库:从 0 参与基座与工程规范落地,并参与部署与线上维护。',
      'Sensed:维护组件库与 sensed-icons,私有 npm 发版与文档站 Docker 内网发布;主导文档与构建链升级,本地与生产构建耗时降至可日常迭代的量级。',
    ],
    stack: 'React、Umi、Vite、qiankun、TypeScript、Ant Design、Sense Design、dumi、Webpack、pnpm、Monorepo、Docker',
  },
  {
    company: '中电金信软件有限公司',
    role: 'Web 前端开发工程师 | 2021.03 - 2022.08',
    summary:
      '服务于游戏发行与腾讯海外创作者运营:在 React / Vue 栈下交付商业项目,共性能力集中在复杂表单、上传、Umi 内置国际化(locale)与第三方登录对接。',
    highlights: [
      '游戏侧:提审、渠道打包等系统端到端前端交付,支撑上架与运营效率。',
      '腾讯 IEGG:PUBGM / AOV 海外创作者平台(国际版和平精英、国际版王者荣耀生态),多端管理端与用户端,涵盖社媒绑定、站外数据与赏金评估、任务素材、国际化与数据中心等模块。',
      '多项目并行:通过组件抽象与约定控制重复建设,参与评审与发布,保障节奏与稳定性。',
    ],
    stack: 'React、Vue、Umi、Ant Design、react-hook-form、ECharts、Google Cloud、腾讯云、YouTube、玉符 SSO',
  },
];

export type ResumeProjectBlock =
  | { type: 'link'; text: string; href: string }
  | { type: 'paragraph'; label?: string; text: string }
  | { type: 'bullets'; label?: string; items: string[] }
  | { type: 'lines'; label?: string; items: string[] };

export type ResumeProject = {
  title: string;
  blocks: ResumeProjectBlock[];
};

export const projects: ResumeProject[] = [
  {
    title: '商汤大装置',
    blocks: [
      { type: 'link', text: '项目地址:https://www.sensecore.cn', href: 'https://www.sensecore.cn' },
      {
        type: 'paragraph',
        label: '项目描述:',
        text: 'AI 算力控制台:云存储、云网络等模块的前端建设;多团队协同下的资源编排与高并发访问体验。',
      },
      {
        type: 'paragraph',
        label: '技术栈:',
        text: 'Umi、qiankun、React、Sense Design、Monorepo、Turborepo、pnpm、TypeScript',
      },
      {
        type: 'bullets',
        label: '项目职责:',
        items: [
          '·  负责 AOSS / AFS 等存储与 EIP / VPC 等网络及运营后台的需求落地与持续迭代。',
          '·  基于 Sense Design 封装可配置业务组件,统一多业务线交互与视觉。',
          '·  大文件分片上传与断点续传方案,提升弱网场景成功率与可观测性。',
        ],
      },
    ],
  },
  {
    title: '量子城市 Agent 知识库',
    blocks: [
      {
        type: 'paragraph',
        label: '项目描述:',
        text: '企业知识管理与智能问答:文档、检索、审核与智能写作等能力,服务 Agent 场景下的检索与协作。',
      },
      {
        type: 'paragraph',
        label: '技术栈:',
        text: 'Vite、qiankun、React、Ant Design、axios、React Router、Husky、ESLint、Prettier、Docker',
      },
      {
        type: 'bullets',
        label: '项目职责:',
        items: [
          '·  搭建 Vite + qiankun 基座,划清主子边界,降低后续模块接入成本。',
          '·  Husky + Commitlint + ESLint + Prettier 提交前拦截,格式类问题显著下降。',
          '·  OpenAPI → TS 生成请求与类型,减少手写样板;参与 Docker 化部署与线上迭代。',
        ],
      },
    ],
  },
  {
    title: 'Sensed 组件库',
    blocks: [
      {
        type: 'paragraph',
        label: '项目描述:',
        text: '基于 Ant Design v4.16 fork 的私有组件库:统一大装置业务线 UI;同步维护图标库 sensed-icons。在保留 fork 定制的前提下,将源码渐进迁移至 Ant Design v5 能力体系,并对标官方 v5 的新增与演进组件;配合 dumi 文档与示例降低多业务线接入与升级成本。',
      },
      {
        type: 'paragraph',
        label: '技术栈:',
        text: 'React、dumi、Webpack、TypeScript、pnpm、react-components、Docker、公司私有 npm',
      },
      {
        type: 'bullets',
        label: '工作内容:',
        items: [
          '·  主导 bisheng → dumi、Webpack 5、TS 5、pnpm 迁移;本地启动约 2min → 10s,生产构建约 15min → 3min,迁移成本降低 80%。',
          '·  跟随新版 react-components 演进,在 fork 组件上对齐能力升级:补齐 API / 交互与边界行为,同步 dumi 示例与回归用例,降低业务线升级成本。',
          '·  版本迭代、缺陷与兼容性治理;发版与变更说明、多业务线对接;可配置业务组件统一多业务线交互与视觉。',
          '·  发版与站点:sensed 与 sensed-icons 版本发布至公司私有 npm;Sensed 文档站通过 Docker 构建镜像并发布到内部站点,相关流水线与线上问题由本人持续维护。',
        ],
      },
    ],
  },
  {
    title: '腾讯 IEGG · PUBGM / AOV 海外创作者平台(管理端 + 用户端)',
    blocks: [
      {
        type: 'link',
        text: '项目地址:https://sg.creatorhub.pubgmobile.com(需科学上网访问)',
        href: 'https://sg.creatorhub.pubgmobile.com',
      },
      {
        type: 'paragraph',
        label: '项目描述:',
        text: '面向海外市场的 PUBGM(《和平精英》国际版)与 AOV(《王者荣耀》国际版)内容生态:吸引创作者产出游戏向视频,支持绑定 YouTube、Instagram、Facebook 等社媒;创作者将视频与相关素材同步至站内即可参与任务与赏金结算。平台会拉取各绑定渠道上对应素材的点赞量、播放量等互动指标,纳入赏金评估与结算,为发行侧规模化用户原创内容供给与投放提供抓手。',
      },
      {
        type: 'paragraph',
        label: '技术栈:',
        text: 'React、dva、Umi、tea-component、react-hook-form、Swiper、ECharts、Google Cloud、腾讯云、玉符 SSO',
      },
      {
        type: 'bullets',
        label: '主要工作:',
        items: [
          '·  维护 4 个 PC 应用(管理端 / 用户端):落地 YouTube、Instagram、Facebook 等社媒 OAuth 与账号绑定(授权回调、解绑、绑定态与站内业务字段同步),并覆盖任务与素材投稿、权限与角色、奖励与结算配置等模块的需求落地、联调与线上问题闭环。',
          '·  站外互动数据(点赞、播放量等)在站内的展示与任务 / 赏金规则联动;按运营侧需求交付数据中心与 ECharts 运营看板,关注指标口径与列表、图表体验。',
          '·  沉淀可复用的业务组件与复杂表单工具;上传、批量处理与 Google Cloud / 腾讯云大文件链路的稳定性治理,包括失败重试、异常提示与边界场景排查。',
          '·  国际化:基于 Umi 内置 locale,在 PUBGM、AOV 用户端维护近 20 个国家与地区的语言包、路由级切换与缺漏修复,与产品、翻译协作排期与验收。',
        ],
      },
    ],
  },
  {
    title: '游戏提审系统',
    blocks: [
      {
        type: 'paragraph',
        label: '项目描述:',
        text: '多应用商店上架场景:资料预校验与提报流程,降低驳回与排期风险。',
      },
      {
        type: 'paragraph',
        label: '技术栈:',
        text: 'React、dva、Umi、react-hook-form、tea-component、Sass、腾讯云 COS、IndexedDB',
      },
      {
        type: 'bullets',
        label: '工作内容:',
        items: [
          '·  核心页面与模块端到端实现;react-hook-form 抽象复杂校验。',
          '·  IndexedDB 缓存菜单与操作态;COS 分片上传解决大文件直传 App Store Connect 场景。',
        ],
      },
    ],
  },
  {
    title: 'Ko咖啡(小程序)',
    blocks: [
      {
        type: 'paragraph',
        label: '项目描述:',
        text: '为自动咖啡设备提供微信扫码点单:进店、选品、下单与分享等基础闭环,对接线下设备点单场景。',
      },
      {
        type: 'paragraph',
        label: '技术栈:',
        text: 'React、Taro(微信小程序)、TypeScript',
      },
      {
        type: 'bullets',
        label: '项目职责:',
        items: [
          '·  基于 Taro 搭建工程(页面、tabBar、权限等),登录、支付、分享等走微信能力与 Taro 封装 API。',
          '·  通过 subpackages 拆分主包与分包并做懒加载,缓解小程序包体积与首包压力。',
          '·  在复杂跳转场景结合 getCurrentPages 与 reLaunch,规避路由栈深度上限带来的异常。',
          '·  列表页用 IntersectionObserver 驱动分页请求,减少首屏数据量与无效请求。',
        ],
      },
    ],
  },
];

export type ResumeEducationItem = {
  school: string;
  major: string;
  degree: string;
  period: string;
};

export const education: ResumeEducationItem[] = [
  {
    school: '南昌教育学院',
    major: '工商企业管理',
    degree: '大专',
    period: '2017.9 - 2020.7',
  },
  {
    school: '南昌大学',
    major: '行政管理',
    degree: '本科',
    period: '2021.2 - 2024.1',
  },
];

export const selfEvaluation =
  '五年前端,长期 React 中后台与平台型产品;近三年侧重微前端(Umi / Vite + qiankun)与 Monorepo。熟悉组件库维护、性能与构建治理,习惯用规范与自动化降低协作成本,多项目并行下能稳住交付与线上问题闭环。';
