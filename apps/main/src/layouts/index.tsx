import {
  microAppBlogSurfaceKeys,
  microAppMenuEntries,
  microAppMenuPaths,
} from '@/generated/micro-app-shell.generated';
import { useAppTheme, type AppThemeMode } from '@/theme/useAppTheme';
import './index.scss';
import { SiteLocaleSwitcher } from '@packages/i18n';
import { appSeoPresets, applyDocumentSeo } from '@packages/seo';
import { MenuOutlined } from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button, Drawer, Grid, Layout, Menu, Select } from 'antd';
import { useEffect, useMemo, useState } from 'react';
const { Content, Header } = Layout;

const menuMap = [{ key: 'home', label: '首页', sub: false }, ...microAppMenuEntries];

const MENU_KEYS = menuMap.map((k) => k.key);

/** 与各子应用 router 默认页对齐，减少一次 in-app Navigate */
const MENU_PATH: Record<string, string> = {
  home: '/home',
  ...microAppMenuPaths,
};

function Layouts() {
  const screens = Grid.useBreakpoint();
  const isCompactNav = screens.md === false;
  const { mode, setMode } = useAppTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentMenu, setCurrentMenu] = useState<string>('home');
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const menuItems = useMemo(
    () => menuMap.map((k) => ({ key: k.key, label: k.label })),
    [],
  );
  /** 登录子应用全屏展示时不渲染主应用顶栏 */
  const showHeader = currentMenu !== 'login';
  /** 微前端子应用路由：内容区去 padding，背景铺满主应用可视区域 */
  const segment = location.pathname.split('/')[1] || 'home';
  const isMicroShell = menuMap
    .filter((k) => k.sub)
    .map((t) => t.key)
    .includes(segment);
  /** 与对应子应用 #app-root 使用同一套 Blog 底纹变量，避免子应用 JS 未到前内容区短暂露出主壳渐变 */
  const microBlogSurface =
    isMicroShell && (microAppBlogSurfaceKeys as readonly string[]).includes(segment);
  /** 从 URL 第一段同步当前选中的菜单 */
  useEffect(() => {
    const seg = location.pathname.split('/')[1] || 'home';
    setCurrentMenu(MENU_KEYS.includes(seg as (typeof MENU_KEYS)[number]) ? seg : 'home');
  }, [location.pathname]);
  /** 控制台首页：同步宿主文档 SEO；子路由由各子应用在 mount 时写入 */
  useEffect(() => {
    const seg = location.pathname.split('/').filter(Boolean)[0] || 'home';
    if (seg === 'home') {
      applyDocumentSeo(document, appSeoPresets.main);
    }
  }, [location.pathname]);
  const onMenuSelect = (key: string) => {
    navigate(MENU_PATH[key] ?? `/${key}`);
    setCurrentMenu(key);
  };
  const onNavSelect = (key: string) => {
    onMenuSelect(key);
    setNavDrawerOpen(false);
  };
  return (
    <Layout className="main-app">
      {showHeader && (
        <Header className="main-header">
          {isCompactNav && (
            <Button
              type="text"
              className="main-header-menu-btn"
              icon={<MenuOutlined />}
              aria-label="打开导航菜单"
              onClick={() => setNavDrawerOpen(true)}
            />
          )}
          {!isCompactNav && (
            <Menu
              className="main-header-nav main-header-nav--desktop"
              mode="horizontal"
              selectedKeys={[currentMenu]}
              items={menuItems}
              onClick={({ key }) => onMenuSelect(String(key))}
            />
          )}
          <div className="main-header-actions">
            <SiteLocaleSwitcher className="main-header-locale-select" />
            <Select
              size="small"
              className="main-header-theme-select"
              variant="borderless"
              value={mode}
              onChange={(v) => setMode(v as AppThemeMode)}
              options={[
                { value: 'light', label: '浅色' },
                { value: 'dark', label: '暗色' },
              ]}
              aria-label="切换主题"
            />
          </div>
          <Drawer
            title="导航"
            placement="left"
            width={280}
            className="main-header-drawer"
            open={navDrawerOpen}
            onClose={() => setNavDrawerOpen(false)}
          >
            <Menu
              mode="inline"
              selectedKeys={[currentMenu]}
              items={menuItems}
              onClick={({ key }) => onNavSelect(String(key))}
            />
          </Drawer>
        </Header>
      )}
      <Content className={`main-content ${showHeader ? '' : ' main-content--login-viewport'}`}>
        <div
          className={`main-content--flush${isMicroShell ? ' main-content--micro' : ''}${microBlogSurface ? ' main-content--micro-placeholder-blog' : ''}`}
        >
          {segment === 'home' && <Outlet />}
          <div id="sub-app" />
        </div>
      </Content>
    </Layout>
  );
}
export default Layouts;
