import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu } from "antd";
import type { MenuProps } from 'antd';

const { Sider, Content, Header } = Layout;

function Layouts() {
  const navigate = useNavigate();
  const location = useLocation();

  // 当路径以 /login 开头时，不展示主应用的左侧导航（登录页为独立子应用）
  const isShowMain = !location.pathname.startsWith("/login");
  const selectedKey = location.pathname?.split('/')[1] || '';



  const items: MenuProps['items'] = [
    { key: 'home', label: '首页' },
    { key: 'agent', label: '子应用[Agent]' },
    { key: 'blog', label: '子应用[Blog]' },
    { key: 'login', label: '登录' }
  ];

  const onMenuSelect: MenuProps['onSelect'] = ({ key }) => {
    if (key === 'home') navigate('/home');
    else if (key === 'login') navigate('/login');
    else navigate('/' + key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {isShowMain && (
        <Sider width={220} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
          <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>主应用</div>
          <Menu mode="inline" selectedKeys={[selectedKey]} items={items} onSelect={onMenuSelect} />
        </Sider>
      )}

      <Layout>
        {isShowMain && <Header style={{ background: '#fff', padding: '0 16px' }}>欢迎来到主应用</Header>}
        <Content style={{ position: 'relative' }}>
          {isShowMain && <div style={{ position: 'absolute', width: '100%', height: '100%' }}><Outlet /></div>}

          <div style={{ height: isShowMain ? '100%' : '100vh' }}>
            <div id='sub-app' style={{ width: '100%' }} />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default Layouts;
