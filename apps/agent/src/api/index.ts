import OpenAI from 'openai';

export type LLMStreamDelta = OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta;

/** 与 OpenAI 兼容的多模态 user content（字符串或 text + image_url 片段） */
export type UserMessageContent = OpenAI.Chat.ChatCompletionUserMessageParam['content'];

export async function getLLMOutput(
  userContent: UserMessageContent,
  onDelta: (delta: LLMStreamDelta) => void,
): Promise<void> {
  const apiKey = VITE_ARK_API_KEY?.trim() ?? '';

  const client = new OpenAI({
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    apiKey: apiKey.trim(),
    dangerouslyAllowBrowser: true,
  });

  const stream = await client.chat.completions.create({
    model: 'doubao-seed-2-0-code-preview-260215',
    messages: [{ role: 'user', content: userContent }],
    stream: true,
  });

  for await (const chunk of stream) {
    const choice = chunk.choices[0];
    if (!choice) continue;

    const delta = choice.delta;
    if (delta) {
      onDelta(delta);
    }
  }
}

/** 流式正文（不含思考；豆包等模型的思考在 {@link deltaToReasoning}） */
export function deltaToContent(delta: LLMStreamDelta): string {
  if (delta.refusal) {
    return typeof delta.refusal === 'string' ? delta.refusal : '';
  }
  const c = delta.content as string | null | undefined | Array<{ text?: string }>;
  if (typeof c === 'string') {
    return c;
  }
  if (Array.isArray(c)) {
    return c
      .map((part) => {
        if (typeof part === 'object' && part !== null && 'text' in part) {
          return String(part.text ?? '');
        }
        return '';
      })
      .join('');
  }
  return '';
}

/** 流式思考片段（如豆包 `reasoning_content`） */
export function deltaToReasoning(delta: LLMStreamDelta): string {
  const ext = delta as LLMStreamDelta & { reasoning_content?: string };
  return typeof ext.reasoning_content === 'string' ? ext.reasoning_content : '';
}

/** 仅正文，用于拼接助手回复（与思考过程分离） */
export function deltaToText(delta: LLMStreamDelta): string {
  return deltaToContent(delta);
}
