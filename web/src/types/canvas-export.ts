import type { CanvasProject } from "@/stores/canvas/use-canvas-store";
import { APP_ID } from "@/constant/app-id";

export type CanvasExportFile = {
    app: typeof APP_ID;
    version: 3;
    exportedAt: string;
    projects: CanvasProjectExportItem[];
};

export type CanvasProjectExportItem = {
    project: CanvasProject;
    files: CanvasExportAsset[];
};

export type CanvasExportAsset = {
    storageKey: string;
    path: string;
    mimeType: string;
    bytes: number;
};
