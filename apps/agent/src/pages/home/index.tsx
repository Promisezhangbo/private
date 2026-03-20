import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Input, Button, Card, Space, Typography, Avatar } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import Markdown from '@ant-design/x-markdown';
import './index.scss';
const { TextArea } = Input;
/** 单条对话 */
type Msg = { role: 'user' | 'assistant'; content: string; id: string };
/** 本地模拟回复（接入真实服务时替换为 fetch / SSE） */
function buildMockReply(question: string): string {
  return `**模拟回答**\n\n你问的是：\n> ${question}\n\n当前为前端模拟延迟回复，可在 \`send\` 中改为调用后端或第三方 API。`;
}
function Home() {
  const [value, setValue] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);
  /** 提交问题：入队用户消息 → 模拟 AI 延迟回复 */
  const send = useCallback(() => {
    const content = value.trim();
    if (!content || loading) return;
    const userMsg: Msg = { role: 'user', content, id: `${Date.now()}` };
    setMessages((prev) => [...prev, userMsg]);
    setValue('');
    setLoading(true);
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: buildMockReply(content),
          id: `${Date.now()}_a`,
        },
      ]);
      setLoading(false);
    }, 900);
  }, [value, loading]);
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  return (
    <div className="agent-page">
      <header className="agent-hero">
        <Typography.Title level={2}>AI 工作台</Typography.Title>
        <Typography.Text type="secondary">
          多轮对话演示：输入问题后由本地模拟引擎返回 Markdown。样式为独立子应用主题，可与主应用壳层并存。
        </Typography.Text>
      </header>
      <Card className="agent-input-card" bordered={false}>
        <Space className="agent-form-stack" orientation="vertical" size="middle">
          <TextArea
            rows={4}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
            placeholder="例如：如何用 React 做微前端子应用样式隔离？"
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <div className="agent-input-actions">
            <Button type="primary" icon={<SendOutlined />} loading={loading} onClick={send}>
              发送
            </Button>
          </div>
        </Space>
      </Card>
      <div ref={scrollRef} className="agent-thread" role="log" aria-live="polite">
        {messages.map((item) => {
          const isUser = item.role === 'user';
          return (
            <div
              key={item.id}
              className={`agent-row ${isUser ? 'agent-row--user' : ''}`}
            >
              {!isUser && (
                <Avatar size={40} icon={<RobotOutlined />} className="agent-avatar" />
              )}
              <div className="agent-bubble">
                {item.role === 'assistant' ? (
                  <Markdown>{item.content}</Markdown>
                ) : (
                  item.content
                )}
              </div>
              {isUser && (
                <Avatar size={40} icon={<UserOutlined />} className="agent-avatar agent-avatar--user" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default Home;
