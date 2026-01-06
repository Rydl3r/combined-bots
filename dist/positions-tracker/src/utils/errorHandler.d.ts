/**
 * Centralized error handling utilities
 * Provides consistent error handling and reporting throughout the application
 */
/**
 * Type for bot context in error handlers
 */
type BotContext = {
    chat?: {
        id: number;
    };
    from?: {
        id: number;
        username?: string;
    };
    message?: {
        text?: string;
    };
};
/**
 * Custom error classes for better error categorization
 */
export declare class ConfigurationError extends Error {
    details: string[] | null;
    constructor(message: string, details?: string[] | null);
}
export declare class APIError extends Error {
    statusCode: number | null;
    response: unknown;
    constructor(message: string, statusCode?: number | null, response?: unknown);
}
export declare class BotError extends Error {
    context: unknown;
    constructor(message: string, context?: unknown);
}
/**
 * Handle and log configuration errors
 */
export declare function handleConfigurationError(error: ConfigurationError): void;
/**
 * Handle and log API errors
 */
export declare function handleAPIError(error: Error | APIError, context?: string): void;
/**
 * Handle and log bot errors
 */
export declare function handleBotError(error: Error, ctx?: BotContext): void;
/**
 * Handle uncaught exceptions
 */
export declare function handleUncaughtException(error: Error): void;
/**
 * Handle unhandled promise rejections
 */
export declare function handleUnhandledRejection(reason: unknown, promise: Promise<unknown>): void;
/**
 * Wrap async functions with error handling
 */
export declare function wrapAsync<T extends (...args: any[]) => Promise<any>>(fn: T, context?: string): T;
/**
 * Format error for user display (removes sensitive information)
 */
export declare function formatUserError(error: Error): string;
/**
 * Setup global error handlers
 */
export declare function setupGlobalErrorHandlers(): void;
export {};
//# sourceMappingURL=errorHandler.d.ts.map