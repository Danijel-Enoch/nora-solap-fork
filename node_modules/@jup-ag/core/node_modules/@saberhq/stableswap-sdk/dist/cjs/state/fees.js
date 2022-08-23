"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeFees = exports.encodeFees = exports.RECOMMENDED_FEES = exports.ZERO_FEES = exports.DEFAULT_FEE = void 0;
const token_utils_1 = require("@saberhq/token-utils");
exports.DEFAULT_FEE = new token_utils_1.Percent(0, 10000);
exports.ZERO_FEES = {
    /**
     * Fee per trade
     */
    trade: exports.DEFAULT_FEE,
    withdraw: exports.DEFAULT_FEE,
    adminTrade: exports.DEFAULT_FEE,
    adminWithdraw: exports.DEFAULT_FEE,
};
const recommendedFeesRaw = {
    adminTradeFeeNumerator: 50,
    adminTradeFeeDenominator: 100,
    adminWithdrawFeeNumerator: 50,
    adminWithdrawFeeDenominator: 100,
    tradeFeeNumerator: 20,
    tradeFeeDenominator: 10000,
    withdrawFeeNumerator: 50,
    withdrawFeeDenominator: 10000,
};
exports.RECOMMENDED_FEES = {
    trade: new token_utils_1.Percent(recommendedFeesRaw.tradeFeeNumerator, recommendedFeesRaw.tradeFeeDenominator),
    withdraw: new token_utils_1.Percent(recommendedFeesRaw.withdrawFeeNumerator, recommendedFeesRaw.withdrawFeeDenominator),
    adminTrade: new token_utils_1.Percent(recommendedFeesRaw.adminTradeFeeNumerator, recommendedFeesRaw.adminTradeFeeDenominator),
    adminWithdraw: new token_utils_1.Percent(recommendedFeesRaw.adminWithdrawFeeNumerator, recommendedFeesRaw.adminWithdrawFeeDenominator),
};
const encodeFees = (fees) => ({
    adminTradeFeeNumerator: new token_utils_1.u64(fees.adminTrade.numerator.toString()).toBuffer(),
    adminTradeFeeDenominator: new token_utils_1.u64(fees.adminTrade.denominator.toString()).toBuffer(),
    adminWithdrawFeeNumerator: new token_utils_1.u64(fees.adminWithdraw.numerator.toString()).toBuffer(),
    adminWithdrawFeeDenominator: new token_utils_1.u64(fees.adminWithdraw.denominator.toString()).toBuffer(),
    tradeFeeNumerator: new token_utils_1.u64(fees.trade.numerator.toString()).toBuffer(),
    tradeFeeDenominator: new token_utils_1.u64(fees.trade.denominator.toString()).toBuffer(),
    withdrawFeeNumerator: new token_utils_1.u64(fees.withdraw.numerator.toString()).toBuffer(),
    withdrawFeeDenominator: new token_utils_1.u64(fees.withdraw.denominator.toString()).toBuffer(),
});
exports.encodeFees = encodeFees;
const decodeFees = (raw) => ({
    adminTrade: new token_utils_1.Percent(token_utils_1.u64.fromBuffer(Buffer.from(raw.adminTradeFeeNumerator)).toString(), token_utils_1.u64.fromBuffer(Buffer.from(raw.adminTradeFeeDenominator)).toString()),
    adminWithdraw: new token_utils_1.Percent(token_utils_1.u64.fromBuffer(Buffer.from(raw.adminWithdrawFeeNumerator)).toString(), token_utils_1.u64.fromBuffer(Buffer.from(raw.adminWithdrawFeeDenominator)).toString()),
    trade: new token_utils_1.Percent(token_utils_1.u64.fromBuffer(Buffer.from(raw.tradeFeeNumerator)).toString(), token_utils_1.u64.fromBuffer(Buffer.from(raw.tradeFeeDenominator)).toString()),
    withdraw: new token_utils_1.Percent(token_utils_1.u64.fromBuffer(Buffer.from(raw.withdrawFeeNumerator)).toString(), token_utils_1.u64.fromBuffer(Buffer.from(raw.withdrawFeeDenominator)).toString()),
});
exports.decodeFees = decodeFees;
//# sourceMappingURL=fees.js.map