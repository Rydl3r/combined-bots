import { ExchangeRatesResponse } from './types';
export declare class ExchangeRateService {
    private static instance;
    private cache;
    private readonly CACHE_DURATION;
    static getInstance(): ExchangeRateService;
    private getCacheKey;
    private isCacheValid;
    getExchangeRates(baseCurrency?: string): Promise<ExchangeRatesResponse>;
    convertAmount(amount: number, fromCurrency: string, toCurrency: string): Promise<number>;
    clearCache(): void;
    getCacheStatus(): {
        [key: string]: {
            lastUpdated: string;
            isValid: boolean;
        };
    };
}
//# sourceMappingURL=exchange-rate.d.ts.map