# bot-server

Deno + TypeScript + [Hono](https://hono.dev/)，用于「定时通知 / Webhook 转发」类机器人。

## 启动流程

```text
main.ts
  ├─ registerAllJobs()        → business/index.ts → 各渠道 jobs
  └─ Deno.serve(app.fetch)    → routes → business → 各 bot
```

## 目录

| 路径 | 职责 |
|------|------|
| `src/main.ts` | 入口 |
| `src/app.ts` | HTTP 中间件 |
| `src/routes/` | 网络层：系统路由 + 挂载业务路由 |
| `src/jobs/` | 定时入口（转调 `business/`） |
| `src/business/` | **业务目录**（按渠道分子目录） |
| `src/business/wecom/` | 企业微信：所有机器人集中在此 |
| `src/business/wecom/bots/` | 每个机器人一个文件 |
| `src/business/wecom/shared/` | 企业微信渠道内复用能力（鉴权、webhook 客户端） |
| `src/utils/` | 全局工具（仅放跨业务复用能力） |

## 新增企业微信定时机器人（3 步）

1. 复制 `src/business/wecom/bots/off-work.ts` 为新文件（如 `daily-report.ts`），实现 `WecomBotDefinition`（配置、发送、`routes`、`registerJob`、`health`）。
2. 在 `src/business/wecom/bots/index.ts` 的 `wecomBots` 数组中追加一行：

```ts
import { dailyReportBot } from "./daily-report.ts";

export const wecomBots = [
  offWorkBot,
  dailyReportBot, // 新增
];
```

3. 在 Deno Deploy 配置对应环境变量后重新部署。

**无需修改** `main.ts`、`jobs/index.ts`、`routes/index.ts`、`business/index.ts`（除非新增全新渠道如飞书）。

## 新增渠道（如飞书）

1. 新建 `src/business/feishu/`（结构可参考 `wecom/`）。
2. 在 `src/business/index.ts` 中 `registerFeishuJobs()` + `createFeishuRouter()` 各加一行。

## 命令

```bash
pnpm --filter bot-server dev
pnpm --filter bot-server dev:env
pnpm --filter bot-server build
```

本地默认端口 **8787**（非 8000）。启动后日志会打印实际地址。

```bash
curl http://localhost:8787/health
curl -X POST http://localhost:8787/wecom/off-work
```

若本机 8000 已被 uvicorn 等占用，curl `localhost:8000` 会打到别的服务并返回 `Not Found`。

## API（当前）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | `/health` | 服务健康 |
| GET  | `/wecom/health` | 各企业微信 bot 配置摘要 |
| POST | `/wecom/off-work` | 手动触发下班提醒 |

## 环境变量（下班提醒）

| 变量 | 必填 | 说明 |
|------|------|------|
| `WECOM_OFF_WORK_WEBHOOK_URL` | 是 | webhook |
| `WECOM_OFF_WORK_CRON` | 否 | 默认 `30 10 * * *`（每天检查，工作日才发） |
| `WECOM_OFF_WORK_TEXT` | 否 | 默认「18:30 下班了」 |
| `WECOM_OFF_WORK_MENTIONED_MOBILES` | 否 | `@all` 或手机号 |
| `WECOM_OFF_WORK_EXTRA_HOLIDAYS` | 否 | 额外放假日（内置已含 2025/2026 国务院日历） |
| `WECOM_OFF_WORK_EXTRA_WORKDAYS` | 否 | 额外调休上班日 |
| `BOT_TRIGGER_TOKEN` | 否 | 手动触发鉴权 |
| `BOT_SERVER_PORT` | 否 | 本地 HTTP 端口，默认 `8787` |

## Deno Deploy

- **App directory**：`backend/bot-server`
- **Entry point**：`src/main.ts`
