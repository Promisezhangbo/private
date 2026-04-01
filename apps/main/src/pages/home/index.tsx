import { Card, Typography, Space, Tag } from 'antd';
import './index.scss';

const TECH_TAGS = [
  'Monorepo · pnpm workspace',
  'qiankun 2.x · vite-plugin-qiankun',
  'React 19 · React Router 7',
  'Vite 8 · TypeScript 5.9',
  'Ant Design 6 · Sass 模块',
  'Oxlint · Stylelint · Husky',
] as const;

function Home() {
  return (
    <div className="main-home-shell">
      <Card className="dash-hero" variant="outlined">
        <Typography.Title level={3} className="dash-hero-title">
          微前端工作台
        </Typography.Title>
        <Typography.Paragraph className="dash-hero-lead">
          主应用（main）负责顶栏布局与路由壳层；技能、简历、AI、Blog、登录等模块以独立子应用形式接入，各自构建产物由{' '}
          <strong>qiankun</strong> 在运行时挂载。开发环境通过 <strong>Vite 8</strong> 与{' '}
          <strong>vite-plugin-qiankun</strong> 对齐微前端生命周期。
        </Typography.Paragraph>
        <Typography.Text className="dash-hero-tech-title">技术栈</Typography.Text>
        <Space className="dash-hero-tags" size={[8, 8]} wrap>
          {TECH_TAGS.map((label) => (
            <Tag key={label} className="dash-hero-tag">
              {label}
            </Tag>
          ))}
        </Space>
      </Card>
    </div>
  );
}

export default Home;
