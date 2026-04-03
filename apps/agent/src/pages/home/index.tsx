import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { RobotOutlined, UserOutlined } from '@ant-design/icons';
import { Attachments, Bubble, Prompts, Sender, Think } from '@ant-design/x';
import type { AttachmentsProps } from '@ant-design/x';
import Markdown from '@ant-design/x-markdown';
import { Avatar, message as antdMessage, type GetRef, type UploadFile } from 'antd';
import { deltaToContent, deltaToReasoning, getLLMOutput, type UserMessageContent } from '@/api';
import TypingDots from './TypingDots';
import {
  HOME_WELCOME,
  MD_STREAMING_DONE,
  MD_STREAMING_LIVE,
  PROMPT_ITEMS,
  STICK_BOTTOM_THRESHOLD,
  type AttachmentsChangeInfo,
  type Msg,
  type MsgAttachment,
  applyImagePreviewBlobs,
  attachmentsPlaceholder,
  buildUserMessageContent,
  createStreamFlushScheduler,
  fillEmptyAssistantReply,
  mergeAttachmentFileListPhase1,
  newConversationIds,
  patchAssistantOnError,
  promptLabelToString,
  pushConversationTurn,
  removeTurnByIds,
  revokeAttachmentBlobs,
  schedulePasteToAttachments,
  snapshotMsgAttachments,
} from './utils';
import './index.scss';

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [streamId, setStreamId] = useState<string | null>(null);
  const [attachOpen, setAttachOpen] = useState(false);
  const [attachItems, setAttachItems] = useState<UploadFile[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const senderRef = useRef<GetRef<typeof Sender>>(null);
  const attachmentsRef = useRef<GetRef<typeof Attachments>>(null);
  const attachPreviewRafRef = useRef(0);
  const streamPendingRef = useRef({ c: '', r: '' });
  const streamFlushRafRef = useRef(0);

  const updateStickFromScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    stickToBottomRef.current = scrollHeight - scrollTop - clientHeight < STICK_BOTTOM_THRESHOLD;
  }, []);

  const handleAttachmentsChange: AttachmentsProps['onChange'] = useCallback((info: AttachmentsChangeInfo) => {
    const { fileList } = info;
    if (attachPreviewRafRef.current) {
      cancelAnimationFrame(attachPreviewRafRef.current);
      attachPreviewRafRef.current = 0;
    }
    setAttachItems((prev) => mergeAttachmentFileListPhase1(fileList, prev));
    attachPreviewRafRef.current = requestAnimationFrame(() => {
      attachPreviewRafRef.current = 0;
      setAttachItems((prev) => applyImagePreviewBlobs(prev));
    });
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachItems((prev) => {
      revokeAttachmentBlobs(prev);
      return [];
    });
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      const filesSnapshot = attachItems;
      const hasFiles = filesSnapshot.some((f) => f.originFileObj);
      if ((!trimmed && !hasFiles) || busy) return;

      stickToBottomRef.current = true;

      let attachmentsSnapshot: MsgAttachment[];
      try {
        attachmentsSnapshot = await snapshotMsgAttachments(filesSnapshot);
      } catch (e) {
        antdMessage.error(e instanceof Error ? e.message : String(e));
        return;
      }

      const { userId, botId } = newConversationIds();
      setMessages((p) =>
        pushConversationTurn(p, { userId, botId, trimmed, hasFiles, attachments: attachmentsSnapshot }),
      );
      setInput('');
      clearAttachments();
      setAttachOpen(false);
      setBusy(true);
      setStreamId(botId);

      let userContent: UserMessageContent;
      try {
        userContent = await buildUserMessageContent(trimmed, filesSnapshot);
      } catch (e) {
        antdMessage.error(e instanceof Error ? e.message : String(e));
        setBusy(false);
        setStreamId(null);
        setMessages((prev) => removeTurnByIds(prev, userId, botId));
        return;
      }

      if (typeof userContent === 'string' && !userContent.trim()) {
        setBusy(false);
        setStreamId(null);
        setMessages((prev) => removeTurnByIds(prev, userId, botId));
        return;
      }

      const stream = createStreamFlushScheduler(streamPendingRef, streamFlushRafRef, botId, setMessages);

      try {
        stream.reset();
        await getLLMOutput(userContent, (delta) => {
          const contentPiece = deltaToContent(delta);
          const reasoningPiece = deltaToReasoning(delta);
          if (!contentPiece && !reasoningPiece) return;
          streamPendingRef.current.c += contentPiece;
          streamPendingRef.current.r += reasoningPiece;
          stream.schedule();
        });
        stream.flushTail();
        setMessages((prev) => fillEmptyAssistantReply(prev, botId));
      } catch (err) {
        antdMessage.error(err instanceof Error ? err.message : String(err));
        setMessages((prev) => patchAssistantOnError(prev, botId, err));
      } finally {
        setBusy(false);
        setStreamId(null);
      }
    },
    [attachItems, busy, clearAttachments],
  );

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !stickToBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => updateStickFromScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [updateStickFromScroll]);

  useLayoutEffect(() => {
    return () => {
      if (attachPreviewRafRef.current) cancelAnimationFrame(attachPreviewRafRef.current);
      if (streamFlushRafRef.current) cancelAnimationFrame(streamFlushRafRef.current);
    };
  }, []);

  const showEmpty = messages.length === 0 && !busy;

  const senderHeader = (
    <Sender.Header
      title="附件"
      open={attachOpen}
      onOpenChange={setAttachOpen}
      forceRender
      styles={{ content: { padding: 0 } }}
    >
      <Attachments
        ref={attachmentsRef}
        beforeUpload={() => false}
        items={attachItems}
        onChange={handleAttachmentsChange}
        placeholder={attachmentsPlaceholder}
        getDropContainer={() => senderRef.current?.nativeElement}
      />
    </Sender.Header>
  );

  return (
    <div className="agent-studio">
      <header className="agent-studio__masthead">
        <div className="agent-studio__masthead-icon" aria-hidden>
          <RobotOutlined className="agent-studio__masthead-icon-glyph" />
        </div>
        <div className="agent-studio__masthead-text">
          <h1 className="agent-studio__masthead-title">{HOME_WELCOME.title}</h1>
          <p className="agent-studio__masthead-desc">{HOME_WELCOME.description}</p>
        </div>
      </header>

      <div ref={scrollRef} className="agent-studio__scroll" role="log" aria-live="polite">
        <div className="agent-studio__inner">
          {showEmpty && (
            <div className="agent-studio__welcome-wrap">
              <Prompts
                title="试试这些"
                wrap
                items={PROMPT_ITEMS}
                onItemClick={(info) => {
                  setInput(promptLabelToString(info.data.label));
                  requestAnimationFrame(() => senderRef.current?.focus({ cursor: 'end' }));
                }}
              />
            </div>
          )}

          <div className="agent-studio__bubbles">
            {messages.map((m) =>
              m.role === 'user' ? (
                <Bubble
                  key={m.id}
                  placement="end"
                  variant="outlined"
                  avatar={<Avatar size="large" icon={<UserOutlined />} className="agent-studio__bubble-avatar" />}
                  content={
                    <div className="agent-studio__bubble-user">
                      {m.attachments?.length ? (
                        <div className="agent-studio__attach-preview">
                          {m.attachments.map((a) =>
                            a.isImage && a.url ? (
                              <div key={a.uid} className="agent-studio__attach-img-wrap">
                                <img className="agent-studio__attach-img" src={a.url} alt={a.name} />
                              </div>
                            ) : (
                              <span key={a.uid} className="agent-studio__attach-file">
                                {a.name}
                              </span>
                            ),
                          )}
                        </div>
                      ) : null}
                      {m.content ? <p className="agent-studio__bubble-text">{m.content}</p> : null}
                    </div>
                  }
                />
              ) : (
                <Bubble
                  key={m.id}
                  placement="start"
                  variant="outlined"
                  avatar={<Avatar size="large" icon={<RobotOutlined />} className="agent-studio__bubble-avatar" />}
                  loading={busy && streamId === m.id && !m.content.trim() && !(m.reasoning ?? '').trim()}
                  loadingRender={() => <TypingDots />}
                  streaming={busy && streamId === m.id}
                  content={
                    (m.reasoning ?? '').trim() || m.content ? (
                      <div className="agent-studio__assistant-block">
                        {(m.reasoning ?? '').trim() ? (
                          <Think
                            className="agent-studio__think"
                            title="思考过程"
                            loading={busy && streamId === m.id}
                            defaultExpanded
                          >
                            <div className="agent-studio__think-text">{m.reasoning}</div>
                          </Think>
                        ) : null}
                        {m.content ? (
                          <div className="agent-studio__md">
                            <Markdown
                              content={m.content}
                              streaming={busy && streamId === m.id ? MD_STREAMING_LIVE : MD_STREAMING_DONE}
                            />
                          </div>
                        ) : null}
                      </div>
                    ) : null
                  }
                />
              ),
            )}
          </div>
        </div>
      </div>

      <footer className="agent-studio__dock">
        <Sender
          ref={senderRef}
          className="agent-studio__sender"
          value={input}
          loading={busy}
          submitType="enter"
          placeholder="输入问题,Enter 发送 · Shift+Enter 换行 · 可粘贴图片或文件"
          autoSize={{ minRows: 1, maxRows: 6 }}
          header={senderHeader}
          onChange={(v) => setInput(v)}
          onPasteFile={(files) => {
            flushSync(() => setAttachOpen(true));
            schedulePasteToAttachments(Array.from(files), () => attachmentsRef.current ?? undefined);
          }}
          onSubmit={(msg) => void send(msg)}
        />
      </footer>
    </div>
  );
}
