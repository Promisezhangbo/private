import { Card, List, Typography, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';

const apps = [
  { key: 'agent', title: 'Agent 子应用', description: '演示第一个子应用' },
  { key: 'blog', title: 'Blog 子应用', description: '演示博客子应用' },
  { key: 'login', title: 'Login 子应用', description: '演示登录/注册子应用' }
];

function Home() {
  const navigate = useNavigate();

  return (
    <Card>
      <Typography.Title level={4}>父应用控制台</Typography.Title>
      <Typography.Paragraph>从左侧选择子应用，右侧容器会展示对应子应用内容。</Typography.Paragraph>

      <List
        dataSource={apps}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta title={item.title} description={item.description} />
            <Space>
              <Button type="primary" onClick={() => navigate('/' + item.key)}>打开</Button>
            </Space>
          </List.Item>
        )}
      />
    </Card>
  );
}

export default Home;
