import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Flex, Layout, Menu, Segmented, Tag } from "antd";
import type { MenuProps } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";
const { Sider, Content, Header } = Layout;
function Layouts() {
  const navigate = useNavigate();
  const location = useLocation();
  const currantApp = location.pathname?.split('/')[1] || 'home';
  const [currentTag, setCurrentTag] = useState<string>(currantApp);
  // 当路径以 /login 开头时，不展示主应用的左侧导航（登录页为独立子应用）
  // const isShowMain = !['login', 'home'].includes(location.pathname.split('/')[1]);
  const items = [
    { value: 'home', label: '首页' },
    { value: 'agent', label: '子应用[Agent]' },
    { value: 'blog', label: '子应用[Blog]' },
    { value: 'login', label: '登录' }
  ];
  const onMenuSelect = (key: string) => {
    setCurrentTag(key);
    if (key === 'home') navigate('/home');
    else if (key === 'login') navigate('/login');
    else navigate('/' + key);
  };
  return (
    <Layout>
      <Tag.CheckableTagGroup
        options={items}
        value={currentTag}
        onChange={(value) => onMenuSelect(value as string)}
      />
      <Layout>
        <Content >
          {/* 主应用暂时只做基座使用，不展示其他路由内容 <Outlet /> */}
          <div id='sub-app' />
        </Content>
      </Layout>
    </Layout>
  );
}
export default Layouts;
