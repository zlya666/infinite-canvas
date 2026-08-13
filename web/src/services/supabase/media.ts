/**
 * 媒体上传/下载适配（MVP 占位）。
 * 路径约定：{user_id}/images|videos|audios/{storageKey}
 * 下一阶段接到 image-storage / file-storage。
 */
import { getSupabaseClient } from "@/services/supabase/client";

const BUCKET = "user-media";

export function buildUserMediaPath(userId: string, kind: "images" | "videos" | "audios", storageKey: string) {
    return `${userId}/${kind}/${storageKey}`;
}

export async function uploadUserMedia(userId: string, kind: "images" | "videos" | "audios", storageKey: string, file: Blob, contentType?: string) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("未配置 Supabase");
    const path = buildUserMediaPath(userId, kind, storageKey);
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        upsert: true,
        contentType: contentType || file.type || "application/octet-stream",
    });
    if (error) throw error;
    return path;
}

export async function downloadUserMedia(path: string) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("未配置 Supabase");
    const { data, error } = await supabase.storage.from(BUCKET).download(path);
    if (error) throw error;
    return data;
}

export async function removeUserMedia(paths: string[]) {
    const supabase = getSupabaseClient();
    if (!supabase || !paths.length) return;
    const { error } = await supabase.storage.from(BUCKET).remove(paths);
    if (error) throw error;
}
