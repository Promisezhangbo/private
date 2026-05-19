import { useT } from '@packages/i18n';
import { useNavigate } from 'react-router-dom';
import { message, Flex, Button, Form, Input, Card, Typography, Image } from 'antd';
import logo from '@/assets/logo.png';
import { delay } from '@/utils/delay';
import './index.scss';

function Register() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { t } = useT('login');

  const onFinish = async () => {
    const hide = message.loading({ content: t('register.loading'), key: 'register' });
    try {
      await delay(800);
      hide();
      message.success({ content: t('register.success'), key: 'register' });
      navigate('/login/singin');
    } catch {
      hide();
      message.error(t('register.failed'));
    }
  };

  return (
    <div className="login-page login-page--register">
      <Card className="login-glass-card" variant="borderless">
        <div className="login-brand">
          <Image src={logo} alt="" width={56} height={56} preview={false} />
          <Typography.Title level={4} className="login-brand-title">
            {t('register.title')}
          </Typography.Title>
        </div>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="username"
            label={t('register.username')}
            rules={[{ required: true, message: t('register.usernameRequired') }]}
          >
            <Input placeholder={t('register.usernamePlaceholder')} autoComplete="username" />
          </Form.Item>
          <Form.Item
            name="email"
            label={t('register.email')}
            rules={[
              { required: true, message: t('register.emailRequired') },
              { type: 'email', message: t('register.emailInvalid') },
            ]}
          >
            <Input placeholder={t('register.emailPlaceholder')} autoComplete="email" />
          </Form.Item>
          <Form.Item
            name="password"
            label={t('register.password')}
            rules={[{ required: true, message: t('register.passwordRequired') }]}
          >
            <Input.Password placeholder={t('register.passwordPlaceholder')} autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirm"
            label={t('register.confirmPassword')}
            dependencies={['password']}
            rules={[
              { required: true, message: t('register.confirmRequired') },
              ({ getFieldValue }) => ({
                validator(_: unknown, value?: string) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('register.confirmMismatch')));
                },
              }),
            ]}
          >
            <Input.Password placeholder={t('register.confirmPlaceholder')} autoComplete="new-password" />
          </Form.Item>
          <Flex justify="space-between" className="login-register-footer">
            <Button onClick={() => form.resetFields()}>{t('register.reset')}</Button>
            <Button type="link" onClick={() => navigate('/login/singin')}>
              {t('register.goSignin')}
            </Button>
          </Flex>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              {t('register.submit')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Register;
