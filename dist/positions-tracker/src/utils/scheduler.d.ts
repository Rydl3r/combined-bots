/**
 * Scheduler module for automated tasks
 * Handles cron job setup and execution for position updates
 */
import * as cron from 'node-cron';
import { SchedulerConfig } from '../types';
/**
 * Setup cron job for automatic position updates
 */
export declare function setupScheduler(callback: () => Promise<void>, config: SchedulerConfig): cron.ScheduledTask;
/**
 * Stop a scheduled job
 */
export declare function stopScheduler(job: cron.ScheduledTask): void;
/**
 * Start a scheduled job
 */
export declare function startScheduler(job: cron.ScheduledTask): void;
//# sourceMappingURL=scheduler.d.ts.map