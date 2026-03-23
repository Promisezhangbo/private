import OpenAI from 'openai';

export type LLMStreamDelta = OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta;

export async function getLLMOutput(userContent: string, onDelta: (delta: LLMStreamDelta) => void): Promise<void> {
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

/** 从流式 delta 中取出可拼接到正文的字符串（兼容部分厂商扩展字段） */
export function deltaToText(delta: LLMStreamDelta): string {
  if (delta.refusal) {
    return typeof delta.refusal === 'string' ? delta.refusal : '';
  }
  if (typeof delta.content === 'string') {
    return delta.content;
  }
  const ext = delta as LLMStreamDelta & { reasoning_content?: string };
  if (typeof ext.reasoning_content === 'string') {
    return ext.reasoning_content;
  }
  return '';
}
