"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeRateService = void 0;
// Using exchangerate-api.com free tier (1500 requests/month)
const EXCHANGE_API_BASE_URL = 'https://api.exchangerate-api.com/v4/latest';
class ExchangeRateService {
    constructor() {
        this.cache = new Map();
        this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
    }
    static getInstance() {
        if (!ExchangeRateService.instance) {
            ExchangeRateService.instance = new ExchangeRateService();
        }
        return ExchangeRateService.instance;
    }
    getCacheKey(baseCurrency) {
        return `rates_${baseCurrency}`;
    }
    isCacheValid(lastUpdated) {
        return Date.now() - lastUpdated < this.CACHE_DURATION;
    }
    async getExchangeRates(baseCurrency = 'USD') {
        const cacheKey = this.getCacheKey(baseCurrency);
        const cached = this.cache.get(cacheKey);
        // Return cached data if valid
        if (cached && this.isCacheValid(cached.lastUpdated)) {
            return {
                base: baseCurrency,
                rates: cached.rates,
                lastUpdated: new Date(cached.lastUpdated).toISOString(),
            };
        }
        try {
            const response = await fetch(`${EXCHANGE_API_BASE_URL}/${baseCurrency}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = (await response.json());
            if (!data || !data.rates) {
                throw new Error('Invalid response format from exchange rate API');
            }
            const exchangeRatesResponse = {
                base: baseCurrency,
                rates: data.rates,
                lastUpdated: new Date().toISOString(),
            };
            // Cache the results
            this.cache.set(cacheKey, {
                rates: data.rates,
                lastUpdated: Date.now(),
            });
            return exchangeRatesResponse;
        }
        catch (error) {
            console.error('Error fetching exchange rates:', error);
            // If API fails and we have cached data (even if expired), use it
            if (cached) {
                return {
                    base: baseCurrency,
                    rates: cached.rates,
                    lastUpdated: new Date(cached.lastUpdated).toISOString(),
                };
            }
            // If no cached data available, return 1:1 rates as fallback
            return {
                base: baseCurrency,
                rates: { [baseCurrency]: 1 },
                lastUpdated: new Date().toISOString(),
            };
        }
    }
    async convertAmount(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) {
            return amount;
        }
        try {
            // Get rates with USD as base (most APIs use USD as base)
            const rates = await this.getExchangeRates('USD');
            let convertedAmount;
            if (fromCurrency === 'USD') {
                // Converting from USD to target currency
                const rate = rates.rates[toCurrency];
                if (!rate) {
                    throw new Error(`Exchange rate not found for ${toCurrency}`);
                }
                convertedAmount = amount * rate;
            }
            else if (toCurrency === 'USD') {
                // Converting from source currency to USD
                const rate = rates.rates[fromCurrency];
                if (!rate) {
                    throw new Error(`Exchange rate not found for ${fromCurrency}`);
                }
                convertedAmount = amount / rate;
            }
            else {
                // Converting between two non-USD currencies
                const fromRate = rates.rates[fromCurrency];
                const toRate = rates.rates[toCurrency];
                if (!fromRate || !toRate) {
                    throw new Error(`Exchange rate not found for ${fromCurrency} or ${toCurrency}`);
                }
                // Convert to USD first, then to target currency
                const usdAmount = amount / fromRate;
                convertedAmount = usdAmount * toRate;
            }
            return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
        }
        catch (error) {
            console.error('Error converting currency:', error);
            // Return original amount as fallback
            return amount;
        }
    }
    clearCache() {
        this.cache.clear();
    }
    getCacheStatus() {
        const status = {};
        this.cache.forEach((value, key) => {
            status[key] = {
                lastUpdated: new Date(value.lastUpdated).toISOString(),
                isValid: this.isCacheValid(value.lastUpdated),
            };
        });
        return status;
    }
}
exports.ExchangeRateService = ExchangeRateService;
//# sourceMappingURL=exchange-rate.js.map