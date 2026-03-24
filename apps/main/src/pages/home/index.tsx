import { Card, Typography, Space, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import './index.scss';
import { RobotOutlined, BookOutlined, LoginOutlined, ArrowRightOutlined } from '@ant-design/icons';
/** 控制台展示用：技术栈与架构关键词（与仓库依赖大致对应） */
const TECH_TAGS = [
  'Monorepo · pnpm workspace',
  '微前端 · qiankun',
  'vite-plugin-qiankun',
  'React 19',
  'React Router 7',
  'Vite 8',
  'TypeScript 5.9',
  'Ant Design 6',
  'ESLint 9 · Prettier · Husky',
] as const;
const apps = [
  { key: 'agent', title: 'Agent', description: 'AI 对话与子应用演示', icon: <RobotOutlined /> },
  { key: 'blog', title: 'Blog', description: '文章列表与详情', icon: <BookOutlined /> },
  { key: 'login', title: 'Login', description: '登录 / 注册流程', icon: <LoginOutlined /> },
] as const;
function Home() {
  const navigate = useNavigate();
  return (
    <div className="main-home-shell">
      <Card className="dash-hero" variant='outlined'>
        <Typography.Title level={3} className="dash-hero-title">
          控制台
        </Typography.Title>
        <Typography.Text className="dash-hero-lead">
          本项目为基于 <strong>qiankun</strong> 的微前端示例仓库：主应用（main）负责布局与路由壳层，
          子应用（Agent / Blog / Login）独立构建、独立部署目录，开发期通过 Vite 与{' '}
          <strong>vite-plugin-qiankun</strong> 接入微前端生命周期。
          下方卡片可跳转至各子应用页面。
        </Typography.Text>
        <Typography.Text className="dash-hero-tech-title">技术要点</Typography.Text>
        <Space className="dash-hero-tags" size={[8, 8]} wrap>
          {TECH_TAGS.map((label) => (
            <Tag key={label} variant='outlined'>
              {label}
            </Tag>
          ))}
        </Space>
      </Card>
      <Typography.Title level={5} className="dash-section-title">
        子应用入口
      </Typography.Title>
      <div className="dash-grid">
        {apps.map((app) => (
          <Card
            key={app.key}
            className="dash-card"
            bordered={false}
            onClick={() => navigate(`/${app.key}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate(`/${app.key}`)}
          >
            <Typography.Title level={5} className="dash-card-title-row">
              <span className="dash-card-icon">{app.icon}</span>
              {app.title}
            </Typography.Title>
            <Typography.Paragraph type="secondary" className="dash-card-desc">
              {app.description}
            </Typography.Paragraph>
            <Typography.Link>
              进入 <ArrowRightOutlined />
            </Typography.Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
export default Home;
