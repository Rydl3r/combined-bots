"use strict";
/**
 * Exchange abstraction layer
 * Defines interfaces for multi-exchange support
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionType = exports.Exchange = void 0;
/**
 * Exchange identifiers
 */
var Exchange;
(function (Exchange) {
    Exchange["MEXC"] = "MEXC";
    Exchange["GATE"] = "GATE";
    Exchange["BINANCE"] = "BINANCE";
    Exchange["BYBIT"] = "BYBIT";
    Exchange["KUCOIN"] = "KUCOIN";
    Exchange["OKX"] = "OKX";
    Exchange["BITGET"] = "BITGET";
    Exchange["BINGX"] = "BINGX";
})(Exchange || (exports.Exchange = Exchange = {}));
/**
 * Position types (Long/Short)
 */
var PositionType;
(function (PositionType) {
    PositionType[PositionType["LONG"] = 1] = "LONG";
    PositionType[PositionType["SHORT"] = 2] = "SHORT";
})(PositionType || (exports.PositionType = PositionType = {}));
//# sourceMappingURL=exchange.js.map