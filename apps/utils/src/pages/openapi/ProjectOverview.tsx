import { Card, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CodeBlock } from './CodeBlock';
import {
  MONOREPO_INTRO,
  OPENAPI_CONFIG_PATH,
  OPENAPI_CONFIG_SNIPPET,
  OPENAPI_CONSUMERS,
  OPENAPI_PACKAGE_JSON_PATH,
  OPENAPI_PACKAGE_SCRIPTS,
  OPENAPI_PATH_ROWS,
  REPO_DIR_TREE,
  type PackageScriptRow,
} from './data';

type PathRow = (typeof OPENAPI_PATH_ROWS)[number];

export function ProjectOverview() {
  const pathColumns: ColumnsType<PathRow> = [
    {
      title: '路径',
      dataIndex: 'path',
      width: 300,
      render: (p: string) => <Typography.Text code>{p}</Typography.Text>,
    },
    { title: '说明', dataIndex: 'desc' },
  ];

  const scriptColumns: ColumnsType<PackageScriptRow> = [
    {
      title: '执行位置',
      dataIndex: 'where',
      width: 140,
    },
    {
      title: '命令',
      dataIndex: 'command',
      width: 320,
      render: (cmd: string) => <Typography.Text code>{cmd}</Typography.Text>,
    },
    { title: '说明', dataIndex: 'desc' },
  ];

  return (
    <div className="openapi-demo__stack">
      <Card title="Monorepo 概览" size="small">
        {MONOREPO_INTRO.map((p) => (
          <Typography.Paragraph key={p} type="secondary" className="openapi-demo__para">
            {p}
          </Typography.Paragraph>
        ))}
      </Card>

      <Card
        title="配置文件 openapi.config.ts"
        size="small"
        extra={<Typography.Text code>{OPENAPI_CONFIG_PATH}</Typography.Text>}
      >
        <Typography.Paragraph type="secondary" className="openapi-demo__para">
          生成 CLI <Typography.Text code>openapi-gen</Typography.Text> 读取的配置文件，位于{' '}
          <Typography.Text strong>packages/openapi</Typography.Text> 包根目录（非仓库根、非各子应用内）。
          修改 <Typography.Text code>apiDir</Typography.Text> / <Typography.Text code>outDir</Typography.Text>{' '}
          后需重新执行 generate。
        </Typography.Paragraph>
        <CodeBlock code={OPENAPI_CONFIG_SNIPPET} title={OPENAPI_CONFIG_PATH} />
      </Card>

      <Card
        title="package.json 命令"
        size="small"
        extra={<Typography.Text code>{OPENAPI_PACKAGE_JSON_PATH}</Typography.Text>}
      >
        <Typography.Paragraph type="secondary" className="openapi-demo__para">
          包内 scripts 通过 <Typography.Text code>-c ./openapi.config.ts</Typography.Text> 指定配置；仓库根{' '}
          <Typography.Text code>package.json</Typography.Text> 的 <Typography.Text code>generate</Typography.Text>{' '}
          经 Turbo 转调本包。
        </Typography.Paragraph>
        <Table<PackageScriptRow>
          rowKey={(r) => `${r.where}-${r.command}`}
          size="small"
          pagination={false}
          columns={scriptColumns}
          dataSource={OPENAPI_PACKAGE_SCRIPTS}
          scroll={{ x: 720 }}
        />
      </Card>

      <Card title="OpenAPI 相关目录（精简）" size="small">
        <CodeBlock code={REPO_DIR_TREE} title="目录树" />
        <Typography.Paragraph type="secondary" className="openapi-demo__tree-hint">
          标记 ★ 的路径与 openapi-axios-sdk 生成、消费直接相关；gen/ 由 pnpm run generate 产出，通常不提交 Git。
        </Typography.Paragraph>
      </Card>

      <Card title="关键文件说明" size="small">
        <Table<PathRow>
          rowKey="path"
          size="small"
          pagination={false}
          columns={pathColumns}
          dataSource={OPENAPI_PATH_ROWS}
          scroll={{ x: 560 }}
        />
      </Card>

      <Card title="子应用中的引用示例" size="small">
        <ul className="openapi-demo__consumer-list">
          {OPENAPI_CONSUMERS.map((c) => (
            <li key={c.path}>
              <Typography.Text code>{c.path}</Typography.Text>
              <Typography.Text type="secondary"> — {c.desc}</Typography.Text>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
