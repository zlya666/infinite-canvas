# Supabase（小团队多用户）

50 人以内团队可启用 Supabase 登录，并按用户隔离画布项目。

## 1. 创建项目

1. 在 [Supabase](https://supabase.com) 新建项目
2. 打开 SQL Editor，执行本目录 [`schema.sql`](./schema.sql)
3. Authentication → Providers 确认 Email 已开启
4. 内部使用建议：Authentication → Settings 关闭公开注册，或关闭「Confirm email」方便自建账号

## 2. 配置前端

在 `web/.env`（可参考 `web/.env.example`）：

```bash
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

- **两个都配置**：启用登录守卫 + 画布项目云同步  
- **都不配置**：保持原有纯本地模式，无需登录

Key 取自 Project Settings → API（使用 `anon` `public` key，不要把 `service_role` 放进前端）。

## 3. 当前已实现 / 未实现

已实现：

- 邮箱登录 / 注册 / 退出
- 路由守卫（配置了 Supabase 时必须登录）
- 画布项目 `projects` 表按 `user_id` 隔离同步（本地缓存 + 云端合并）

未实现（后续）：

- 图片 / 视频 / 音频 Blob 上云（`media.ts` 已预留）
- 素材库 `assets` 云同步
- 生成历史上云
- 首次登录一键导入本机全部数据的向导 UI

## 4. 安全注意

- AI API Key 仍只存在浏览器本地，不会写入 Supabase
- 业务表与 Storage 必须保留 RLS；不要用 service role 在前端请求
