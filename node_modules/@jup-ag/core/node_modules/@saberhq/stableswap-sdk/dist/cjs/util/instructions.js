"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeInstructions = exports.executeTxInstructions = exports.createMutableTransactionInstructions = void 0;
const solana_contrib_1 = require("@saberhq/solana-contrib");
const createMutableTransactionInstructions = () => ({
    instructions: [],
    signers: [],
});
exports.createMutableTransactionInstructions = createMutableTransactionInstructions;
/**
 * Executes a TransactionInstructions
 * @param title
 * @param param1
 * @param param2
 * @returns Transaction signature
 */
const executeTxInstructions = async (title, { instructions, signers }, { provider, payerSigner, options, }) => {
    console.log(`Running tx ${title}`);
    const txEnv = new solana_contrib_1.TransactionEnvelope(provider, instructions.slice(), [
        // payer of the tx
        payerSigner,
        // initialize the swap
        ...signers,
    ]);
    const sig = await txEnv.confirm(options);
    console.log(`${title} done at tx: ${sig.signature}`);
    return sig.signature;
};
exports.executeTxInstructions = executeTxInstructions;
const mergeInstructions = (mut, inst) => {
    mut.instructions.push(...inst.instructions);
    mut.signers.push(...inst.signers);
};
exports.mergeInstructions = mergeInstructions;
//# sourceMappingURL=instructions.js.map