import { TransactionEnvelope } from "@saberhq/solana-contrib";
export const createMutableTransactionInstructions = () => ({
    instructions: [],
    signers: [],
});
/**
 * Executes a TransactionInstructions
 * @param title
 * @param param1
 * @param param2
 * @returns Transaction signature
 */
export const executeTxInstructions = async (title, { instructions, signers }, { provider, payerSigner, options, }) => {
    console.log(`Running tx ${title}`);
    const txEnv = new TransactionEnvelope(provider, instructions.slice(), [
        // payer of the tx
        payerSigner,
        // initialize the swap
        ...signers,
    ]);
    const sig = await txEnv.confirm(options);
    console.log(`${title} done at tx: ${sig.signature}`);
    return sig.signature;
};
export const mergeInstructions = (mut, inst) => {
    mut.instructions.push(...inst.instructions);
    mut.signers.push(...inst.signers);
};
//# sourceMappingURL=instructions.js.map