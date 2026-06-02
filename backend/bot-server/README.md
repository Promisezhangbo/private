# bot-server

Deno + TypeScript + [Hono](https://hono.dev/)，用于「定时通知 / Webhook 转发」类机器人。

## 配置在哪改

| 改什么 | 文件 |
|--------|------|
| **时间、文案、@ 谁** | `src/business/wecom/bots/settings.ts` |
| **webhook** | `.env.local` / Deno Deploy 环境变量 |
| **手动触发鉴权** | `BOT_TRIGGER_TOKEN`（环境变量，可选） |

```ts
// settings.ts 示例
export const ON_WORK_BOT = {
  cron: '30 0 * * *',   // UTC → 北京时间 8:30
  text: '鸡啊, 8:30 上班了',
  webhookEnv: 'WECOM_ON_WORK_WEBHOOK_URL',
  // ...
};
```

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `WECOM_OFF_WORK_WEBHOOK_URL` | 是 | 下班提醒 webhook |
| `WECOM_ON_WORK_WEBHOOK_URL` | 是 | 上班提醒 webhook |
| `BOT_TRIGGER_TOKEN` | 否 | 手动触发鉴权 |
| `BOT_SERVER_PORT` | 否 | 本地端口，默认 `8787` |

## 命令

```bash
pnpm --filter bot-server dev:env
pnpm --filter bot-server build
```

```bash
curl http://localhost:8787/wecom/health
curl -X POST http://localhost:8787/wecom/off-work
curl -X POST http://localhost:8787/wecom/on-work
```

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | `/health` | 服务健康 |
| GET  | `/wecom/health` | 各 bot 配置摘要 |
| POST | `/wecom/off-work` | 手动下班提醒 |
| POST | `/wecom/on-work` | 手动上班提醒 |

## 新增机器人

1. `settings.ts` 增加 `XXX_BOT` 配置  
2. `bots/xxx.ts`：`export const xxxBot = createWecomBot(XXX_BOT)`  
3. `bots/index.ts` 的 `wecomBots` 追加一行  
4. `.env` 增加对应 `XXX_WEBHOOK_URL`

## Deno Deploy

- **App directory**：`backend/bot-server`
- **Entry point**：`src/main.ts`
- 环境变量只需配两个 webhook（及可选 `BOT_TRIGGER_TOKEN`）
