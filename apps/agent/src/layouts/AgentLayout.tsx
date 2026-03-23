import React from 'react';
import { Outlet } from 'react-router-dom';

/** 撑满 flex 链，保证对话页内部滚动 + 底部输入固定 */
export default function AgentLayout() {
  return (
    <div className="agent-route-root">
      <Outlet />
    </div>
  );
}
