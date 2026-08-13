/// <reference types="vite/client" />

declare const __APP_VERSION__: string;
declare const __APP_RELEASES__: import("@/lib/release").ReleaseInfo[];

interface ImportMetaEnv {
    // Comma-separated local development plugin URLs, refetched on every startup without caching or persistence.
    readonly VITE_DEV_PLUGINS?: string;
    // Optional build-time analytics configuration, with one independent variable per provider.
    // GA4 measurement ID (G-XXXX)
    readonly VITE_ANALYTICS_GA4_ID?: string;
    // Baidu Analytics site ID
    readonly VITE_ANALYTICS_BAIDU_ID?: string;
    // Supabase project URL; enable auth + cloud sync when set with the anon key.
    readonly VITE_SUPABASE_URL?: string;
    // Supabase anon/public key (RLS enforced).
    readonly VITE_SUPABASE_ANON_KEY?: string;
    // Optional local-dev Ark channel seed (Base URL + API key).
    readonly VITE_ARK_BASE_URL?: string;
    readonly VITE_ARK_API_KEY?: string;
}