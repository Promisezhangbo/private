import { message, Card, Typography, Flex, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ProForm, ProFormText, type ProFormInstance } from '@ant-design/pro-components';
import { useRef } from 'react';
import AuthShell from '@/components/AuthShell';
import { delay } from '@/utils/mockRequest';
function Register() {
  const navigate = useNavigate();
  const formRef = useRef<ProFormInstance>(null);
  /** 注册成功后跳转登录页 */
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
    <AuthShell>
      <Card className="login-glass-card" bordered={false} style={{ maxWidth: 440 }}>
        <Typography.Title level={4} className="login-brand-title" style={{ textAlign: 'center', marginBottom: 4 }}>
          创建账号
        </Typography.Title>
        <span className="login-sub">填写基本信息即可完成注册（演示环境）</span>
        <ProForm
          formRef={formRef}
          onFinish={onFinish}
          submitter={{
            searchConfig: { submitText: '注册' },
            resetButtonProps: { style: { display: 'none' } },
            submitButtonProps: { type: 'primary', size: 'large', style: { width: '100%' } },
          }}
        >
          <ProFormText name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]} />
          <ProFormText
            name="email"
            label="邮箱"
            rules={[{ required: true, type: 'email', message: '请输入正确的邮箱' }]}
          />
          <ProFormText
            name="password"
            label="密码"
            fieldProps={{ type: 'password' }}
            rules={[{ required: true, message: '请输入密码' }]}
          />
          <ProFormText
            name="confirm"
            label="确认密码"
            fieldProps={{ type: 'password' }}
            dependencies={['password']}
            rules={[
              { required: true, message: '请再次输入密码' },
              ({ getFieldValue }) => ({
                validator(_: unknown, value?: string) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          />
          <Flex justify="space-between" style={{ marginBottom: 4 }}>
            <Button onClick={() => formRef.current?.resetFields()}>重置</Button>
            <Button type="link" onClick={() => navigate('/login/singin')}>
              已有账号？登录
            </Button>
          </Flex>
        </ProForm>
      </Card>
    </AuthShell>
  );
}
export default Register;
