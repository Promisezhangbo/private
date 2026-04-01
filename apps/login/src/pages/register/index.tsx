import { message, Card, Typography, Flex, Button, Form, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { delay } from '@/utils/mockRequest';

function Register() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async () => {
    const hide = message.loading({ content: '正在注册...', key: 'register' });
    try {
      await delay(800);
      hide();
      message.success({ content: '注册成功，请登录', key: 'register' });
      navigate('/login/singin');
    } catch {
      hide();
      message.error('注册失败');
    }
  };

  return (
    <div className="login-page login-page--register">
      <Card className="login-glass-card" variant="borderless">
        <div className="login-brand">
          <Typography.Title level={4} className="login-brand-title login-register-title">
            创建账号
          </Typography.Title>
        </div>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="请输入用户名" autoComplete="username" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱' },
            ]}
          >
            <Input placeholder="name@example.com" autoComplete="email" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder="至少 8 位字符" autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="确认密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请再次输入密码' },
              ({ getFieldValue }) => ({
                validator(_: unknown, value?: string) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="再次输入密码" autoComplete="new-password" />
          </Form.Item>
          <Flex justify="space-between" className="login-register-footer">
            <Button onClick={() => form.resetFields()}>重置</Button>
            <Button type="link" onClick={() => navigate('/login/singin')}>
              已有账号？登录
            </Button>
          </Flex>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              注册
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Register;
