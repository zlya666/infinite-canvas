import { create } from "zustand";

import {
    getAuthSession,
    isSupabaseConfigured,
    mapSupabaseUser,
    onAuthSessionChange,
    signInWithPassword,
    signOut,
    signUpWithPassword,
    type AuthUser,
} from "@/services/supabase/auth";

export type LocalUser = AuthUser;

type UserStore = {
    /** Auth 初始化是否完成（未配置 Supabase 时立刻为 true）。 */
    ready: boolean;
    /** 是否启用了云端登录（由环境变量决定）。 */
    authEnabled: boolean;
    user: LocalUser | null;
    initAuth: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName?: string) => Promise<void>;
    signOut: () => Promise<void>;
    clearSession: () => void;
};

let unsubscribeAuth: (() => void) | null = null;
let initPromise: Promise<void> | null = null;

export const useUserStore = create<UserStore>()((set, get) => ({
    ready: !isSupabaseConfigured(),
    authEnabled: isSupabaseConfigured(),
    user: null,
    initAuth: async () => {
        if (!isSupabaseConfigured()) {
            set({ ready: true, authEnabled: false, user: null });
            return;
        }
        if (initPromise) return initPromise;
        initPromise = (async () => {
            try {
                const session = await getAuthSession();
                set({
                    ready: true,
                    authEnabled: true,
                    user: session?.user ? mapSupabaseUser(session.user) : null,
                });
                if (!unsubscribeAuth) {
                    unsubscribeAuth = onAuthSessionChange((session) => {
                        set({
                            user: session?.user ? mapSupabaseUser(session.user) : null,
                        });
                    });
                }
            } catch {
                set({ ready: true, authEnabled: true, user: null });
            }
        })();
        return initPromise;
    },
    signIn: async (email, password) => {
        const session = await signInWithPassword(email, password);
        set({ user: session?.user ? mapSupabaseUser(session.user) : null });
    },
    signUp: async (email, password, displayName) => {
        const session = await signUpWithPassword(email, password, displayName);
        // 若开启邮箱确认，session 可能为空，保持未登录并提示用户。
        set({ user: session?.user ? mapSupabaseUser(session.user) : get().user });
    },
    signOut: async () => {
        await signOut();
        set({ user: null });
    },
    clearSession: () => set({ user: null }),
}));
