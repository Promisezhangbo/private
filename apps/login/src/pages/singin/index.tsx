import logo from '@/assets/logo.png';
import { useT } from '@packages/i18n';
import { useNavigate } from 'react-router-dom';
import { message, Button, Flex, Form, Input, Checkbox, Image, Typography } from 'antd';
import { delay } from '@/utils/delay';
import './index.scss';

function Singin() {
  const navigate = useNavigate();
  const { t } = useT('login');

  const onFinish = async () => {
    const hide = message.loading({ content: t('signin.loading'), key: 'login' });
    try {
      await delay(800);
      hide();
      message.success({ content: t('signin.success'), key: 'login' });
      navigate('/home');
    } catch {
      hide();
      message.error(t('signin.failed'));
    }
  };

  return (
    <div className="login-page login-page--singin">
      <div className="login-glass-card">
        <div className="login-brand">
          <Image src={logo} alt="" width={56} height={56} preview={false} />
          <Typography.Title level={4} className="login-brand-title">
            {t('signin.welcome')}
          </Typography.Title>
        </div>
        <Form layout="vertical" onFinish={onFinish} initialValues={{ remember: true }}>
          <Form.Item
            name="username"
            label={t('signin.username')}
            rules={[{ required: true, message: t('signin.usernameRequired') }]}
          >
            <Input placeholder={t('signin.usernamePlaceholder')} autoComplete="username" />
          </Form.Item>
          <Form.Item
            name="password"
            label={t('signin.password')}
            rules={[{ required: true, message: t('signin.passwordRequired') }]}
          >
            <Input.Password placeholder={t('signin.passwordPlaceholder')} autoComplete="current-password" />
          </Form.Item>
          <Flex justify="space-between" align="center" className="login-form-row">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>{t('signin.remember')}</Checkbox>
            </Form.Item>
            <Button type="link" onClick={() => navigate('/login/register')}>
              {t('signin.goRegister')}
            </Button>
          </Flex>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              {t('signin.submit')}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default Singin;
