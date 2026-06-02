# backend

| 项目 | 职责 | 文档 |
|------|------|------|
| `api-server` | Hono + PostgreSQL | [api-server/README.md](./api-server/README.md) |
| `bot-server` | 定时通知 / 机器人 | [bot-server/README.md](./bot-server/README.md) |

```text
backend/bot-server/src/
  main.ts
  routes/           # 网络层
  jobs/             # 定时入口 → business
  business/         # 业务（按渠道分目录）
    wecom/bots/     # 每个企业微信机器人一个文件，改 bots/index.ts 即可上线
  utils/            # 全局工具
```
