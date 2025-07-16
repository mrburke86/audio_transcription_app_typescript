// src/lib/navigation.ts
'use client';

export const AppRoutes = {
    HOME: '/',
    CAPTURE_CONTEXT: '/capture-context',
    CHAT: '/chat',
} as const;

export type AppRoute = (typeof AppRoutes)[keyof typeof AppRoutes];

export const isValidRoute = (route: string): route is AppRoute => {
    return Object.values(AppRoutes).includes(route as AppRoute);
};

export const navigateTo = (route: AppRoute) => (window.location.href = route);
export const navigateAndReplace = (route: AppRoute) => window.location.replace(route);
