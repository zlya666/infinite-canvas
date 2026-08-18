import { useEffect, useRef } from "react";
import { App } from "antd";
import { useTranslation } from "react-i18next";

import { APP_STORAGE_DB, appStorageKey } from "@/constant/app-id";

import { deleteCloudProjects, fetchCloudProjects, mergeProjectsByUpdatedAt, upsertCloudProjects } from "@/services/supabase/projects";
import { useCanvasStore } from "@/stores/canvas/use-canvas-store";
import { useUserStore } from "@/stores/use-user-store";

const CLOUD_OWNER_KEY = appStorageKey("cloud_owner");

/**
 * 登录后把本地画布与云端合并，并在本地变更防抖后回写云端。
 * 未启用 Auth 或未登录时不做事，保持纯本地行为。
 * 同一浏览器切换账号时：若本地缓存属于其他用户，则只用云端数据，避免串号上传。
 */
export function useCanvasCloudSync() {
    const { message } = App.useApp();
    const { t } = useTranslation();
    const authEnabled = useUserStore((state) => state.authEnabled);
    const user = useUserStore((state) => state.user);
    const userId = user?.id || null;
    const hydrated = useCanvasStore((state) => state.hydrated);
    const projects = useCanvasStore((state) => state.projects);
    const replaceProjects = useCanvasStore((state) => state.replaceProjects);
    const pulledForUser = useRef<string | null>(null);
    const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const skipNextPush = useRef(false);
    const knownIds = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!authEnabled || !userId || !hydrated) return;
        if (pulledForUser.current === userId) return;
        let cancelled = false;
        (async () => {
            try {
                const remote = await fetchCloudProjects();
                if (cancelled) return;
                const previousOwner = localStorage.getItem(CLOUD_OWNER_KEY);
                const local = useCanvasStore.getState().projects;
                const canMergeLocal = !previousOwner || previousOwner === userId;
                const merged = canMergeLocal ? mergeProjectsByUpdatedAt(local, remote) : remote;
                skipNextPush.current = true;
                replaceProjects(merged);
                knownIds.current = new Set(merged.map((item) => item.id));
                localStorage.setItem(CLOUD_OWNER_KEY, userId);
                pulledForUser.current = userId;
                if (canMergeLocal) {
                    const remoteIds = new Set(remote.map((item) => item.id));
                    const onlyLocal = merged.filter((item) => !remoteIds.has(item.id));
                    if (onlyLocal.length) await upsertCloudProjects(onlyLocal, userId);
                }
            } catch (error) {
                if (!cancelled) message.error(error instanceof Error ? error.message : t("auth.syncFailed"));
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [authEnabled, hydrated, message, replaceProjects, t, userId]);

    useEffect(() => {
        if (userId) return;
        pulledForUser.current = null;
        if (pushTimer.current) {
            clearTimeout(pushTimer.current);
            pushTimer.current = null;
        }
    }, [userId]);

    useEffect(() => {
        if (!authEnabled || !userId || !hydrated) return;
        if (pulledForUser.current !== userId) return;
        if (skipNextPush.current) {
            skipNextPush.current = false;
            knownIds.current = new Set(projects.map((item) => item.id));
            return;
        }
        if (pushTimer.current) clearTimeout(pushTimer.current);
        pushTimer.current = setTimeout(() => {
            pushTimer.current = null;
            const currentIds = new Set(projects.map((item) => item.id));
            const removed = [...knownIds.current].filter((id) => !currentIds.has(id));
            knownIds.current = currentIds;
            void (async () => {
                try {
                    if (removed.length) await deleteCloudProjects(removed);
                    if (projects.length) await upsertCloudProjects(projects, userId);
                } catch (error) {
                    message.error(error instanceof Error ? error.message : t("auth.syncFailed"));
                }
            })();
        }, 800);
        return () => {
            if (pushTimer.current) clearTimeout(pushTimer.current);
        };
    }, [authEnabled, hydrated, message, projects, t, userId]);
}
