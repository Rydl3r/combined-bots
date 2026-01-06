"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFundingSourceLink = getFundingSourceLink;
exports.extractBaseAsset = extractBaseAsset;
/**
 * Helper to generate quick trade links for positions based on exchange and symbol
 */
function getFundingSourceLink(exchangeId, symbol) {
    if (!exchangeId || !symbol)
        return null;
    const asset = extractBaseAsset(symbol);
    if (!asset)
        return null;
    const upper = exchangeId.toUpperCase();
    // Gate.io Futures
    if (upper === 'GATE' || upper === 'GATE.IO' || upper === 'GATE.IO FUTURES') {
        return `https://www.gate.com/futures/USDT/${asset}_USDT`;
    }
    // MEXC Futures
    if (upper === 'MEXC') {
        return `https://futures.mexc.com/exchange/${asset}_USDT`;
    }
    // Binance Futures
    if (upper === 'BINANCE' || upper === 'BINANCE FUTURES') {
        return `https://www.binance.com/en/futures/${asset}USDT`;
    }
    // Bybit
    if (upper === 'BYBIT' || upper === 'BYBIT FUTURES') {
        return `https://www.bybit.com/trade/usdt/${asset}USDT`;
    }
    // Bitget
    if (upper === 'BITGET') {
        return `https://www.bitget.com/futures/usdt/${asset}USDT`;
    }
    // OKX
    if (upper === 'OKX' || upper === 'OKEX' || upper === 'OKX FUTURES') {
        return `https://www.okx.com/trade-swap/${asset?.slice(0, asset.indexOf('USDTSWAP'))?.toLowerCase()}-usdt-swap`;
    }
    // KuCoin
    if (upper === 'KUCOIN' || upper === 'KUCOIN FUTURES') {
        // KuCoin may use XBT for BTC
        const symbolForKu = asset === 'BTC' ? 'XBT' : asset;
        return `https://www.kucoin.com/futures/trade/${symbolForKu}USDTM`;
    }
    // BingX
    if (upper === 'BINGX') {
        return `https://bingx.com/en/perpetual/${asset}-USDT/`;
    }
    return null;
}
/**
 * Extract base asset from a symbol string.
 * Handles common formats like BTCUSDT, BTC/USDT, BTC_USDT, BTC-USDT, BTCUSDTM, etc.
 */
function extractBaseAsset(symbol) {
    if (!symbol)
        return null;
    // If contains a slash, take the part before it
    if (symbol.includes('/')) {
        return symbol.split('/')[0].toUpperCase();
    }
    // Normalize common separators
    const cleaned = symbol.replace(/[_-]/g, '').toUpperCase();
    // Common quote suffixes to strip
    const suffixes = [
        'USDTM',
        'USDT',
        'USDM',
        'USD',
        'USDTPERP',
        'PERP',
        'PERPETUAL',
    ];
    for (const suf of suffixes) {
        if (cleaned.endsWith(suf)) {
            return cleaned.substring(0, cleaned.length - suf.length);
        }
    }
    // If nothing matched, and cleaned looks like e.g. BTCUSD, try to remove trailing USD letters
    const match = cleaned.match(/^([A-Z]+?)(?:USD|USDT|USD[MT]?|PERP)?$/);
    if (match && match[1])
        return match[1];
    // Fallback to original uppercased symbol
    return cleaned || null;
}
//# sourceMappingURL=linkHelper.js.map