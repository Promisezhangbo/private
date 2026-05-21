# Google Search Console 验证

## 重要说明：DNS 不在本仓库里配置

`google-site-verification=...` 属于 **DNS TXT 记录**，只能在 **域名 DNS 服务商** 后台添加（注册商、Cloudflare、Netlify DNS、阿里云 DNS 等）。**本 Git 仓库没有 DNS 区域文件**，提交代码无法完成 DNS 验证。

当前线上站点主要为：

| 地址 | DNS 归属 | 能否在本项目里加 TXT |
| --- | --- | --- |
| `https://promisezhangbo.github.io/` | GitHub | ❌ 用户无法改 `*.github.io` 的 DNS |
| `https://promise-zhangbo.netlify.app/` | Netlify | ❌ 用户无法改 `*.netlify.app` 的 DNS |
| **自备自定义域名**（如 `example.com`） | 你绑定的服务商 | ✅ 在对应面板加 TXT |

对 **github.io / netlify.app 子域名**，Search Console 请改用 **HTML 标记** 或 **HTML 文件** 验证（见下节），不要用 DNS 方式。

## 推荐：HTML 标记（已写入主应用）

当前在 `apps/main/index.html` 中保留 **两条** `google-site-verification` meta（对应 Search Console 里不同资源或重复验证请求，可同时存在）：

| 用途说明 | content 值 |
| --- | --- |
| 验证 1 | `INVPRWWff1mu9dudIhGiL34FTbmmUkx7eR74QA4uAlw` |
| 验证 2 | `Vi1vW2ZPqe8I77GF6PNQRMqeroTNmnfNbYJQYTcT1YE` |

```html
<meta name="google-site-verification" content="INVPRWWff1mu9dudIhGiL34FTbmmUkx7eR74QA4uAlw" />
<meta name="google-site-verification" content="Vi1vW2ZPqe8I77GF6PNQRMqeroTNmnfNbYJQYTcT1YE" />
```

构建后 `postbuild` 会把 `dist/main/index.html` 复制为站点根 `dist/index.html`，部署后访问 **站点根 URL** 即可被 Google 抓取。

**操作步骤：**

1. 合并并部署（GitHub Pages `scope=all` 或 Netlify 全量构建）。
2. 浏览器打开 `https://promisezhangbo.github.io/`（或你的自定义域名根路径），查看网页源代码，确认存在上述 `meta`。
3. Search Console → 验证 → 选择 **HTML 标记** → 确认。

## 若你验证的是自定义域名（DNS 方式）

在 Search Console 里添加的是 **根域名**（如 `zhangbo.com`）且 Google 要求 **DNS 记录** 时，到 **该域名的 DNS 管理页** 新增一条 **TXT**：

| 字段 | 值 |
| --- | --- |
| 类型 | `TXT` |
| 主机 / Name | `@`（或留空，表示根域；部分面板填 `@` 或根域名） |
| 值 / Value | 与 Search Console 显示的完整字符串一致，例如：<br>`google-site-verification=INVPRWWff1mu9dudIhGiL34FTbmmUkx7eR74QA4uAlw`<br>或 `google-site-verification=Vi1vW2ZPqe8I77GF6PNQRMqeroTNmnfNbYJQYTcT1YE` |
| TTL | 默认（如 3600）即可 |

每个 Search Console 资源对应 **一条** TXT；若两个域名/资源各有一条验证码，需在 DNS 里添加 **两条** TXT（或一条资源验证通过后删除未用的 TXT）。

### Netlify 托管的自定义域名

1. Netlify → 站点 → **Domain management** → **DNS**（或使用 Netlify DNS 的域名）。
2. **Add new record** → Type: **TXT** → Name: `@` → Value: 上表完整字符串。
3. 等待解析生效（几分钟到 48 小时），再在 Search Console 点验证。

### GitHub Pages 自定义域名

在 **域名注册商**（购买域名处）的 DNS 里添加上述 TXT；GitHub 仓库 Settings → Pages 里配置的 custom domain 只负责 CNAME/A，**TXT 仍在注册商添加**。

### Cloudflare / 其它

同样添加 TXT；若开启代理（橙色云），TXT 记录一般仍放在 DNS 页，与 CDN 代理无关。

## 验证失败时排查

- **DNS**：`dig TXT example.com` 或在线 DNS 查询是否能看到 `google-site-verification=...`。
- **HTML 标记**：确认验证的是 **根站** URL，且已部署含 `meta` 的最新 `dist/index.html`。
- **资源前缀**：GitHub Pages 若站点在 `https://user.github.io/repo/` 子路径，需在 Search Console 填 **带路径前缀** 的资源；本仓库为 **用户站根** `promisezhangbo.github.io`（无 `/repo` 前缀）。

## 相关文档

- [SEO 说明](./seo.md)
- [GitHub Pages 部署](./github-pages-deploy.md)
- [Netlify 部署](./netlify-deploy.md)
