import type { CanvasProject } from "@/stores/canvas/use-canvas-store";
import { getSupabaseClient } from "@/services/supabase/client";

type ProjectRow = {
    id: string;
    user_id: string;
    name: string;
    data: CanvasProject;
    updated_at: string;
    created_at: string;
};

function toRow(project: CanvasProject, userId: string): Omit<ProjectRow, "created_at"> & { created_at?: string } {
    return {
        id: project.id,
        user_id: userId,
        name: project.title,
        data: project,
        updated_at: project.updatedAt,
        created_at: project.createdAt,
    };
}

function fromRow(row: ProjectRow): CanvasProject {
    const data = row.data && typeof row.data === "object" ? row.data : ({} as CanvasProject);
    return {
        ...data,
        id: row.id,
        title: row.name || data.title || "未命名画布",
        createdAt: data.createdAt || row.created_at,
        updatedAt: data.updatedAt || row.updated_at,
        nodes: data.nodes || [],
        connections: data.connections || [],
        chatSessions: data.chatSessions || [],
        activeChatId: data.activeChatId ?? null,
        backgroundMode: data.backgroundMode || "lines",
        showImageInfo: Boolean(data.showImageInfo),
        viewport: data.viewport || { x: 0, y: 0, k: 1 },
    };
}

/** 拉取当前登录用户的全部画布项目。 */
export async function fetchCloudProjects() {
    const supabase = getSupabaseClient();
    if (!supabase) return [] as CanvasProject[];
    const { data, error } = await supabase.from("projects").select("*").order("updated_at", { ascending: false });
    if (error) throw error;
    return ((data || []) as ProjectRow[]).map(fromRow);
}

/** 将单个项目 upsert 到云端。 */
export async function upsertCloudProject(project: CanvasProject, userId: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.from("projects").upsert(toRow(project, userId), { onConflict: "id" });
    if (error) throw error;
}

/** 批量 upsert 项目（保存防抖后调用）。 */
export async function upsertCloudProjects(projects: CanvasProject[], userId: string) {
    const supabase = getSupabaseClient();
    if (!supabase || !projects.length) return;
    const { error } = await supabase.from("projects").upsert(
        projects.map((project) => toRow(project, userId)),
        { onConflict: "id" },
    );
    if (error) throw error;
}

/** 删除云端项目。 */
export async function deleteCloudProjects(ids: string[]) {
    const supabase = getSupabaseClient();
    if (!supabase || !ids.length) return;
    const { error } = await supabase.from("projects").delete().in("id", ids);
    if (error) throw error;
}

/**
 * 合并本地与云端项目：同 id 取 updatedAt 较新者；仅本地有的保留并待上传。
 */
export function mergeProjectsByUpdatedAt(local: CanvasProject[], remote: CanvasProject[]) {
    const map = new Map<string, CanvasProject>();
    for (const project of local) map.set(project.id, project);
    for (const project of remote) {
        const existing = map.get(project.id);
        if (!existing) {
            map.set(project.id, project);
            continue;
        }
        map.set(project.id, existing.updatedAt >= project.updatedAt ? existing : project);
    }
    return [...map.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
