import { createStock, getStock, getStockList, type ServerStockRecord } from '@/api/stockServer';
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
  List,
  Modal,
  Pagination,
  Spin,
  Statistic,
  Typography,
} from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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

function StockCost() {
  const [form] = Form.useForm<FormValues>();
  const [values, setValues] = useState<FormValues | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const [list, setList] = useState<ServerStockRecord[]>([]);
  const [listTotal, setListTotal] = useState(0);
  const [listPage, setListPage] = useState(1);
  const [listPageSize, setListPageSize] = useState(10);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string>();

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailItem, setDetailItem] = useState<ServerStockRecord | null>(null);
  const [detailError, setDetailError] = useState<string>();

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

  const loadList = useCallback(async (page: number, pageSize: number) => {
    setListLoading(true);
    setListError(undefined);
    try {
      const pageData = await getStockList({ page, pageSize });
      setList(pageData.items);
      setListTotal(pageData.total);
    } catch (e: unknown) {
      setListError(e instanceof Error ? e.message : '加载记录列表失败');
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadList(listPage, listPageSize);
  }, [listPage, listPageSize, loadList]);

  const openDetail = (id: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError(undefined);
    setDetailItem(null);
    getStock(id)
      .then((item) => setDetailItem(item))
      .catch((e: unknown) => setDetailError(e instanceof Error ? e.message : '加载详情失败'))
      .finally(() => setDetailLoading(false));
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
      await loadList(1, listPageSize);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : '保存记录失败');
    } finally {
      setSubmitting(false);
    }
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
          字段与库表一致：init_cost(a)、init_num(b)、add_cost(c)、add_num(d)、commission、end_cost。公式：[(a×b) +
          (c×d + 佣金)] ÷ (b + d)
        </Typography.Paragraph>

        {submitError && (
          <Alert type="error" showIcon message={submitError} className="utils-stock__alert" closable />
        )}

        <div className="utils-stock__layout">
          <Card className="utils-stock__panel utils-stock__panel--form" title="输入参数">
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
                  <Input maxLength={32} placeholder="例如 600000" />
                </Form.Item>
                <Form.Item
                  label="股票名称 stock_name"
                  name="stock_name"
                  rules={[{ required: true, message: '请输入股票名称' }]}
                >
                  <Input maxLength={128} placeholder="例如 浦发银行" />
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
                  }}
                >
                  重置
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card className="utils-stock__panel utils-stock__panel--result" title="计算结果 end_cost">
            {!values ? (
              <Empty description="填写左侧参数并点击计算" />
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
                <Typography.Paragraph type="secondary" className="utils-stock__formula">
                  {values.stock_code} {values.stock_name} · [({values.init_cost} × {values.init_num}) + (
                  {values.add_cost} × {values.add_num} + {values.commission})] ÷ ({values.init_num} + {values.add_num}) ={' '}
                  {result.toFixed(STOCK_COST_DECIMALS)}
                </Typography.Paragraph>
              </>
            )}
          </Card>
        </div>

        <Card className="utils-stock__history" title="历史记录">
          {listError && <Alert type="error" showIcon message={listError} className="utils-stock__alert" />}
          <Spin spinning={listLoading}>
            <List
              dataSource={list}
              locale={{ emptyText: '暂无记录，完成一次计算后将出现在此' }}
              renderItem={(item) => (
                <List.Item
                  className="utils-stock__history-item"
                  actions={[
                    <Button key="detail" type="link" size="small" onClick={() => openDetail(item.id)}>
                      详情
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={`${item.stock_code} ${item.stock_name}`}
                    description={
                      <>
                        end_cost <strong>{item.end_cost.toFixed(STOCK_COST_DECIMALS)}</strong> 元/股 · 佣金{' '}
                        {item.commission} · #{item.id}
                      </>
                    }
                  />
                </List.Item>
              )}
            />
            {listTotal > 0 && (
              <Pagination
                className="utils-stock__pagination"
                current={listPage}
                pageSize={listPageSize}
                total={listTotal}
                showSizeChanger
                pageSizeOptions={[10, 20, 50]}
                onChange={(p, ps) => {
                  setListPage(p);
                  setListPageSize(ps);
                }}
              />
            )}
          </Spin>
        </Card>

        <Modal
          title="记录详情"
          open={detailOpen}
          onCancel={() => setDetailOpen(false)}
          footer={null}
          width={520}
          destroyOnClose
        >
          {detailLoading && <Spin />}
          {detailError && <Alert type="error" showIcon message={detailError} />}
          {detailItem && !detailLoading && (
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="id">{detailItem.id}</Descriptions.Item>
              <Descriptions.Item label="stock_code">{detailItem.stock_code}</Descriptions.Item>
              <Descriptions.Item label="stock_name">{detailItem.stock_name}</Descriptions.Item>
              <Descriptions.Item label="init_cost（a）">{detailItem.init_cost}</Descriptions.Item>
              <Descriptions.Item label="init_num（b）">{detailItem.init_num}</Descriptions.Item>
              <Descriptions.Item label="add_cost（c）">{detailItem.add_cost}</Descriptions.Item>
              <Descriptions.Item label="add_num（d）">{detailItem.add_num}</Descriptions.Item>
              <Descriptions.Item label="commission">{detailItem.commission}</Descriptions.Item>
              <Descriptions.Item label="end_cost">
                {detailItem.end_cost.toFixed(STOCK_COST_DECIMALS)} 元/股
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default StockCost;
