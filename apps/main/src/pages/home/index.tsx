import { Card, Descriptions, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
import {
  API_SERVER_PROD_URL,
  API_SERVER_SPEC,
  BACKEND_API_ROWS,
  BACKEND_COMMANDS,
  BACKEND_DIR_TREE,
  BACKEND_ENV_ROWS,
  BACKEND_INTRO,
  type BackendCommandRow,
} from './backendData';
import './index.scss';
import { ARCHITECTURE, OVERVIEW, PACKAGES, SUB_APPS, TECH_STACK } from './preset';

function Home() {
  const backendCmdColumns: ColumnsType<BackendCommandRow> = [
    { title: '位置', dataIndex: 'where', width: 140 },
    {
      title: '命令',
      dataIndex: 'command',
      width: 360,
      render: (cmd: string) => <Typography.Text code>{cmd}</Typography.Text>,
    },
    { title: '说明', dataIndex: 'desc' },
  ];

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
          <Descriptions.Item label="后端">{TECH_STACK.backend.join(' · ')}</Descriptions.Item>
          <Descriptions.Item label="质量与协作">{TECH_STACK.quality.join(' · ')}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        className="dash-panel dash-panel--full"
        variant="outlined"
        title="后端（backend / api-server）"
        extra={
          <Typography.Link href={API_SERVER_PROD_URL} target="_blank" rel="noopener noreferrer">
            生产环境
          </Typography.Link>
        }
      >
        {BACKEND_INTRO.map((p) => (
          <Typography.Paragraph key={p} type="secondary" className="dash-backend-para">
            {p}
          </Typography.Paragraph>
        ))}
        <Typography.Paragraph type="secondary" className="dash-backend-para">
          OpenAPI 契约：<Typography.Text code>{API_SERVER_SPEC}</Typography.Text>
          {' · '}
          <Link to="/utils/openapi">SDK 使用说明（utils）</Link>
        </Typography.Paragraph>
        <pre className="dash-backend-pre">{BACKEND_DIR_TREE}</pre>
        <Typography.Title level={5} className="dash-backend-subtitle">
          常用命令
        </Typography.Title>
        <Table<BackendCommandRow>
          rowKey={(r) => `${r.where}-${r.command}`}
          size="small"
          pagination={false}
          columns={backendCmdColumns}
          dataSource={BACKEND_COMMANDS}
          scroll={{ x: 640 }}
          className="dash-backend-table"
        />
        <Typography.Title level={5} className="dash-backend-subtitle">
          HTTP 模块
        </Typography.Title>
        <Descriptions column={1} size="small" bordered className="dash-desc">
          {BACKEND_API_ROWS.map((row) => (
            <Descriptions.Item key={row.module} label={row.module}>
              <div>
                <Typography.Text>{row.routes}</Typography.Text>
                <br />
                <Typography.Text type="secondary">表：{row.table}</Typography.Text>
              </div>
            </Descriptions.Item>
          ))}
        </Descriptions>
        <Typography.Title level={5} className="dash-backend-subtitle">
          环境变量（backend/api-server/.env.local）
        </Typography.Title>
        <Descriptions column={1} size="small" className="dash-desc">
          {BACKEND_ENV_ROWS.map((row) => (
            <Descriptions.Item key={row.name} label={<Typography.Text code>{row.name}</Typography.Text>}>
              {row.desc}
            </Descriptions.Item>
          ))}
        </Descriptions>
      </Card>

      <Card className="dash-panel dash-panel--full" variant="outlined" title="架构说明">
        <Descriptions column={1} size="small" className="dash-desc dash-desc--arch">
          <Descriptions.Item label="路由与挂载">{ARCHITECTURE.routing}</Descriptions.Item>
          <Descriptions.Item label="构建与资源">{ARCHITECTURE.buildDeploy}</Descriptions.Item>
          <Descriptions.Item label="全局状态">{ARCHITECTURE.globalState}</Descriptions.Item>
          <Descriptions.Item label="运行时隔离">{ARCHITECTURE.runtimeIsolation}</Descriptions.Item>
          <Descriptions.Item label="样式与主题">{ARCHITECTURE.styling}</Descriptions.Item>
          <Descriptions.Item label="后端与 API">{ARCHITECTURE.backend}</Descriptions.Item>
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
              {p.links?.length ? (
                <div className="dash-package-links">
                  {p.links.map((link) =>
                    link.external ? (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dash-package-link"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link key={link.href} to={link.href} className="dash-package-link">
                        {link.label}
                      </Link>
                    ),
                  )}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export default Home;
