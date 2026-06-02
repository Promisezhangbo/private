/** 企业微信群机器人 webhook 调用（企业微信渠道内复用）。 */

export interface WecomTextMessage {
  readonly content: string;
  readonly mentionedMobiles?: readonly string[];
}

export interface WecomSendResult {
  readonly ok: boolean;
  readonly status: number;
  readonly errcode: number | undefined;
  readonly errmsg: string | undefined;
}

interface WecomResponseBody {
  errcode?: number;
  errmsg?: string;
}

export async function sendWecomText(
  webhookUrl: string,
  message: WecomTextMessage,
): Promise<WecomSendResult> {
  if (!webhookUrl.trim()) throw new Error("webhookUrl is required");
  if (!message.content.trim()) throw new Error("message.content is required");

  const payload: Record<string, unknown> = {
    msgtype: "text",
    text: {
      content: message.content,
      ...(message.mentionedMobiles?.length
        ? { mentioned_mobile_list: [...message.mentionedMobiles] }
        : {}),
    },
  };

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  let body: WecomResponseBody | undefined;
  try {
    body = (await res.json()) as WecomResponseBody;
  } catch {
    body = undefined;
  }

  return {
    ok: res.ok && body?.errcode === 0,
    status: res.status,
    errcode: body?.errcode,
    errmsg: body?.errmsg,
  };
}
