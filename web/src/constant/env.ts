export const APP_VERSION = __APP_VERSION__ || "dev";

export const DOCS_URL = import.meta.env.VITE_DOC_URL || "https://docs.canvas.best";

// Official plugin registry URL: CI publishes to plugins-dist for jsDelivr delivery; an environment variable may override it for self-hosting.
export const PLUGIN_REGISTRY_URL = import.meta.env.VITE_PLUGIN_REGISTRY_URL || "https://cdn.jsdelivr.net/gh/basketikun/infinite-canvas@plugins-dist/official-plugins.json";

/** Supabase 项目 URL；与 ANON_KEY 同时配置后启用登录与云同步。 */
export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || "").trim();

/** Supabase anon key（前端可用，权限靠 RLS）。 */
export const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

/** 本地开发预填：火山方舟 Base URL（与 API Key 同时配置后注入渠道）。 */
export const ARK_BASE_URL = (import.meta.env.VITE_ARK_BASE_URL || "").trim();

/** 本地开发预填：火山方舟 API Key（仅前端本地使用，勿提交真实密钥）。 */
export const ARK_API_KEY = (import.meta.env.VITE_ARK_API_KEY || "").trim();
