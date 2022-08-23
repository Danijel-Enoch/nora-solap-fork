import * as BufferLayout from "@solana/buffer-layout";
/**
 * Raw representation of fees.
 */
export interface RawFees {
    adminTradeFeeNumerator: Uint8Array;
    adminTradeFeeDenominator: Uint8Array;
    adminWithdrawFeeNumerator: Uint8Array;
    adminWithdrawFeeDenominator: Uint8Array;
    tradeFeeNumerator: Uint8Array;
    tradeFeeDenominator: Uint8Array;
    withdrawFeeNumerator: Uint8Array;
    withdrawFeeDenominator: Uint8Array;
}
/**
 * Layout for StableSwap fees
 */
export declare const FeesLayout: BufferLayout.Structure<RawFees>;
/**
 * Layout for stable swap state
 */
export declare const StableSwapLayout: BufferLayout.Structure<{
    isInitialized: 0 | 1;
    isPaused: 0 | 1;
    nonce: number;
    initialAmpFactor: Uint8Array;
    targetAmpFactor: Uint8Array;
    startRampTs: number;
    stopRampTs: number;
    futureAdminDeadline: number;
    futureAdminAccount: Uint8Array;
    adminAccount: Uint8Array;
    tokenAccountA: Uint8Array;
    tokenAccountB: Uint8Array;
    tokenPool: Uint8Array;
    mintA: Uint8Array;
    mintB: Uint8Array;
    adminFeeAccountA: Uint8Array;
    adminFeeAccountB: Uint8Array;
    fees: RawFees;
}>;
//# sourceMappingURL=layout.d.ts.map