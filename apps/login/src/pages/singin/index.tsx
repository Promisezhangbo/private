import reactLogo from '@/assets/react.svg';
import { useNavigate } from 'react-router-dom';
import { message, Card, Typography, Image, Button, Flex, Form, Input, Checkbox } from 'antd';
import { delay } from '@/utils/mockRequest';

function Singin() {
  const navigate = useNavigate();

  const onFinish = async () => {
    const hide = message.loading({ content: '正在登录...', key: 'login' });
    try {
      await delay(800);
      hide();
      message.success({ content: '登录成功', key: 'login' });
      navigate('/home');
    } catch {
      hide();
      message.error('登录失败');
    }
  };

  return (
    <div className="login-page">
      <Card className="login-glass-card" variant="borderless">
        <div className="login-brand">
          <Image src={reactLogo} alt="" width={56} preview={false} />
          <Typography.Title level={4} className="login-brand-title">
            欢迎回来
          </Typography.Title>
        </div>
        <Form layout="vertical" onFinish={onFinish} initialValues={{ remember: true }}>
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="用户名或邮箱" autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder="密码" autoComplete="current-password" />
          </Form.Item>
          <Flex justify="space-between" align="center" className="login-form-row">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>记住我</Checkbox>
            </Form.Item>
            <Button type="link" onClick={() => navigate('/login/register')}>
              注册账号
            </Button>
          </Flex>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Singin;
