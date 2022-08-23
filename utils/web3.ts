export {/*

import { initializeAccount } from '@project-serum/serum/lib/token-instructions'
// @ts-ignore without ts ignore, yarn build will failed
import { Token,
  AccountInfo as TokenAccount,  
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintInfo } from '@solana/spl-token'
import { Market, OpenOrders } from "@project-serum/serum";
import { Account,
AccountInfo,
  Commitment,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionSignature,
  SYSVAR_RENT_PUBKEY,
  Keypair,
  Signer
} from '@solana/web3.js'

import { SOL_MINT, WRAPPED_SOL_MINT, DEX_PID } from "./pubkeys";
import { Swap } from '@project-serum/swap';

export async function createAccountTransactions(
  swapContext: Swap,
  toMint: PublicKey,
  quoteMint: PublicKey | undefined,
  fromMintInfo: MintInfo | null | undefined, 
  toMintInfo: MintInfo  | null | undefined,
  quoteMintInfo: MintInfo  | null | undefined, 
  toWallet: { publicKey: PublicKey, account: TokenAccount } | null | undefined,
  quoteWallet: { publicKey: PublicKey, account: TokenAccount } | null | undefined,
  fromMarket: Market | undefined,
  toMarket: Market | undefined,
  fromOpenOrders: OpenOrders[] | undefined,
  toOpenOrders: OpenOrders[] | undefined
  ): Promise<{ 
    tx: Transaction, 
    signers: Signer[], 
    isCreatingTo: boolean, 
    isCreatingQuote: boolean,
    isCreatingFromOO: boolean,
    isCreatingToOO: boolean
  }> {

  let isCreatingTo = false, isCreatingQuote = false, isCreatingFromOO = false, isCreatingToOO = false;

  if (!fromMintInfo || !toMintInfo) {
    throw new Error("Unable to calculate mint decimals");
  }
  if (!quoteMint || !quoteMintInfo) {
    throw new Error("Quote mint not found");
  }
  const tx = new Transaction();
  const signers : any[] = [];
  if (!toWallet) {
    const associatedTokenPubkey = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      toMint,
      swapContext.program.provider.wallet.publicKey
    );
    tx.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        toMint,
        associatedTokenPubkey,
        swapContext.program.provider.wallet.publicKey,
        swapContext.program.provider.wallet.publicKey
      )
    );
    isCreatingTo = true
  }
  if (!quoteWallet && !quoteMint.equals(toMint)) {
    console.log('creating quoteMint wallet for mint: ', quoteMint.toString())
    const quoteAssociatedPubkey = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      quoteMint,
      swapContext.program.provider.wallet.publicKey
    );
    tx.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        quoteMint,
        quoteAssociatedPubkey,
        swapContext.program.provider.wallet.publicKey,
        swapContext.program.provider.wallet.publicKey
      )
    );
    isCreatingQuote = true
  }
  console.log('fromMarket: ', fromMarket)
  if (fromMarket && !fromOpenOrders) {
    console.log('add creating fromOpenOrders account')
    const ooFrom = Keypair.generate();
    signers.push(ooFrom);
    tx.add(
      await OpenOrders.makeCreateAccountTransaction(
        swapContext.program.provider.connection,
        fromMarket.address,
        swapContext.program.provider.wallet.publicKey,
        ooFrom.publicKey,
        DEX_PID
      )
    );
    tx.add(
      swapContext.program.instruction.initAccount({
        accounts: {
          openOrders: ooFrom.publicKey,
          authority: swapContext.program.provider.wallet.publicKey,
          market: fromMarket.address,
          dexProgram: DEX_PID,
          rent: SYSVAR_RENT_PUBKEY,
        },
      })
    );
    isCreatingFromOO = true
  }
  if (toMarket && !toOpenOrders) {
    const ooTo = Keypair.generate();
    signers.push(ooTo);
    tx.add(
      await OpenOrders.makeCreateAccountTransaction(
        swapContext.program.provider.connection,
        toMarket.address,
        swapContext.program.provider.wallet.publicKey,
        ooTo.publicKey,
        DEX_PID
      )
    );
    tx.add(
      swapContext.program.instruction.initAccount({
        accounts: {
          openOrders: ooTo.publicKey,
          authority: swapContext.program.provider.wallet.publicKey,
          market: toMarket.address,
          dexProgram: DEX_PID,
          rent: SYSVAR_RENT_PUBKEY,
        },
      })
    );
    isCreatingToOO = true
  }
  return { tx, signers, isCreatingTo, isCreatingQuote, isCreatingFromOO, isCreatingToOO }
}

// export async function createAssociatedTokenAccountIfNotExist(
//   account: string | undefined | null,
//   owner: PublicKey,
//   mintAddress: string,

//   transaction: Transaction,
//   atas: string[] = []
// ) {
//   let publicKey
//   if (account) {
//     publicKey = new PublicKey(account)
//   }

//   const mint = new PublicKey(mintAddress)
//   // @ts-ignore without ts ignore, yarn build will failed
//   const ata = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, owner, true)

//   if ((!publicKey || !ata.equals(publicKey)) && !atas.includes(ata.toBase58())) {
//     transaction.add(
//       Token.createAssociatedTokenAccountInstruction(
//         ASSOCIATED_TOKEN_PROGRAM_ID,
//         TOKEN_PROGRAM_ID,
//         mint,
//         ata,
//         owner,
//         owner
//       )
//     )
//     atas.push(ata.toBase58())
//   }

//   return ata
// }

*/}