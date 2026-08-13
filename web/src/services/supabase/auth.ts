import type { Session, User } from "@supabase/supabase-js";

import { getSupabaseClient, isSupabaseConfigured } from "@/services/supabase/client";

export type AuthUser = {
    id: string;
    email: string;
    displayName: string;
    avatarUrl: string;
};

export function mapSupabaseUser(user: User): AuthUser {
    const meta = user.user_metadata || {};
    return {
        id: user.id,
        email: user.email || "",
        displayName: String(meta.display_name || meta.full_name || meta.name || user.email?.split("@")[0] || "用户"),
        avatarUrl: String(meta.avatar_url || meta.picture || ""),
    };
}

export async function getAuthSession() {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
}

export async function signInWithPassword(email: string, password: string) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("未配置 Supabase");
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
    return data.session;
}

export async function signUpWithPassword(email: string, password: string, displayName?: string) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("未配置 Supabase");
    const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
            data: displayName?.trim() ? { display_name: displayName.trim() } : undefined,
        },
    });
    if (error) throw error;
    return data.session;
}

export async function signOut() {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export function onAuthSessionChange(callback: (session: Session | null) => void) {
    const supabase = getSupabaseClient();
    if (!supabase) return () => undefined;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(session);
    });
    return () => data.subscription.unsubscribe();
}

export { isSupabaseConfigured };
