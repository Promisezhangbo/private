import { createStock, getStockList, type ServerStockRecord } from '@/api/stockServer';
import { calcEndCost, STOCK_COST_DECIMALS } from '@/utils/stockCost';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Empty,
  Form,
  Input,
  InputNumber,
  Pagination,
  Space,
  Statistic,
  Table,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { STOCK_PRESETS } from './presets';
import './index.scss';

type FormValues = {
  stock_code: string;
  stock_name: string;
  init_cost: number;
  init_num: number;
  add_cost: number;
  add_num: number;
  commission: number;
};

const DEFAULT_COMMISSION = 5;

function recordToFormValues(record: ServerStockRecord): FormValues {
  return {
    stock_code: record.stock_code,
    stock_name: record.stock_name,
    init_cost: record.init_cost,
    init_num: record.init_num,
    add_cost: record.add_cost,
    add_num: record.add_num,
    commission: record.commission ?? DEFAULT_COMMISSION,
  };
}

function StockCost() {
  const [form] = Form.useForm<FormValues>();
  const [values, setValues] = useState<FormValues | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [activePresetCode, setActivePresetCode] = useState<string>();
  const [selectedRowId, setSelectedRowId] = useState<number>();

  const [list, setList] = useState<ServerStockRecord[]>([]);
  const [listTotal, setListTotal] = useState(0);
  const [listPage, setListPage] = useState(1);
  const [listPageSize, setListPageSize] = useState(10);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string>();
  const [codeFilterDraft, setCodeFilterDraft] = useState('');
  const [codeFilterQuery, setCodeFilterQuery] = useState('');

  const result = useMemo(() => {
    if (!values) return null;
    return calcEndCost({
      init_cost: values.init_cost,
      init_num: values.init_num,
      add_cost: values.add_cost,
      add_num: values.add_num,
      commission: values.commission,
    });
  }, [values]);

  const loadList = useCallback(async (page: number, pageSize: number, stockCode?: string) => {
    setListLoading(true);
    setListError(undefined);
    try {
      const pageData = await getStockList({
        page,
        pageSize,
        stock_code: stockCode?.trim() || undefined,
      });
      setList(pageData.items);
      setListTotal(pageData.total);
    } catch (e: unknown) {
      setListError(e instanceof Error ? e.message : '加载记录列表失败');
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadList(listPage, listPageSize, codeFilterQuery);
  }, [listPage, listPageSize, codeFilterQuery, loadList]);

  const applyToForm = (next: FormValues, options?: { rowId?: number; presetCode?: string }) => {
    form.setFieldsValue(next);
    setValues(next);
    setSelectedRowId(options?.rowId);
    setActivePresetCode(options?.presetCode);
    setSubmitError(undefined);
  };

  const fillPreset = (code: string, name: string) => {
    const matched = list.find((r) => r.stock_code === code);
    if (matched) {
      fillFromRecord(matched);
      return;
    }
    const current = form.getFieldsValue();
    applyToForm(
      {
        stock_code: code,
        stock_name: name,
        init_cost: current.init_cost,
        init_num: current.init_num,
        add_cost: current.add_cost,
        add_num: current.add_num,
        commission: current.commission ?? DEFAULT_COMMISSION,
      },
      { presetCode: code },
    );
  };

  const fillFromRecord = (record: ServerStockRecord) => {
    applyToForm(recordToFormValues(record), { rowId: record.id, presetCode: record.stock_code });
  };

  const onFinish = async (next: FormValues) => {
    setSubmitError(undefined);
    const end = calcEndCost({
      init_cost: next.init_cost,
      init_num: next.init_num,
      add_cost: next.add_cost,
      add_num: next.add_num,
      commission: next.commission,
    });
    if (end === null) {
      setValues(next);
      return;
    }
    setSubmitting(true);
    try {
      await createStock({
        stock_code: next.stock_code.trim(),
        stock_name: next.stock_name.trim(),
        init_cost: next.init_cost,
        init_num: next.init_num,
        add_cost: next.add_cost,
        add_num: next.add_num,
        commission: next.commission,
      });
      setValues(next);
      setListPage(1);
      await loadList(1, listPageSize, codeFilterQuery);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : '保存记录失败');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnsType<ServerStockRecord> = [
    { title: '代码', dataIndex: 'stock_code', width: 88 },
    { title: '名称', dataIndex: 'stock_name', ellipsis: true },
    {
      title: 'init_cost',
      dataIndex: 'init_cost',
      width: 88,
      align: 'right',
      render: (v: number) => v?.toFixed(STOCK_COST_DECIMALS),
    },
    {
      title: 'init_num',
      dataIndex: 'init_num',
      width: 80,
      align: 'right',
    },
    {
      title: 'add_cost',
      dataIndex: 'add_cost',
      width: 88,
      align: 'right',
      render: (v: number) => v?.toFixed(STOCK_COST_DECIMALS),
    },
    {
      title: 'add_num',
      dataIndex: 'add_num',
      width: 80,
      align: 'right',
    },
    {
      title: '佣金',
      dataIndex: 'commission',
      width: 64,
      align: 'right',
    },
    {
      title: 'end_cost',
      dataIndex: 'end_cost',
      width: 88,
      align: 'right',
      render: (v: number) => <strong>{v?.toFixed(STOCK_COST_DECIMALS)}</strong>,
    },
  ];

  const applyCodeFilter = (code: string) => {
    const trimmed = code.trim();
    setCodeFilterDraft(trimmed);
    setCodeFilterQuery(trimmed);
    setListPage(1);
  };

  return (
    <div className="utils-stock">
      <div className="utils-stock__inner">
        <Link to="/utils/list" className="utils-stock__back">
          <ArrowLeftOutlined /> 返回工具列表
        </Link>

        <Typography.Title level={4} className="utils-stock__title">
          股票持仓成本
        </Typography.Title>
        <Typography.Paragraph type="secondary" className="utils-stock__desc">
          顶部快捷选项填入代码与名称；点击下方表格行可回填该条记录的全部金额与数量，并在右侧查看计算结果。
        </Typography.Paragraph>

        {submitError && (
          <Alert type="error" showIcon message={submitError} className="utils-stock__alert" closable />
        )}

        <div className="utils-stock__layout">
          <Card className="utils-stock__panel utils-stock__panel--form" title="输入参数">
            <div className="utils-stock__presets">
              <Typography.Text type="secondary" className="utils-stock__presets-label">
                快捷选股
              </Typography.Text>
              <Space wrap size={[8, 8]}>
                {STOCK_PRESETS.map((p) => (
                  <Button
                    key={p.stock_code}
                    size="small"
                    type={activePresetCode === p.stock_code ? 'primary' : 'default'}
                    onClick={() => fillPreset(p.stock_code, p.stock_name)}
                  >
                    {p.stock_code} {p.stock_name}
                  </Button>
                ))}
              </Space>
            </div>

            <Form<FormValues>
              form={form}
              layout="vertical"
              initialValues={{ commission: DEFAULT_COMMISSION }}
              onFinish={(v) => void onFinish(v)}
              requiredMark="optional"
            >
              <div className="utils-stock__form-grid utils-stock__form-grid--meta">
                <Form.Item
                  label="股票代码 stock_code"
                  name="stock_code"
                  rules={[{ required: true, message: '请输入股票代码' }]}
                >
                  <Input maxLength={32} placeholder="例如 159365" />
                </Form.Item>
                <Form.Item
                  label="股票名称 stock_name"
                  name="stock_name"
                  rules={[{ required: true, message: '请输入股票名称' }]}
                >
                  <Input maxLength={128} placeholder="例如 恒指港股通ETF富国" />
                </Form.Item>
              </div>
              <div className="utils-stock__form-grid">
                <Form.Item
                  label="当前成本 init_cost（a）"
                  name="init_cost"
                  rules={[{ required: true, message: '请输入当前成本' }]}
                >
                  <InputNumber min={0} precision={3} style={{ width: '100%' }} placeholder="例如 10.50" />
                </Form.Item>
                <Form.Item
                  label="当前股数 init_num（b）"
                  name="init_num"
                  rules={[{ required: true, message: '请输入当前股数' }]}
                >
                  <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="例如 1000" />
                </Form.Item>
                <Form.Item
                  label="加仓成本 add_cost（c）"
                  name="add_cost"
                  rules={[{ required: true, message: '请输入加仓成本' }]}
                >
                  <InputNumber min={0} precision={3} style={{ width: '100%' }} placeholder="例如 9.80" />
                </Form.Item>
                <Form.Item
                  label="加仓股数 add_num（d）"
                  name="add_num"
                  rules={[{ required: true, message: '请输入加仓股数' }]}
                >
                  <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="例如 500" />
                </Form.Item>
              </div>
              <Form.Item label="佣金 commission" name="commission" rules={[{ required: true, message: '请输入佣金' }]}>
                <InputNumber min={0} precision={0} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item className="utils-stock__actions">
                <Button type="primary" htmlType="submit" loading={submitting}>
                  计算并保存
                </Button>
                <Button
                  onClick={() => {
                    form.resetFields();
                    form.setFieldsValue({ commission: DEFAULT_COMMISSION });
                    setValues(null);
                    setSubmitError(undefined);
                    setSelectedRowId(undefined);
                    setActivePresetCode(undefined);
                  }}
                >
                  重置
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card className="utils-stock__panel utils-stock__panel--result" title="计算结果 end_cost">
            {!values ? (
              <Empty description="填写参数或点击历史记录行" />
            ) : result === null ? (
              <Alert type="warning" showIcon message="init_num + add_num 须大于 0。" />
            ) : (
              <>
                <Statistic
                  title="摊薄后持仓成本 end_cost"
                  value={result}
                  precision={STOCK_COST_DECIMALS}
                  suffix="元 / 股"
                  valueStyle={{ color: 'var(--ant-color-primary)' }}
                />
                <div className="utils-stock__summary">
                  <Typography.Text type="secondary">当前表单</Typography.Text>
                  <Descriptions size="small" column={2} bordered className="utils-stock__summary-desc">
                    <Descriptions.Item label="代码">{values.stock_code}</Descriptions.Item>
                    <Descriptions.Item label="名称">{values.stock_name}</Descriptions.Item>
                    <Descriptions.Item label="init_cost">{values.init_cost}</Descriptions.Item>
                    <Descriptions.Item label="init_num">{values.init_num}</Descriptions.Item>
                    <Descriptions.Item label="add_cost">{values.add_cost}</Descriptions.Item>
                    <Descriptions.Item label="add_num">{values.add_num}</Descriptions.Item>
                    <Descriptions.Item label="佣金">{values.commission}</Descriptions.Item>
                    <Descriptions.Item label="end_cost">{result.toFixed(STOCK_COST_DECIMALS)}</Descriptions.Item>
                  </Descriptions>
                </div>
                <Typography.Paragraph type="secondary" className="utils-stock__formula">
                  [({values.init_cost} × {values.init_num}) + ({values.add_cost} × {values.add_num} +{' '}
                  {values.commission})] ÷ ({values.init_num} + {values.add_num}) = {result.toFixed(STOCK_COST_DECIMALS)}
                </Typography.Paragraph>
              </>
            )}
          </Card>
        </div>

        <Card className="utils-stock__history" title="历史记录（点击行回填表单）">
          {listError && <Alert type="error" showIcon message={listError} className="utils-stock__alert" />}
          <div className="utils-stock__table-toolbar">
            <Input.Search
              allowClear
              placeholder="按股票代码筛选"
              value={codeFilterDraft}
              onChange={(e) => setCodeFilterDraft(e.target.value)}
              onSearch={applyCodeFilter}
              className="utils-stock__table-filter"
            />
            <Space wrap size={[6, 6]} className="utils-stock__table-filter-quick">
              <Typography.Text type="secondary">快捷筛选：</Typography.Text>
              {STOCK_PRESETS.map((p) => (
                <Button
                  key={p.stock_code}
                  size="small"
                  type={codeFilterQuery === p.stock_code ? 'primary' : 'default'}
                  onClick={() => applyCodeFilter(p.stock_code)}
                >
                  {p.stock_code}
                </Button>
              ))}
              {codeFilterQuery && (
                <Button size="small" type="link" onClick={() => applyCodeFilter('')}>
                  清除筛选
                </Button>
              )}
            </Space>
          </div>
          <Table<ServerStockRecord>
            className="utils-stock__table"
            rowKey="id"
            size="small"
            loading={listLoading}
            columns={columns}
            dataSource={list}
            pagination={false}
            scroll={{ x: 720 }}
            locale={{ emptyText: '暂无记录，完成一次计算后将出现在此' }}
            rowClassName={(record) =>
              record.id === selectedRowId ? 'utils-stock__row--active' : 'utils-stock__row--clickable'
            }
            onRow={(record) => ({
              onClick: () => fillFromRecord(record),
            })}
          />
          <Pagination
            className="utils-stock__pagination"
            current={listPage}
            pageSize={listPageSize}
            total={listTotal}
            showSizeChanger
            pageSizeOptions={[10, 20, 50]}
            showTotal={(total) => `共 ${total} 条`}
            onChange={(page, pageSize) => {
              setListPage(page);
              setListPageSize(pageSize);
            }}
          />
        </Card>
      </div>
    </div>
  );
}

export default StockCost;
