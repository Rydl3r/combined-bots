/**
 * Centralized logging utility
 * Provides consistent logging throughout the application
 */
import { LoggerContext } from '../types';
export declare enum LogLevel {
    INFO = "INFO",
    SUCCESS = "SUCCESS",
    WARNING = "WARNING",
    ERROR = "ERROR",
    DEBUG = "DEBUG"
}
/**
 * Log an info message
 */
export declare function info(message: string, data?: unknown): void;
/**
 * Log a success message
 */
export declare function success(message: string, data?: unknown): void;
/**
 * Log a warning message
 */
export declare function warning(message: string, data?: unknown): void;
/**
 * Log an error message
 */
export declare function error(message: string, errorData?: Error | unknown): void;
/**
 * Log a debug message (only in development)
 */
export declare function debug(message: string, data?: unknown): void;
/**
 * Log application startup information
 */
export declare function startup(appName?: string): void;
/**
 * Log application shutdown information
 */
export declare function shutdown(appName?: string): void;
/**
 * Log bot activity (messages, commands, etc.)
 */
export declare function botActivity(message: string, context?: LoggerContext): void;
/**
 * Log API activity (requests, responses, etc.)
 */
export declare function apiActivity(message: string, details?: LoggerContext): void;
/**
 * Log scheduler activity
 */
export declare function scheduler(message: string): void;
declare const logger: {
    LogLevel: typeof LogLevel;
    info: typeof info;
    success: typeof success;
    warning: typeof warning;
    error: typeof error;
    debug: typeof debug;
    startup: typeof startup;
    shutdown: typeof shutdown;
    botActivity: typeof botActivity;
    apiActivity: typeof apiActivity;
    scheduler: typeof scheduler;
};
export default logger;
//# sourceMappingURL=logger.d.ts.map