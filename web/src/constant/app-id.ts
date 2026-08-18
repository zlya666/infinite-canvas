export const APP_ID = "whatslove-creators";
export const APP_STORAGE_DB = "whatslove-creators";
export const APP_PLUGIN_STORAGE_DB = "whatslove-creators-plugins";

export function appStorageKey(suffix: string) {
    return `${APP_ID}:${suffix}`;
}
