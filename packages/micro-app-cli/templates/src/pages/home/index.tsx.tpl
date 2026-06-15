import { Typography } from 'antd';
import './index.scss';

function AppHome() {
  return (
    <div className="__NAME__-home">
      <div className="__NAME__-home__inner">
        <Typography.Title level={3}>__MENU_LABEL__</Typography.Title>
        <Typography.Paragraph type="secondary">
          这是新创建的微前端子应用 <Typography.Text code>__NAME__</Typography.Text>
          （端口 __PORT__）。可在 <Typography.Text code>apps/__NAME__</Typography.Text> 中继续开发业务页面。
        </Typography.Paragraph>
      </div>
    </div>
  );
}

export default AppHome;
