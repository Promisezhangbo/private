import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Select } from 'antd';
import { useEffect, useMemo, useState } from 'react';
const { Content, Header } = Layout;
const MENU_KEYS = ['home', 'agent', 'blog', 'login'] as const;
function Layouts() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentMenu, setCurrentMenu] = useState<string>('home');
  /** 登录子应用全屏展示时不渲染主应用顶栏 */
  const showHeader = currentMenu !== 'login';
  const items = useMemo(
    () => [
      { key: 'home', label: '首页' },
      { key: 'agent', label: 'Agent' },
      { key: 'blog', label: 'Blog' },
      { key: 'login', label: '登录' },
    ],
    [],
  );
  /** 从 URL 第一段同步当前选中的菜单 */
  useEffect(() => {
    const segment = location.pathname.split('/')[1] || 'home';
    setCurrentMenu(MENU_KEYS.includes(segment as (typeof MENU_KEYS)[number]) ? segment : 'home');
  }, [location.pathname]);
  const onMenuSelect = (key: string) => {
    setCurrentMenu(key);
    if (key === 'home') navigate('/home');
    else navigate(`/${key}`);
  };
  return (
    <Layout className="main-app">
      {showHeader && (
        <Header className="main-header">
          <Menu
            mode="horizontal"
            selectedKeys={[currentMenu]}
            items={items}
            onClick={({ key }) => onMenuSelect(String(key))}
          />
          <Select
            size="small"
            defaultValue="K"
            options={[
              { value: 'K', label: '主题 K' },
              { value: 'M', label: '主题 M' },
            ]}
            style={{ width: 100 }}
          />
        </Header>
      )}
      <Content className="main-content" style={{ height: showHeader ? undefined : '100vh' }}>
        <Outlet />
        <div id="sub-app" />
      </Content>
    </Layout>
  );
}
export default Layouts;
