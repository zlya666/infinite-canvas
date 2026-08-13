import { useEffect, useState } from "react";
import { App, Button, Form, Input, Tabs } from "antd";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { UserStatusActions } from "@/components/layout/user-status-actions";
import { isSupabaseConfigured } from "@/services/supabase/auth";
import { useUserStore } from "@/stores/use-user-store";

type LoginForm = { email: string; password: string };
type RegisterForm = { email: string; password: string; displayName?: string };

export default function LoginPage() {
    const { t } = useTranslation();
    const { message } = App.useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const ready = useUserStore((state) => state.ready);
    const user = useUserStore((state) => state.user);
    const initAuth = useUserStore((state) => state.initAuth);
    const signIn = useUserStore((state) => state.signIn);
    const signUp = useUserStore((state) => state.signUp);
    const [submitting, setSubmitting] = useState(false);
    const from = (location.state as { from?: string } | null)?.from || "/canvas";
    const configured = isSupabaseConfigured();

    useEffect(() => {
        void initAuth();
    }, [initAuth]);

    if (ready && user) {
        return <Navigate to={from} replace />;
    }

    const onLogin = async (values: LoginForm) => {
        setSubmitting(true);
        try {
            await signIn(values.email, values.password);
            message.success(t("auth.loginSuccess"));
            navigate(from, { replace: true });
        } catch (error) {
            message.error(error instanceof Error ? error.message : t("auth.loginFailed"));
        } finally {
            setSubmitting(false);
        }
    };

    const onRegister = async (values: RegisterForm) => {
        setSubmitting(true);
        try {
            await signUp(values.email, values.password, values.displayName);
            const current = useUserStore.getState().user;
            if (current) {
                message.success(t("auth.registerSuccess"));
                navigate(from, { replace: true });
            } else {
                message.success(t("auth.registerCheckEmail"));
            }
        } catch (error) {
            message.error(error instanceof Error ? error.message : t("auth.registerFailed"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-dvh flex-col bg-background text-foreground">
            <header className="flex h-14 items-center justify-between border-b border-stone-200 px-6 dark:border-stone-800">
                <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-stone-950 dark:text-stone-100">
                    <span
                        className="size-5 shrink-0 bg-current"
                        style={{
                            mask: "url(/logo.svg) center / contain no-repeat",
                            WebkitMask: "url(/logo.svg) center / contain no-repeat",
                        }}
                    />
                    {t("meta.title")}
                </Link>
                <UserStatusActions showConfig={false} />
            </header>

            <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10">
                <h1 className="text-2xl font-semibold tracking-tight text-stone-950 dark:text-stone-100">{t("auth.title")}</h1>
                <p className="mt-2 text-sm text-stone-500">{t("auth.description")}</p>

                {!configured ? (
                    <div className="mt-8 rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-900/40 dark:text-stone-300">
                        <p>{t("auth.notConfigured")}</p>
                        <p className="mt-2 font-mono text-xs">VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY</p>
                        <Button type="link" className="mt-2 px-0" onClick={() => navigate("/")}>
                            {t("auth.backHome")}
                        </Button>
                    </div>
                ) : (
                    <Tabs
                        className="mt-6"
                        items={[
                            {
                                key: "login",
                                label: t("auth.login"),
                                children: (
                                    <Form layout="vertical" onFinish={onLogin} requiredMark={false} disabled={!ready || submitting}>
                                        <Form.Item name="email" label={t("auth.email")} rules={[{ required: true, type: "email", message: t("auth.emailRequired") }]}>
                                            <Input size="large" autoComplete="email" />
                                        </Form.Item>
                                        <Form.Item name="password" label={t("auth.password")} rules={[{ required: true, message: t("auth.passwordRequired") }]}>
                                            <Input.Password size="large" autoComplete="current-password" />
                                        </Form.Item>
                                        <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
                                            {t("auth.login")}
                                        </Button>
                                    </Form>
                                ),
                            },
                            {
                                key: "register",
                                label: t("auth.register"),
                                children: (
                                    <Form layout="vertical" onFinish={onRegister} requiredMark={false} disabled={!ready || submitting}>
                                        <Form.Item name="displayName" label={t("auth.displayName")}>
                                            <Input size="large" autoComplete="nickname" />
                                        </Form.Item>
                                        <Form.Item name="email" label={t("auth.email")} rules={[{ required: true, type: "email", message: t("auth.emailRequired") }]}>
                                            <Input size="large" autoComplete="email" />
                                        </Form.Item>
                                        <Form.Item
                                            name="password"
                                            label={t("auth.password")}
                                            rules={[
                                                { required: true, message: t("auth.passwordRequired") },
                                                { min: 6, message: t("auth.passwordMin") },
                                            ]}
                                        >
                                            <Input.Password size="large" autoComplete="new-password" />
                                        </Form.Item>
                                        <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
                                            {t("auth.register")}
                                        </Button>
                                    </Form>
                                ),
                            },
                        ]}
                    />
                )}
            </main>
        </div>
    );
}
