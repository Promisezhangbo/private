import { useAppTheme, type AppThemeMode } from '@/theme/useAppTheme';
import './index.scss';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Select } from 'antd';
import { useEffect, useMemo, useState } from 'react';
const { Content, Header } = Layout;
const MENU_KEYS = ['home', 'agent', 'blog', 'login'] as const;
const MICRO_APP_KEYS = new Set<string>(['agent', 'blog', 'login']);
function Layouts() {
  const { mode, setMode } = useAppTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentMenu, setCurrentMenu] = useState<string>('home');
  /** 登录子应用全屏展示时不渲染主应用顶栏 */
  const showHeader = currentMenu !== 'login';
  /** 微前端子应用路由：内容区去 padding，背景铺满主应用可视区域 */
  const segment = location.pathname.split('/')[1] || 'home';
  const isMicroShell = MICRO_APP_KEYS.has(segment);
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
    const seg = location.pathname.split('/')[1] || 'home';
    setCurrentMenu(MENU_KEYS.includes(seg as (typeof MENU_KEYS)[number]) ? seg : 'home');
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
            className="main-header-theme-select"
            value={mode}
            onChange={(v) => setMode(v as AppThemeMode)}
            options={[
              { value: 'light', label: '浅色' },
              { value: 'dark', label: '暗色' },
            ]}
            aria-label="切换主题"
          />
        </Header>
      )}
      <Content
        className={`main-content ${showHeader ? '' : ' main-content--login-viewport'}`}
      >
        <div
          className={`main-content--flush${isMicroShell ? ' main-content--micro' : ''}`}
        >
          <Outlet />
          <div id="sub-app" />
        </div>
      </Content>
    </Layout>
  );
}
export default Layouts;
