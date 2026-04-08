import { CloudUploadOutlined } from '@ant-design/icons';
import type { AttachmentsProps, PromptsItemType } from '@ant-design/x';
import { createElement, type Dispatch, type RefObject, type SetStateAction } from 'react';
import type { UploadFile } from 'antd';
import type { UserMessageContent } from '@/api';

/** 避免每次 render 新建 streaming 对象触发 x-markdown 全量重算 */
export const MD_STREAMING_LIVE = { hasNextChunk: true, tail: true } as const;
export const MD_STREAMING_DONE = { hasNextChunk: false } as const;

export function attachmentsPlaceholder(type: 'drop' | 'inline') {
  return type === 'drop'
    ? { title: '松开以上传' }
    : {
        icon: createElement(CloudUploadOutlined),
        title: '上传文件',
        description: '点击或拖拽到此处；支持在输入框粘贴图片/文件',
      };
}

export type MsgAttachment = { uid: string; name: string; url?: string; isImage: boolean };

export type Msg = {
  role: 'user' | 'assistant';
  content: string;
  id: string;
  attachments?: MsgAttachment[];
  /** 助手思考过程（流式 reasoning_content） */
  reasoning?: string;
};

export type AttachmentsChangeInfo = Parameters<NonNullable<AttachmentsProps['onChange']>>[0];

/** 与 Attachments ref 对齐：用于在 file input 就绪后调用 upload */
export type AttachmentsUploadTarget = {
  fileNativeElement?: HTMLInputElement | null;
  upload: (file: File) => void;
};

/**
 * 粘贴进 Sender 时会先展开 Header；Attachments 内 input 可能尚未挂载。
 * 在 microtask / rAF 中重试，避免首次粘贴无效。
 */
export function schedulePasteToAttachments(
  files: File[],
  getRef: () => AttachmentsUploadTarget | null | undefined,
): void {
  const tryOnce = () => {
    const ref = getRef();
    if (!ref?.fileNativeElement) return false;
    files.forEach((f) => ref.upload(f));
    return true;
  };
  if (tryOnce()) return;
  queueMicrotask(() => {
    if (tryOnce()) return;
    requestAnimationFrame(() => {
      tryOnce();
    });
  });
}

export const EMPTY_REPLY = '（未收到模型正文，请稍后重试或检查模型配置。）';

export const STICK_BOTTOM_THRESHOLD = 72;

export const HOME_WELCOME = {
  title: '智能对话',
  description: '支持文字对话,以及粘贴/上传图片与文件;模型[doubao-seed-2-0-code-preview-260215]',
} as const;

export const PROMPT_ITEMS: PromptsItemType[] = [
  { key: 'intro', label: '介绍一下你能做什么', description: '了解助手能力与使用方式' },
  { key: 'code', label: '用 TypeScript 写一个防抖函数', description: '代码生成与解释' },
  {
    key: 'explain',
    label: '解释 React useLayoutEffect 和 useEffect 的区别',
    description: '概念对比与使用场景',
  },
];

export function formatError(err: unknown): string {
  const text = err instanceof Error ? err.message : String(err);
  return `请求未能完成。\n\n**错误**：${text}\n\n请检查网络与模型权限；也可在 \`apps/agent/.env.local\` 设置 \`VITE_ARK_API_KEY\` 覆盖默认 Key。`;
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('读取文件失败'));
    reader.readAsDataURL(file);
  });
}

export async function buildUserMessageContent(text: string, fileList: UploadFile[]): Promise<UserMessageContent> {
  const textTrim = text.trim();
  const imageParts: Array<{ type: 'image_url'; image_url: { url: string } }> = [];
  const extras: string[] = [];

  for (const item of fileList) {
    const file = item.originFileObj;
    if (!file) continue;
    if (file.type.startsWith('image/')) {
      const url = await readFileAsDataURL(file);
      imageParts.push({ type: 'image_url', image_url: { url } });
    } else {
      extras.push(`[附件: ${file.name}]`);
    }
  }

  let combinedText = textTrim;
  if (extras.length > 0) {
    combinedText = [combinedText, ...extras, '（非图片附件仅为文件名提示，模型无法读取文件内容。）']
      .filter(Boolean)
      .join('\n');
  }

  if (imageParts.length === 0) {
    return combinedText;
  }

  const textPart = { type: 'text' as const, text: combinedText || '请结合上传的图片回答。' };
  return [textPart, ...imageParts];
}

export async function snapshotMsgAttachments(filesSnapshot: UploadFile[]): Promise<MsgAttachment[]> {
  return Promise.all(
    filesSnapshot.map(async (f) => {
      const file = f.originFileObj;
      const isImage = Boolean((f.type ?? file?.type ?? '').startsWith('image/'));
      if (isImage && file) {
        return {
          uid: f.uid,
          name: f.name ?? 'file',
          url: await readFileAsDataURL(file),
          isImage: true,
        };
      }
      return { uid: f.uid, name: f.name ?? 'file', isImage: false };
    }),
  );
}

/**
 * 合并上传列表（第一阶段）：回收已移除项的 blob。
 * 新增图片不立刻 createObjectURL，标记 uploading，避免粘贴大图时主线程长时间卡顿。
 */
export function mergeAttachmentFileListPhase1(fileList: UploadFile[], prev: UploadFile[]): UploadFile[] {
  const prevByUid = new Map(prev.map((p) => [p.uid, p]));
  const nextUids = new Set(fileList.map((p) => p.uid));
  prev.forEach((p) => {
    if (!nextUids.has(p.uid) && p.url?.startsWith('blob:')) {
      URL.revokeObjectURL(p.url);
    }
  });
  return fileList.map((item) => {
    const f = item.originFileObj;
    const prevItem = prevByUid.get(item.uid);
    if (f && f.type.startsWith('image/')) {
      if (prevItem?.url?.startsWith('blob:') && prevItem.status === 'done') {
        return { ...item, url: prevItem.url, thumbUrl: prevItem.thumbUrl, status: 'done' as const, percent: 100 };
      }
      if (item.url?.startsWith('blob:')) {
        URL.revokeObjectURL(item.url);
      }
      return {
        ...item,
        url: undefined,
        thumbUrl: undefined,
        status: 'uploading' as const,
        percent: item.percent ?? 40,
      };
    }
    return { ...item, status: (item.status ?? 'done') as UploadFile['status'] };
  });
}

/** 第二阶段：为仍处于 uploading 的图片生成 blob 预览（建议在 rAF 中调用） */
export function applyImagePreviewBlobs(items: UploadFile[]): UploadFile[] {
  return items.map((item) => {
    const f = item.originFileObj;
    if (!f || !f.type.startsWith('image/')) {
      return item;
    }
    if (item.status !== 'uploading' && item.url?.startsWith('blob:')) {
      return item;
    }
    if (item.url?.startsWith('blob:')) {
      URL.revokeObjectURL(item.url);
    }
    return {
      ...item,
      url: URL.createObjectURL(f),
      thumbUrl: undefined,
      status: 'done' as const,
      percent: 100,
    };
  });
}

export function revokeAttachmentBlobs(items: UploadFile[]) {
  items.forEach((item) => {
    if (item.url?.startsWith('blob:')) {
      URL.revokeObjectURL(item.url);
    }
  });
}

export function promptLabelToString(label: PromptsItemType['label']): string {
  return typeof label === 'string' ? label : String(label ?? '');
}

export function newConversationIds(): { userId: string; botId: string } {
  return { userId: `u-${Date.now()}`, botId: `a-${Date.now()}` };
}

export function appendAssistantDelta(prev: Msg[], botId: string, deltaC: string, deltaR: string): Msg[] {
  if (!deltaC && !deltaR) return prev;
  return prev.map((m) =>
    m.id === botId ? { ...m, content: m.content + deltaC, reasoning: (m.reasoning ?? '') + deltaR } : m,
  );
}

export function pushConversationTurn(
  prev: Msg[],
  p: {
    userId: string;
    botId: string;
    trimmed: string;
    hasFiles: boolean;
    attachments: MsgAttachment[];
  },
): Msg[] {
  const { userId, botId, trimmed, hasFiles, attachments } = p;
  return [
    ...prev,
    {
      role: 'user' as const,
      content: trimmed || (hasFiles ? '（已上传附件）' : ''),
      id: userId,
      attachments: attachments.length ? attachments : undefined,
    },
    { role: 'assistant' as const, content: '', reasoning: '', id: botId },
  ];
}

export function removeTurnByIds(prev: Msg[], userId: string, botId: string): Msg[] {
  return prev.filter((m) => m.id !== userId && m.id !== botId);
}

export function fillEmptyAssistantReply(prev: Msg[], botId: string): Msg[] {
  return prev.map((m) =>
    m.id === botId && !m.content.trim() && !(m.reasoning ?? '').trim() ? { ...m, content: EMPTY_REPLY } : m,
  );
}

export function patchAssistantOnError(prev: Msg[], botId: string, err: unknown): Msg[] {
  return prev.map((m) => (m.id === botId ? { ...m, content: m.content || formatError(err) } : m));
}

/**
 * 流式增量写入 ref，经 rAF 合并后再 setMessages，减轻滚动/解析与高频 setState 竞争。
 */
export function createStreamFlushScheduler(
  pendingRef: RefObject<{ c: string; r: string }>,
  rafRef: RefObject<number>,
  botId: string,
  setMessages: Dispatch<SetStateAction<Msg[]>>,
) {
  const flushOnce = () => {
    const c = pendingRef.current.c;
    const r = pendingRef.current.r;
    pendingRef.current = { c: '', r: '' };
    if (c || r) {
      setMessages((prev) => appendAssistantDelta(prev, botId, c, r));
    }
  };

  const schedule = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      flushOnce();
      if (pendingRef.current.c || pendingRef.current.r) {
        schedule();
      }
    });
  };

  const reset = () => {
    pendingRef.current = { c: '', r: '' };
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  };

  /** 结束流式时取消未执行帧并刷入剩余 pending */
  const flushTail = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    flushOnce();
  };

  return { schedule, reset, flushTail };
}
