import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/constant/env";

let client: SupabaseClient | null = null;

/** 是否已配置 Supabase；未配置时保持原有纯本地模式。 */
export function isSupabaseConfigured() {
    return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/** 获取 Supabase 单例；未配置时返回 null。 */
export function getSupabaseClient() {
    if (!isSupabaseConfigured()) return null;
    if (!client) {
        client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
            },
        });
    }
    return client;
}
