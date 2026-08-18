import { create } from "zustand";
import { persist } from "zustand/middleware";

import { appStorageKey } from "@/constant/app-id";

export type ThemeName = "light" | "dark";

type ThemeStore = {
    theme: ThemeName;
    setTheme: (theme: ThemeName) => void;
};

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set) => ({
            theme: "dark",
            setTheme: (theme) => set({ theme }),
        }),
        { name: appStorageKey("theme_store") },
    ),
);
