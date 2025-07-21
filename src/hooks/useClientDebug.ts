// src\hooks\useClientDebug.ts
'use client';

import { useEffect } from 'react';

export const useClientDebug = (componentName: string) => {
    useEffect(() => {
        // ✅ SAFE: This only runs on client
        console.group(`🔥 ${componentName.toUpperCase()} CLIENT RENDER`);
        console.log(`📍 ${componentName} mounted on client`);
        console.log('🌍 Client state:', {
            url: window.location.href,
            timestamp: new Date().toISOString(),
            localStorage: typeof Storage !== 'undefined',
            sessionStorage: typeof Storage !== 'undefined',
        });
        console.trace(`📚 ${componentName} mount stack`);
        console.groupEnd();

        return () => {
            console.log(`🚪 ${componentName} unmounted`);
        };
    }, [componentName]);
};
