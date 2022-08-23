/// <reference types="node" />
import type { Connection, PublicKey } from "@solana/web3.js";
/**
 * Loads the account info of an account owned by a program.
 * @param connection
 * @param address
 * @param programId
 * @returns
 */
export declare const loadProgramAccount: (connection: Connection, address: PublicKey, programId: PublicKey) => Promise<Buffer>;
//# sourceMappingURL=account.d.ts.map