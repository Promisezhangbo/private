import { ApiOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Card, Collapse, Steps, Table, Tabs, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
import { CodeBlock } from './CodeBlock';
import { ProjectOverview } from './ProjectOverview';
import {
  API_OPERATIONS,
  FACTORY_NAME,
  INIT_SNIPPET,
  PROD_BASE,
  SPEC_FILE,
  type ApiOperationDemo,
  WORKFLOW_STEPS,
  WRAPPER_SNIPPET,
} from './data';
import './index.scss';

const METHOD_COLOR: Record<ApiOperationDemo['method'], string> = {
  GET: 'blue',
  POST: 'green',
};

function OpenApiDemo() {
  const columns: ColumnsType<ApiOperationDemo> = [
    {
      title: '模块',
      dataIndex: 'tag',
      width: 72,
      render: (tag: ApiOperationDemo['tag']) => <Tag>{tag}</Tag>,
    },
    {
      title: '方法',
      dataIndex: 'method',
      width: 72,
      render: (m: ApiOperationDemo['method']) => <Tag color={METHOD_COLOR[m]}>{m}</Tag>,
    },
    { title: '路径', dataIndex: 'path', width: 140, ellipsis: true },
    { title: 'operationId', dataIndex: 'operationId', width: 120 },
    { title: '说明', dataIndex: 'summary', ellipsis: true },
  ];

  return (
    <div className="utils-page openapi-demo">
      <div className="utils-page__inner">
        <Link to="/utils/list" className="openapi-demo__back">
          <ArrowLeftOutlined /> 返回工具列表
        </Link>

        <Typography.Title level={4} className="utils-page__title">
          <ApiOutlined className="openapi-demo__title-icon" />
          OpenAPI SDK 使用说明
        </Typography.Title>
        <Typography.Paragraph type="secondary" className="utils-page__subtitle">
          基于本仓库 <Typography.Text code>{SPEC_FILE}</Typography.Text> 与{' '}
          <Typography.Text code>openapi-axios-sdk</Typography.Text> 生成的{' '}
          <Typography.Text code>{FACTORY_NAME}</Typography.Text>。本页仅展示代码示例，不会发起真实请求。
        </Typography.Paragraph>

        <Alert
          type="info"
          showIcon
          className="openapi-demo__alert"
          message="文档与代码同步方式"
          description={
            <>
              修改 YAML 后执行 <Typography.Text code>pnpm run generate</Typography.Text>，业务代码从{' '}
              <Typography.Text code>@packages/openapi</Typography.Text> 导入。生产环境 BASE 默认为{' '}
              <Typography.Text code>{PROD_BASE}</Typography.Text>，本地可在{' '}
              <Typography.Text code>apps/utils/.env.local</Typography.Text> 设置{' '}
              <Typography.Text code>VITE_API_SERVER_BASE</Typography.Text>。
            </>
          }
        />

        <Tabs
          className="openapi-demo__tabs"
          items={[
            {
              key: 'project',
              label: '项目说明',
              children: <ProjectOverview />,
            },
            {
              key: 'workflow',
              label: '接入步骤',
              children: (
                <Card>
                  <Steps
                    direction="vertical"
                    size="small"
                    current={-1}
                    items={WORKFLOW_STEPS.map((s) => ({
                      title: s.title,
                      description: s.desc,
                    }))}
                  />
                </Card>
              ),
            },
            {
              key: 'sdk',
              label: 'SDK 示例',
              children: (
                <div className="openapi-demo__stack">
                  <Card title="1. 初始化客户端" size="small">
                    <CodeBlock code={INIT_SNIPPET} title="OpenApiApiServer" />
                  </Card>
                  <Card title="2. 业务封装（可选）" size="small">
                    <Typography.Paragraph type="secondary">
                      可参考 <Typography.Text code>apps/utils/src/api/stockServer.ts</Typography.Text>{' '}
                      对生成方法做薄封装，统一处理 <Typography.Text code>data</Typography.Text> 为空等情况。
                    </Typography.Paragraph>
                    <CodeBlock code={WRAPPER_SNIPPET} title="封装示例" />
                  </Card>
                </div>
              ),
            },
            {
              key: 'ops',
              label: '接口与调用示例',
              children: (
                <div className="openapi-demo__stack">
                  <Card title="接口一览" size="small">
                    <Table<ApiOperationDemo>
                      rowKey="operationId"
                      size="small"
                      pagination={false}
                      columns={columns}
                      dataSource={API_OPERATIONS}
                      scroll={{ x: 640 }}
                    />
                  </Card>
                  <Card title="按 operationId 调用（复制即用）" size="small">
                    <Collapse
                      accordion
                      items={API_OPERATIONS.map((op) => ({
                        key: op.operationId,
                        label: (
                          <span className="openapi-demo__collapse-label">
                            <Tag color={METHOD_COLOR[op.method]}>{op.method}</Tag>
                            <Typography.Text code>{op.path}</Typography.Text>
                            <Typography.Text type="secondary"> — {op.summary}</Typography.Text>
                          </span>
                        ),
                        children: (
                          <CodeBlock
                            code={`// 假定已执行：const apiServer = OpenApiApiServer({ ... });\n\n${op.callSnippet}`}
                            title={op.operationId}
                          />
                        ),
                      }))}
                    />
                  </Card>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}

export default OpenApiDemo;
