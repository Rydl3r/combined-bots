"use strict";
/**
 * Scheduler module for automated tasks
 * Handles cron job setup and execution for position updates
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupScheduler = setupScheduler;
exports.stopScheduler = stopScheduler;
exports.startScheduler = startScheduler;
const cron = __importStar(require("node-cron"));
const logger_1 = __importDefault(require("./logger"));
/**
 * Setup cron job for automatic position updates
 */
function setupScheduler(callback, config) {
    const { cronExpression } = config;
    logger_1.default.scheduler(`Setting up scheduler with expression: ${cronExpression}`);
    const job = cron.schedule(cronExpression, async () => {
        try {
            logger_1.default.scheduler('Executing scheduled task...');
            await callback();
        }
        catch (error) {
            logger_1.default.error('Error in scheduled task:', error);
        }
    }, {
        scheduled: true,
        timezone: 'UTC',
    });
    logger_1.default.success('Scheduler configured successfully');
    return job;
}
/**
 * Stop a scheduled job
 */
function stopScheduler(job) {
    if (job) {
        logger_1.default.scheduler('Stopping scheduled job...');
        job.stop();
        logger_1.default.success('Scheduled job stopped');
    }
}
/**
 * Start a scheduled job
 */
function startScheduler(job) {
    if (job) {
        logger_1.default.scheduler('Starting scheduled job...');
        job.start();
        logger_1.default.success('Scheduled job started');
    }
}
//# sourceMappingURL=scheduler.js.map