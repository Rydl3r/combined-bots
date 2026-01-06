/**
 * Helper to generate quick trade links for positions based on exchange and symbol
 */
export declare function getFundingSourceLink(exchangeId: string, symbol: string): string | null;
/**
 * Extract base asset from a symbol string.
 * Handles common formats like BTCUSDT, BTC/USDT, BTC_USDT, BTC-USDT, BTCUSDTM, etc.
 */
export declare function extractBaseAsset(symbol: string): string | null;
//# sourceMappingURL=linkHelper.d.ts.map