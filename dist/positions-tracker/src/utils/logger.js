"use strict";
/**
 * Centralized logging utility
 * Provides consistent logging throughout the application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = void 0;
exports.info = info;
exports.success = success;
exports.warning = warning;
exports.error = error;
exports.debug = debug;
exports.startup = startup;
exports.shutdown = shutdown;
exports.botActivity = botActivity;
exports.apiActivity = apiActivity;
exports.scheduler = scheduler;
const constants_1 = require("../constants");
var LogLevel;
(function (LogLevel) {
    LogLevel["INFO"] = "INFO";
    LogLevel["SUCCESS"] = "SUCCESS";
    LogLevel["WARNING"] = "WARNING";
    LogLevel["ERROR"] = "ERROR";
    LogLevel["DEBUG"] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Format timestamp for logging
 */
function getTimestamp() {
    return new Date().toISOString();
}
/**
 * Log an info message
 */
function info(message, data = null) {
    console.log(`[${getTimestamp()}] [INFO] ${message}`);
    if (data) {
        console.log(data);
    }
}
/**
 * Log a success message
 */
function success(message, data = null) {
    console.log(`[${getTimestamp()}] [SUCCESS] ${constants_1.EMOJIS.CHECK} ${message}`);
    if (data) {
        console.log(data);
    }
}
/**
 * Log a warning message
 */
function warning(message, data = null) {
    console.warn(`[${getTimestamp()}] [WARNING] ${constants_1.EMOJIS.WARNING} ${message}`);
    if (data) {
        console.warn(data);
    }
}
/**
 * Log an error message
 */
function error(message, errorData = null) {
    console.error(`[${getTimestamp()}] [ERROR] ${constants_1.EMOJIS.ERROR} ${message}`);
    if (errorData) {
        if (errorData instanceof Error) {
            console.error(`${constants_1.EMOJIS.ERROR} Error Details:`, errorData.message);
            if (errorData.stack) {
                console.error(errorData.stack);
            }
        }
        else {
            console.error(errorData);
        }
    }
}
/**
 * Log a debug message (only in development)
 */
function debug(message, data = null) {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
        console.log(`[${getTimestamp()}] [DEBUG] ${message}`);
        if (data) {
            console.log(data);
        }
    }
}
/**
 * Log application startup information
 */
function startup(appName = 'Application') {
    const separator = '='.repeat(50);
    console.log(separator);
    console.log(`${constants_1.EMOJIS.ROCKET} Starting ${appName}...`);
    console.log(`${constants_1.EMOJIS.CALENDAR} Started at: ${getTimestamp()}`);
    console.log(separator);
}
/**
 * Log application shutdown information
 */
function shutdown(appName = 'Application') {
    const separator = '='.repeat(50);
    console.log(separator);
    console.log(`${constants_1.EMOJIS.STOP} Shutting down ${appName}...`);
    console.log(`${constants_1.EMOJIS.CALENDAR} Shutdown at: ${getTimestamp()}`);
    console.log(separator);
}
/**
 * Log bot activity (messages, commands, etc.)
 */
function botActivity(message, context = {}) {
    const contextStr = Object.keys(context).length > 0
        ? ` | Context: ${JSON.stringify(context)}`
        : '';
    info(`${constants_1.EMOJIS.ROBOT} Bot Activity: ${message}${contextStr}`);
}
/**
 * Log API activity (requests, responses, etc.)
 */
function apiActivity(message, details = {}) {
    const detailsStr = Object.keys(details).length > 0
        ? ` | Details: ${JSON.stringify(details)}`
        : '';
    info(`${constants_1.EMOJIS.REPEAT} API Activity: ${message}${detailsStr}`);
}
/**
 * Log scheduler activity
 */
function scheduler(message) {
    info(`${constants_1.EMOJIS.CLOCK} Scheduler: ${message}`);
}
const logger = {
    LogLevel,
    info,
    success,
    warning,
    error,
    debug,
    startup,
    shutdown,
    botActivity,
    apiActivity,
    scheduler,
};
exports.default = logger;
//# sourceMappingURL=logger.js.map