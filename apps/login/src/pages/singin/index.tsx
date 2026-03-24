import reactLogo from '@/assets/react.svg';
import { useNavigate } from 'react-router-dom';
import { message, Card, Typography, Image, Button, Flex } from 'antd';
import { ProForm, ProFormText, ProFormCheckbox } from '@ant-design/pro-components';
import AuthShell from '@/components/AuthShell';
import { delay } from '@/utils/mockRequest';
function Singin() {
  const navigate = useNavigate();
  /** 提交登录：此处为假请求，接入真实接口时替换为 API 调用 */
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
    <AuthShell>
      <div className="login-page login-page--singin">
        <Card className="login-glass-card" variant='borderless'>
          <div className="login-brand">
            <Image src={reactLogo} alt="" width={56} preview={false} />
            <Typography.Title level={4} className="login-brand-title">
              欢迎回来
            </Typography.Title>
            <Typography.Text className="login-brand-subtitle">登录以继续使用</Typography.Text>
          </div>
          <ProForm
            onFinish={onFinish}
            initialValues={{ remember: true }}
            submitter={{
              searchConfig: { submitText: '登录' },
              resetButtonProps: { style: { display: 'none' } },
              submitButtonProps: { type: 'primary', size: 'large' },
            }}
          >
            <ProFormText
              name="username"
              label="用户名"
              placeholder="用户名或邮箱"
              rules={[{ required: true, message: '请输入用户名' }]}
            />
            <ProFormText
              name="password"
              label="密码"
              placeholder="密码"
              fieldProps={{ type: 'password' }}
              rules={[{ required: true, message: '请输入密码' }]}
            />
            <Flex justify="space-between" align="center" className="login-form-row">
              <ProFormCheckbox name="remember" noStyle>
                记住我
              </ProFormCheckbox>
              <Button type="link" onClick={() => navigate('/login/register')}>
                注册账号
              </Button>
            </Flex>
          </ProForm>
        </Card>
      </div>
    </AuthShell>
  );
}
export default Singin;
