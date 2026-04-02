import { Card, Descriptions, Tag, Typography } from 'antd';
import './index.scss';
import { ARCHITECTURE, OVERVIEW, PACKAGES, SUB_APPS, TECH_STACK } from './preset';

function Home() {
  return (
    <div className="main-home-shell">
      <Card className="dash-hero dash-hero--intro" variant="outlined">
        <Typography.Title level={3} className="dash-hero-title">
          {OVERVIEW.title}
        </Typography.Title>
        <Typography.Paragraph className="dash-hero-lead">{OVERVIEW.subtitle}</Typography.Paragraph>
      </Card>

      <Card className="dash-panel dash-panel--full" variant="outlined" title="技术栈速览">
        <Descriptions column={1} size="small" className="dash-desc">
          <Descriptions.Item label="运行时">{TECH_STACK.runtime.join(' · ')}</Descriptions.Item>
          <Descriptions.Item label="构建">{TECH_STACK.build.join(' · ')}</Descriptions.Item>
          <Descriptions.Item label="仓库">{TECH_STACK.workspace.join(' · ')}</Descriptions.Item>
          <Descriptions.Item label="质量与协作">{TECH_STACK.quality.join(' · ')}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card className="dash-panel dash-panel--full" variant="outlined" title="架构说明">
        <Descriptions column={1} size="small" className="dash-desc dash-desc--arch">
          <Descriptions.Item label="路由与挂载">{ARCHITECTURE.routing}</Descriptions.Item>
          <Descriptions.Item label="构建与资源">{ARCHITECTURE.buildDeploy}</Descriptions.Item>
          <Descriptions.Item label="全局状态">{ARCHITECTURE.globalState}</Descriptions.Item>
          <Descriptions.Item label="运行时隔离">{ARCHITECTURE.runtimeIsolation}</Descriptions.Item>
          <Descriptions.Item label="样式与主题">{ARCHITECTURE.styling}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card className="dash-panel dash-panel--full" variant="outlined" title="功能模块与应用矩阵">
        <Descriptions column={1} bordered size="small" className="dash-matrix">
          {SUB_APPS.map((app) => (
            <Descriptions.Item
              key={app.key}
              label={
                <span className="dash-matrix-label">
                  <Tag color={app.role === '主应用' ? 'blue' : 'green'}>{app.role}</Tag>
                  <code className="dash-matrix-code">{app.name}</code>
                </span>
              }
            >
              <div className="dash-matrix-body">
                <Typography.Text type="secondary">
                  路由 <code>{app.path}</code>
                  {app.devPort ? (
                    <>
                      · 开发端口 <code>{app.devPort}</code>
                    </>
                  ) : null}
                </Typography.Text>
                <div className="dash-matrix-desc">{app.desc}</div>
              </div>
            </Descriptions.Item>
          ))}
        </Descriptions>
      </Card>

      <Card className="dash-panel dash-panel--full" variant="outlined" title="共享包（packages）">
        <ul className="dash-package-list">
          {PACKAGES.map((p) => (
            <li key={p.name}>
              <Typography.Text strong className="dash-package-name">
                {p.name}
              </Typography.Text>
              <Typography.Paragraph className="dash-package-desc">{p.desc}</Typography.Paragraph>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export default Home;
