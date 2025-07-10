// // src/lib/navigation.ts
// 'use client';

// import { logger } from '@/modules';

// /**
//  * Navigation helper utilities for consistent routing throughout the application
//  * 
//  * These utilities provide a centralized way to handle navigation between different
//  * parts of our interview application, with proper logging and error handling.
//  */

// export const AppRoutes = {
//     HOME: '/',
//     CAPTURE_CONTEXT: '/capture-context',
//     CHAT: '/chat',
// } as const;

// export type AppRoute = typeof AppRoutes[keyof typeof AppRoutes];

// /**
//  * Navigate to a specific route with logging
//  * @param route The route to navigate to
//  * @param replace Whether to replace the current history entry
//  */
// export const navigateToRoute = (route: AppRoute, replace = false): void => {
//     logger.info(`🧭 Navigating to ${route}${replace ? ' (replace)' : ''}`);
    
//     if (typeof window !== 'undefined') {
//         if (replace) {
//             window.location.replace(route);
//         } else {
//             window.location.href = route;
//         }
//     }
// };

// /**
//  * Navigate to home page
//  */
// export const goHomeHome = (): void => {
//     navigateToRoute(AppRoutes.HOME);
// };

// /**
//  * Navigate to context capture page
//  */
// export const goToContextCapture = (): void => {
//     navigateToRoute(AppRoutes.CAPTURE_CONTEXT);
// };

// /**
//  * Navigate to chat page
//  */
// export const goToChat = (): void => {
//     navigateToRoute(AppRoutes.CHAT);
// };

// /**
//  * Get the display name for a route (useful for breadcrumbs, titles, etc.)
//  * @param route The route to get the display name for
//  * @returns Human-readable route name
//  */
// export const getRouteDisplayName = (route: AppRoute): string => {
//     switch (route) {
//         case AppRoutes.HOME:
//             return 'Home';
//         case AppRoutes.CAPTURE_CONTEXT:
//             return 'Interview Setup';
//         case AppRoutes.CHAT:
//             return 'Chat Session';
//         default:
//             return 'Unknown Page';
//     }
// };

// /**
//  * Check if a route is valid
//  * @param route The route to validate
//  * @returns Whether the route is valid
//  */
// export const isValidRoute = (route: string): route is AppRoute => {
//     return Object.values(AppRoutes).includes(route as AppRoute);
// };

// /**
//  * Get the current route (client-side only)
//  * @returns Current route or null if not available
//  */
// export const getCurrentRoute = (): AppRoute | null => {
//     if (typeof window !== 'undefined') {
//         const pathname = window.location.pathname;
//         if (isValidRoute(pathname)) {
//             return pathname;
//         }
//     }
//     return null;
// };

// /**
//  * Navigation flow helper - determines the next logical step in the interview process
//  * @param hasValidContext Whether the user has valid interview context
//  * @param currentRoute The current route the user is on
//  * @returns The recommended next route
//  */
// export const getNextLogicalRoute = (
//     hasValidContext: boolean, 
//     currentRoute: AppRoute | null
// ): AppRoute => {
//     // If we're on the home page
//     if (currentRoute === AppRoutes.HOME) {
//         return hasValidContext ? AppRoutes.CHAT : AppRoutes.CAPTURE_CONTEXT;
//     }
    
//     // If we're on the context capture page
//     if (currentRoute === AppRoutes.CAPTURE_CONTEXT) {
//         return AppRoutes.CHAT; // After setup, always go to chat
//     }
    
//     // If we're on the chat page but don't have context
//     if (currentRoute === AppRoutes.CHAT && !hasValidContext) {
//         return AppRoutes.CAPTURE_CONTEXT; // Need to set up first
//     }
    
//     // Default case - if in doubt, check context and route accordingly
//     return hasValidContext ? AppRoutes.CHAT : AppRoutes.CAPTURE_CONTEXT;
// };

// /**
//  * Safe navigation function that respects the application flow
//  * @param targetRoute Where the user wants to go
//  * @param hasValidContext Whether they have valid context
//  * @param allowBypass Whether to allow bypassing the normal flow (for admin/debug)
//  */
// export const safeNavigateTo = (
//     targetRoute: AppRoute, 
//     hasValidContext: boolean, 
//     allowBypass = false
// ): void => {
//     // If trying to access chat without context (and not bypassing), redirect to setup
//     if (targetRoute === AppRoutes.CHAT && !hasValidContext && !allowBypass) {
//         logger.warning('⚠️ Attempted to access chat without valid context, redirecting to setup');
//         navigateToRoute(AppRoutes.CAPTURE_CONTEXT);
//         return;
//     }
    
//     // Otherwise, navigate normally
//     navigateToRoute(targetRoute);
// };

// /**
//  * Reset the entire application state and return to home
//  * This is useful for "start over" functionality
//  */
// export const resetAndGoHome = (): void => {
//     logger.info('🔄 Resetting application state and returning to home');
    
//     // Clear any stored context
//     if (typeof window !== 'undefined') {
//         try {
//             sessionStorage.removeItem('interview_context');
//             localStorage.removeItem('interview_context'); // Just in case it was stored here too
//         } catch (error) {
//             logger.warning('Could not clear stored context:', error);
//         }
//     }
    
//     // Navigate home with replace to clear history
//     navigateToRoute(AppRoutes.HOME, true);
// };