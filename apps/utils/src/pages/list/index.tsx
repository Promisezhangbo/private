import { LineChartOutlined } from '@ant-design/icons';
import { Card, Typography } from 'antd';
import { Link } from 'react-router-dom';
import './index.scss';

const UTIL_ITEMS = [
  {
    key: 'stock-cost',
    title: '股票持仓成本',
    desc: '根据当前持仓与加仓信息，计算摊薄后的持仓成本（含默认 5 元佣金）。',
    path: '/utils/stock-cost',
    icon: <LineChartOutlined />,
  },
] as const;

function UtilsList() {
  return (
    <div className="utils-page">
      <div className="utils-page__inner">
        <Typography.Title level={4} className="utils-page__title">
          工具箱
        </Typography.Title>
        <Typography.Paragraph type="secondary" className="utils-page__subtitle">
          实用小工具集合，后续可在此继续追加。
        </Typography.Paragraph>
        <div className="utils-page__grid">
          {UTIL_ITEMS.map((item) => (
            <Link key={item.key} to={item.path} className="utils-page__card-link">
              <Card hoverable className="utils-page__card">
                <div className="utils-page__card-icon">{item.icon}</div>
                <Typography.Title level={5} className="utils-page__card-title">
                  {item.title}
                </Typography.Title>
                <Typography.Paragraph type="secondary" className="utils-page__card-desc">
                  {item.desc}
                </Typography.Paragraph>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UtilsList;
