"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeY = exports.computeD = void 0;
const tslib_1 = require("tslib");
const token_utils_1 = require("@saberhq/token-utils");
const jsbi_1 = tslib_1.__importDefault(require("jsbi"));
const N_COINS = jsbi_1.default.BigInt(2); // n
const abs = (a) => {
    if (jsbi_1.default.greaterThan(a, token_utils_1.ZERO)) {
        return a;
    }
    return jsbi_1.default.unaryMinus(a);
};
// maximum iterations of newton's method approximation
const MAX_ITERS = 20;
/**
 * Compute the StableSwap invariant
 * @param ampFactor Amplification coefficient (A)
 * @param amountA Swap balance of token A
 * @param amountB Swap balance of token B
 * Reference: https://github.com/curvefi/curve-contract/blob/7116b4a261580813ef057887c5009e22473ddb7d/tests/simulation.py#L31
 */
const computeD = (ampFactor, amountA, amountB) => {
    const Ann = jsbi_1.default.multiply(ampFactor, N_COINS); // A*n^n
    const S = jsbi_1.default.add(amountA, amountB); // sum(x_i), a.k.a S
    if (jsbi_1.default.equal(S, token_utils_1.ZERO)) {
        return token_utils_1.ZERO;
    }
    let dPrev = token_utils_1.ZERO;
    let d = S;
    for (let i = 0; jsbi_1.default.greaterThan(abs(jsbi_1.default.subtract(d, dPrev)), token_utils_1.ONE) && i < MAX_ITERS; i++) {
        dPrev = d;
        let dP = d;
        dP = jsbi_1.default.divide(jsbi_1.default.multiply(dP, d), jsbi_1.default.multiply(amountA, N_COINS));
        dP = jsbi_1.default.divide(jsbi_1.default.multiply(dP, d), jsbi_1.default.multiply(amountB, N_COINS));
        const dNumerator = jsbi_1.default.multiply(d, jsbi_1.default.add(jsbi_1.default.multiply(Ann, S), jsbi_1.default.multiply(dP, N_COINS)));
        const dDenominator = jsbi_1.default.add(jsbi_1.default.multiply(d, jsbi_1.default.subtract(Ann, token_utils_1.ONE)), jsbi_1.default.multiply(dP, jsbi_1.default.add(N_COINS, token_utils_1.ONE)));
        d = jsbi_1.default.divide(dNumerator, dDenominator);
    }
    return d;
};
exports.computeD = computeD;
/**
 * Compute Y amount in respect to X on the StableSwap curve
 * @param ampFactor Amplification coefficient (A)
 * @param x The quantity of underlying asset
 * @param d StableSwap invariant
 * Reference: https://github.com/curvefi/curve-contract/blob/7116b4a261580813ef057887c5009e22473ddb7d/tests/simulation.py#L55
 */
const computeY = (ampFactor, x, d) => {
    const Ann = jsbi_1.default.multiply(ampFactor, N_COINS); // A*n^n
    // sum' = prod' = x
    const b = jsbi_1.default.subtract(jsbi_1.default.add(x, jsbi_1.default.divide(d, Ann)), d); // b = sum' - (A*n**n - 1) * D / (A * n**n)
    const c = jsbi_1.default.divide(jsbi_1.default.multiply(jsbi_1.default.multiply(d, // c =  D ** (n + 1) / (n ** (2 * n) * prod' * A)
    d), d), jsbi_1.default.multiply(N_COINS, jsbi_1.default.multiply(N_COINS, jsbi_1.default.multiply(x, Ann))));
    let yPrev = token_utils_1.ZERO;
    let y = d;
    for (let i = 0; i < MAX_ITERS && jsbi_1.default.greaterThan(abs(jsbi_1.default.subtract(y, yPrev)), token_utils_1.ONE); i++) {
        yPrev = y;
        y = jsbi_1.default.divide(jsbi_1.default.add(jsbi_1.default.multiply(y, y), c), jsbi_1.default.add(jsbi_1.default.multiply(N_COINS, y), b));
    }
    return y;
};
exports.computeY = computeY;
//# sourceMappingURL=curve.js.map