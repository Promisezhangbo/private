import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Input, message as antdMessage } from 'antd';
import { RobotOutlined, SendOutlined } from '@ant-design/icons';
import Markdown from '@ant-design/x-markdown';
import { deltaToText, getLLMOutput } from '@/api';
import './index.scss';

const { TextArea } = Input;

type Msg = { role: 'user' | 'assistant'; content: string; id: string };

const EMPTY_REPLY = '（未收到模型正文，请稍后重试或检查模型配置。）';

function formatError(err: unknown): string {
  const text = err instanceof Error ? err.message : String(err);
  return `请求未能完成。\n\n**错误**：${text}\n\n请检查网络与模型权限；也可在 \`apps/agent/.env.local\` 设置 \`VITE_ARK_API_KEY\` 覆盖默认 Key。`;
}

function TypingDots() {
  return (
    <div className="agent-studio__typing" aria-hidden>
      <span className="agent-studio__typing-dot" />
      <span className="agent-studio__typing-dot" />
      <span className="agent-studio__typing-dot" />
    </div>
  );
}

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [streamId, setStreamId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || busy) return;

    const userId = `u-${Date.now()}`;
    const botId = `a-${Date.now()}`;
    setMessages((p) => [
      ...p,
      { role: 'user', content: text, id: userId },
      { role: 'assistant', content: '', id: botId },
    ]);
    setInput('');
    setBusy(true);
    setStreamId(botId);

    try {
      await getLLMOutput(text, (delta) => {
        const piece = deltaToText(delta);
        if (!piece) return;
        setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, content: m.content + piece } : m)));
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === botId && !m.content.trim() ? { ...m, content: EMPTY_REPLY } : m)),
      );
    } catch (err) {
      antdMessage.error(err instanceof Error ? err.message : String(err));
      setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, content: m.content || formatError(err) } : m)));
    } finally {
      setBusy(false);
      setStreamId(null);
    }
  }, [input, busy]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const showEmpty = messages.length === 0 && !busy;

  return (
    <div className="agent-studio">
      <div ref={scrollRef} className="agent-studio__scroll" role="log" aria-live="polite">
        <div className="agent-studio__inner">
          <header className="agent-studio__masthead">
            <div className="agent-studio__masthead-icon" aria-hidden>
              <RobotOutlined />
            </div>
            <div>
              <h1 className="agent-studio__title">智能对话</h1>
              <p className="agent-studio__subtitle">
                浅蓝与浅紫配色 · 上方问答 · 底部输入 · Enter 发送 · Shift+Enter 换行
              </p>
            </div>
          </header>

          {showEmpty && (
            <div className="agent-studio__empty">
              <div className="agent-studio__empty-mark" aria-hidden />
              <p className="agent-studio__empty-title">开始对话</p>
              <p className="agent-studio__empty-desc">在下方输入问题，模型将流式回复</p>
            </div>
          )}

          <ul className="agent-studio__feed">
            {messages.map((m) => (
              <li key={m.id} className={`agent-studio__turn agent-studio__turn--${m.role}`}>
                <span className="agent-studio__role">{m.role === 'user' ? '你' : '模型'}</span>
                <div className="agent-studio__card">
                  {m.role === 'user' ? (
                    <p className="agent-studio__user-text">{m.content}</p>
                  ) : m.content ? (
                    <div className="agent-studio__md">
                      <Markdown>{m.content}</Markdown>
                    </div>
                  ) : busy && streamId === m.id ? (
                    <TypingDots />
                  ) : null}
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
            value={input}
            placeholder="输入问题…"
            autoSize={{ minRows: 1, maxRows: 6 }}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<SendOutlined />}
            loading={busy}
            className="agent-studio__send"
            aria-label="发送"
            onClick={() => void send()}
          />
        </div>
      </footer>
    </div>
  );
}
