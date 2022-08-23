import type { Provider } from "@saberhq/solana-contrib";
import type { ConfirmOptions, Signer, TransactionInstruction } from "@solana/web3.js";
export interface TransactionInstructions {
    /**
     * Transaction instructions
     */
    instructions: readonly TransactionInstruction[];
    /**
     * Additional transaction signers if applicable
     */
    signers: readonly Signer[];
}
export interface MutableTransactionInstructions {
    /**
     * Transaction instructions
     */
    instructions: TransactionInstruction[];
    /**
     * Additional transaction signers if applicable
     */
    signers: Signer[];
}
export declare const createMutableTransactionInstructions: () => MutableTransactionInstructions;
/**
 * Executes a TransactionInstructions
 * @param title
 * @param param1
 * @param param2
 * @returns Transaction signature
 */
export declare const executeTxInstructions: (title: string, { instructions, signers }: TransactionInstructions, { provider, payerSigner, options, }: {
    provider: Provider;
    payerSigner: Signer;
    options?: ConfirmOptions | undefined;
}) => Promise<string>;
export declare const mergeInstructions: (mut: MutableTransactionInstructions, inst: TransactionInstructions) => void;
//# sourceMappingURL=instructions.d.ts.map