import { calcStockAvgCost, STOCK_COST_DECIMALS } from '@/utils/stockCost';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Empty, Form, InputNumber, Statistic, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './index.scss';

type FormValues = {
  currentCost: number;
  currentShares: number;
  addCost: number;
  addShares: number;
  commission: number;
};

const DEFAULT_COMMISSION = 5;

function StockCost() {
  const [form] = Form.useForm<FormValues>();
  const [values, setValues] = useState<FormValues | null>(null);

  const result = useMemo(() => {
    if (!values) return null;
    return calcStockAvgCost({
      currentCost: values.currentCost,
      currentShares: values.currentShares,
      addCost: values.addCost,
      addShares: values.addShares,
      commission: values.commission,
    });
  }, [values]);

  const onFinish = (next: FormValues) => {
    setValues(next);
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
          无税费，佣金默认 5 元。公式：[(a×b) + (c×d + 佣金)] ÷ (b + d)
        </Typography.Paragraph>

        <div className="utils-stock__layout">
          <Card className="utils-stock__panel utils-stock__panel--form" title="输入参数">
            <Form<FormValues>
              form={form}
              layout="vertical"
              initialValues={{ commission: DEFAULT_COMMISSION }}
              onFinish={onFinish}
              requiredMark="optional"
            >
              <div className="utils-stock__form-grid">
                <Form.Item
                  label="当前成本价 a（元）"
                  name="currentCost"
                  rules={[{ required: true, message: '请输入当前成本价' }]}
                >
                  <InputNumber min={0} precision={3} style={{ width: '100%' }} placeholder="例如 10.50" />
                </Form.Item>
                <Form.Item
                  label="当前持股数 b"
                  name="currentShares"
                  rules={[{ required: true, message: '请输入当前持股数' }]}
                >
                  <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="例如 1000" />
                </Form.Item>
                <Form.Item
                  label="加仓成本价 c（元）"
                  name="addCost"
                  rules={[{ required: true, message: '请输入加仓成本价' }]}
                >
                  <InputNumber min={0} precision={3} style={{ width: '100%' }} placeholder="例如 9.80" />
                </Form.Item>
                <Form.Item
                  label="加仓股数 d"
                  name="addShares"
                  rules={[{ required: true, message: '请输入加仓股数' }]}
                >
                  <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="例如 500" />
                </Form.Item>
              </div>
              <Form.Item label="佣金（元）" name="commission" rules={[{ required: true, message: '请输入佣金' }]}>
                <InputNumber min={0} precision={2} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item className="utils-stock__actions">
                <Button type="primary" htmlType="submit">
                  计算持仓成本
                </Button>
                <Button
                  onClick={() => {
                    form.resetFields();
                    form.setFieldsValue({ commission: DEFAULT_COMMISSION });
                    setValues(null);
                  }}
                >
                  重置
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card className="utils-stock__panel utils-stock__panel--result" title="计算结果">
            {!values ? (
              <Empty description="填写左侧参数并点击计算" />
            ) : result === null ? (
              <Alert type="warning" showIcon message="持股总数须大于 0 才能计算成本。" />
            ) : (
              <>
                <Statistic
                  title="摊薄后持仓成本"
                  value={result}
                  precision={STOCK_COST_DECIMALS}
                  suffix="元 / 股"
                  valueStyle={{ color: 'var(--ant-color-primary)' }}
                />
                <Typography.Paragraph type="secondary" className="utils-stock__formula">
                  计算过程：[({values.currentCost} × {values.currentShares}) + ({values.addCost} ×{' '}
                  {values.addShares} + {values.commission})] ÷ ({values.currentShares} + {values.addShares}) ={' '}
                  {result.toFixed(STOCK_COST_DECIMALS)}
                </Typography.Paragraph>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default StockCost;
