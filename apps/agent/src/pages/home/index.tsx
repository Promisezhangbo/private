import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Input, Button, message as antdMessage } from 'antd';
import { SendOutlined, RobotOutlined } from '@ant-design/icons';
import Markdown from '@ant-design/x-markdown';
import './index.scss';
import { deltaToText, getLLMOutput } from '@/api';

const { TextArea } = Input;

type Msg = { role: 'user' | 'assistant'; content: string; id: string };

export default function Home() {
  const [value, setValue] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [streamingAssistantId, setStreamingAssistantId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, []);

  const send = useCallback(async () => {
    const content = value.trim();
    if (!content || loading) return;

    const userMsg: Msg = { role: 'user', content, id: `u-${Date.now()}` };
    const assistantId = `a-${Date.now()}`;
    setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: '', id: assistantId }]);
    setValue('');
    setLoading(true);
    setStreamingAssistantId(assistantId);

    try {
      await getLLMOutput(content, (delta) => {
        const piece = deltaToText(delta);
        if (!piece) return;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + piece } : m)),
        );
      });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId && !m.content.trim()
            ? { ...m, content: '（未收到模型正文输出，请稍后重试或检查模型配置。）' }
            : m,
        ),
      );
    } catch (err) {
      const errText = err instanceof Error ? err.message : String(err);
      antdMessage.error(errText);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  m.content ||
                  `请求未能完成。\n\n**错误**：${errText}\n\n请检查网络、模型权限及 \`VITE_ARK_API_KEY\` 配置。`,
              }
            : m,
        ),
      );
    } finally {
      setLoading(false);
      setStreamingAssistantId(null);
    }
  }, [value, loading]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  return (
    <div className="agent-studio">
      <div ref={scrollRef} className="agent-studio__scroll" role="log" aria-live="polite">
        <div className="agent-studio__inner">
          <header className="agent-studio__masthead">
            <div className="agent-studio__masthead-icon" aria-hidden>
              <RobotOutlined />
            </div>
            <div className="agent-studio__masthead-copy">
              <h1 className="agent-studio__title">智能对话</h1>
              <p className="agent-studio__subtitle">
                上方展示问题与回答；输入框固定在底部。Enter 发送，Shift+Enter 换行
              </p>
            </div>
          </header>

          {messages.length === 0 && !loading && (
            <div className="agent-studio__empty">
              <div className="agent-studio__empty-orb" aria-hidden />
              <p className="agent-studio__empty-line1">从这里开始</p>
              <p className="agent-studio__empty-line2">在底部输入你的问题，模型回答会出现在上方</p>
            </div>
          )}

          <ul className="agent-studio__feed">
            {messages.map((item) => (
              <li
                key={item.id}
                className={`agent-studio__turn agent-studio__turn--${item.role}`}
              >
                <span className="agent-studio__role">
                  {item.role === 'user' ? '你的问题' : '模型回答'}
                </span>
                <div className="agent-studio__card">
                  {item.role === 'assistant' ? (
                    <div className="agent-studio__md">
                      {item.content ? (
                        <Markdown>{item.content}</Markdown>
                      ) : loading && streamingAssistantId === item.id ? (
                        <div className="agent-studio__typing-inline" aria-hidden>
                          <span className="agent-studio__dot" />
                          <span className="agent-studio__dot" />
                          <span className="agent-studio__dot" />
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <p className="agent-studio__user-text">{item.content}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <footer className="agent-studio__dock">
        <div className="agent-studio__composer">
          <TextArea
            className="agent-studio__input"
            variant="borderless"
            value={value}
            placeholder="输入问题，Enter 发送"
            autoSize={{ minRows: 1, maxRows: 6 }}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<SendOutlined />}
            loading={loading}
            className="agent-studio__send"
            aria-label="发送"
            onClick={send}
          />
        </div>
      </footer>
    </div>
  );
}
