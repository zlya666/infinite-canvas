import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Spin } from "antd";

import { useUserStore } from "@/stores/use-user-store";

/** 初始化会话；启用 Auth 且未登录时跳转登录页。 */
export function RequireAuth() {
    const location = useLocation();
    const ready = useUserStore((state) => state.ready);
    const authEnabled = useUserStore((state) => state.authEnabled);
    const user = useUserStore((state) => state.user);
    const initAuth = useUserStore((state) => state.initAuth);

    useEffect(() => {
        void initAuth();
    }, [initAuth]);

    if (!ready) {
        return (
            <div className="flex h-dvh items-center justify-center bg-background">
                <Spin size="large" />
            </div>
        );
    }

    if (authEnabled && !user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return <Outlet />;
}
