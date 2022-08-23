"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StableSwapLayout = exports.FeesLayout = void 0;
const tslib_1 = require("tslib");
const token_utils_1 = require("@saberhq/token-utils");
const BufferLayout = tslib_1.__importStar(require("@solana/buffer-layout"));
/**
 * Layout for StableSwap fees
 */
exports.FeesLayout = BufferLayout.struct([
    (0, token_utils_1.Uint64Layout)("adminTradeFeeNumerator"),
    (0, token_utils_1.Uint64Layout)("adminTradeFeeDenominator"),
    (0, token_utils_1.Uint64Layout)("adminWithdrawFeeNumerator"),
    (0, token_utils_1.Uint64Layout)("adminWithdrawFeeDenominator"),
    (0, token_utils_1.Uint64Layout)("tradeFeeNumerator"),
    (0, token_utils_1.Uint64Layout)("tradeFeeDenominator"),
    (0, token_utils_1.Uint64Layout)("withdrawFeeNumerator"),
    (0, token_utils_1.Uint64Layout)("withdrawFeeDenominator"),
], "fees");
/**
 * Layout for stable swap state
 */
exports.StableSwapLayout = BufferLayout.struct([
    BufferLayout.u8("isInitialized"),
    BufferLayout.u8("isPaused"),
    BufferLayout.u8("nonce"),
    (0, token_utils_1.Uint64Layout)("initialAmpFactor"),
    (0, token_utils_1.Uint64Layout)("targetAmpFactor"),
    BufferLayout.ns64("startRampTs"),
    BufferLayout.ns64("stopRampTs"),
    BufferLayout.ns64("futureAdminDeadline"),
    (0, token_utils_1.PublicKeyLayout)("futureAdminAccount"),
    (0, token_utils_1.PublicKeyLayout)("adminAccount"),
    (0, token_utils_1.PublicKeyLayout)("tokenAccountA"),
    (0, token_utils_1.PublicKeyLayout)("tokenAccountB"),
    (0, token_utils_1.PublicKeyLayout)("tokenPool"),
    (0, token_utils_1.PublicKeyLayout)("mintA"),
    (0, token_utils_1.PublicKeyLayout)("mintB"),
    (0, token_utils_1.PublicKeyLayout)("adminFeeAccountA"),
    (0, token_utils_1.PublicKeyLayout)("adminFeeAccountB"),
    exports.FeesLayout,
]);
//# sourceMappingURL=layout.js.map