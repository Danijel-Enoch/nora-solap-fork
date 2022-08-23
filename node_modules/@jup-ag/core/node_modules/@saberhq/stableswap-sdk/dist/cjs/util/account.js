"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadProgramAccount = void 0;
/**
 * Loads the account info of an account owned by a program.
 * @param connection
 * @param address
 * @param programId
 * @returns
 */
const loadProgramAccount = async (connection, address, programId) => {
    const accountInfo = await connection.getAccountInfo(address);
    if (accountInfo === null) {
        throw new Error("Failed to find account");
    }
    if (!accountInfo.owner.equals(programId)) {
        throw new Error(`Invalid owner: expected ${programId.toBase58()}, found ${accountInfo.owner.toBase58()}`);
    }
    return Buffer.from(accountInfo.data);
};
exports.loadProgramAccount = loadProgramAccount;
//# sourceMappingURL=account.js.map