import { TransactionInstruction } from "@solana/web3.js";
export const buildInstruction = ({ config: { swapProgramID }, keys, data, }) => {
    return new TransactionInstruction({
        keys,
        programId: swapProgramID,
        data,
    });
};
//# sourceMappingURL=common.js.map