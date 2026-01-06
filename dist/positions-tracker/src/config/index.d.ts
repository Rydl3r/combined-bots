/**
 * Configuration module for Positions Tracker Bot
 * Centralizes all configuration management and validation
 */
import { AppConfig } from '../types';
/**
 * Application configuration with validation
 */
export declare function loadConfiguration(): AppConfig;
/**
 * Validate required configuration values
 */
export declare function validateConfiguration(config: AppConfig): void;
/**
 * Log configuration details (without sensitive information)
 */
export declare function logConfiguration(config: AppConfig): void;
//# sourceMappingURL=index.d.ts.map