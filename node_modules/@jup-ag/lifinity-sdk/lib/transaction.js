"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeSwapInstructionWithAuthority = exports.makeSwapTransactionWithAuthority = exports.getInstruction = exports.sendSwap = void 0;
// Copyright © 2022 LIFINITY FOUNDATION All Rights Reserved.
const anchor_1 = require("@project-serum/anchor");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const spl_token_2 = require("@solana/spl-token");
const token_instructions_1 = require("@project-serum/serum/lib/token-instructions");
const tokens_1 = require("./tokens");
const utils_1 = require("./utils");
function sendSwap(program, pool, fromTokenMint, toTokenMint, amountIn, minimumAmountOut) {
    return __awaiter(this, void 0, void 0, function* () {
        const { transaction, signers } = yield makeSwapAllInstructions(program, fromTokenMint, toTokenMint, pool, amountIn, minimumAmountOut);
        return yield program.provider.send(transaction, signers);
    });
}
exports.sendSwap = sendSwap;
function getInstruction(program, pool, amountIn, minimumOut, ownerAccount, fromUserAccount, toTokenAccount, fromPoolAccount, toPoolAccount, approve = true) {
    return __awaiter(this, void 0, void 0, function* () {
        let approveInstruction = null;
        let signers = [];
        let swapAmountIn = new anchor_1.BN(amountIn.toNumber());
        let swapMinimumAmountOut = new anchor_1.BN(minimumOut.toNumber());
        let userAuthority = null;
        if (approve) {
            userAuthority = web3_js_1.Keypair.generate();
            approveInstruction = yield makeApproveInstruction(ownerAccount, fromUserAccount, userAuthority.publicKey, swapAmountIn);
            signers.push(userAuthority);
        }
        let swapInstruction = yield makeSwapInstruction(program, userAuthority ? userAuthority.publicKey : ownerAccount, fromUserAccount, toTokenAccount, fromPoolAccount, toPoolAccount, swapAmountIn, swapMinimumAmountOut, pool);
        return { approveInstruction, swapInstruction, signers };
    });
}
exports.getInstruction = getInstruction;
function makeSwapAllInstructions(program, fromTokenMint, toTokenMint, pool, amountIn, minimumAmountOut) {
    return __awaiter(this, void 0, void 0, function* () {
        let transaction = new web3_js_1.Transaction();
        let signers = [];
        let amountInBN;
        let minimumAmountOutBN;
        let fromPoolAccount;
        let toPoolAccount;
        let base = 10;
        let coinDecimals = Math.pow(base, pool.poolCoinDecimal);
        let pcDecimals = Math.pow(base, pool.poolPcDecimal);
        if (fromTokenMint.toString() === pool.poolCoinMint) {
            amountInBN = new anchor_1.BN(amountIn * coinDecimals);
            minimumAmountOutBN = new anchor_1.BN(minimumAmountOut * pcDecimals);
            fromPoolAccount = new web3_js_1.PublicKey(pool.poolCoinTokenAccount);
            toPoolAccount = new web3_js_1.PublicKey(pool.poolPcTokenAccount);
        }
        else {
            amountInBN = new anchor_1.BN(amountIn * pcDecimals);
            minimumAmountOutBN = new anchor_1.BN(minimumAmountOut * coinDecimals);
            fromPoolAccount = new web3_js_1.PublicKey(pool.poolPcTokenAccount);
            toPoolAccount = new web3_js_1.PublicKey(pool.poolCoinTokenAccount);
        }
        let fromUserAccount = null;
        let toTokenAccount = null;
        if (fromTokenMint.toString() === tokens_1.WSOL.mintAddress) {
            fromUserAccount = yield (0, utils_1.createWSOLAccountIfNotExist)(program, fromUserAccount, amountInBN.toNumber(), transaction, signers);
        }
        else {
            fromUserAccount = yield (0, utils_1.findAssociatedTokenAddress)(program.provider.wallet.publicKey, fromTokenMint);
        }
        if (toTokenMint.toString() === tokens_1.WSOL.mintAddress) {
            toTokenAccount = yield (0, utils_1.createWSOLAccountIfNotExist)(program, toTokenAccount, 0, transaction, signers);
        }
        else {
            toTokenAccount = yield (0, utils_1.createAssociatedTokenAccountIfNotExist)(program, toTokenMint, transaction);
        }
        yield makeLifinityTransaction(program, transaction, signers, fromUserAccount, toTokenAccount, fromPoolAccount, toPoolAccount, amountInBN, minimumAmountOutBN, pool, true);
        if (toTokenMint.toString() === tokens_1.WSOL.mintAddress) {
            transaction.add((0, token_instructions_1.closeAccount)({
                source: toTokenAccount,
                destination: program.provider.wallet.publicKey,
                owner: program.provider.wallet.publicKey
            }));
        }
        return { transaction, signers };
    });
}
function makeLifinityTransaction(program, transaction, signers, fromUserAccount, toTokenAccount, fromPoolAccount, toPoolAccount, amountIn, minimumOut, pool, approve = true) {
    return __awaiter(this, void 0, void 0, function* () {
        let userTransferAuthority;
        if (approve) {
            userTransferAuthority = web3_js_1.Keypair.generate();
            transaction.add(yield makeApproveInstruction(program.provider.wallet.publicKey, fromUserAccount, userTransferAuthority.publicKey, amountIn));
            signers.push(userTransferAuthority);
        }
        else {
            userTransferAuthority = program.provider.wallet;
        }
        transaction.add(yield makeSwapInstruction(program, userTransferAuthority.publicKey, fromUserAccount, toTokenAccount, fromPoolAccount, toPoolAccount, amountIn, minimumOut, pool));
    });
}
function makeApproveInstruction(ownerAccount, fromUserAccount, userTransferAuthority, amountIn) {
    return __awaiter(this, void 0, void 0, function* () {
        return (spl_token_1.Token.createApproveInstruction(spl_token_2.TOKEN_PROGRAM_ID, fromUserAccount, userTransferAuthority, ownerAccount, [], amountIn.toNumber()));
    });
}
function makeSwapInstruction(program, userTransferAuthority, fromUserAccount, toTokenAccount, fromPoolAccount, toPoolAccount, amountIn, minimumOut, pool) {
    return __awaiter(this, void 0, void 0, function* () {
        let { programAuthority } = yield (0, utils_1.getProgramAuthority)(program.programId, new web3_js_1.PublicKey(pool.amm));
        return (program.instruction.swap(amountIn, minimumOut, {
            accounts: {
                authority: programAuthority,
                amm: new web3_js_1.PublicKey(pool.amm),
                userTransferAuthority: userTransferAuthority,
                sourceInfo: fromUserAccount,
                destinationInfo: toTokenAccount,
                swapSource: fromPoolAccount,
                swapDestination: toPoolAccount,
                poolMint: new web3_js_1.PublicKey(pool.poolMint),
                feeAccount: new web3_js_1.PublicKey(pool.feeAccount),
                tokenProgram: spl_token_2.TOKEN_PROGRAM_ID,
                pythPcAccount: new web3_js_1.PublicKey(pool.pythPcAccount),
                pythAccount: new web3_js_1.PublicKey(pool.pythAccount),
                configAccount: new web3_js_1.PublicKey(pool.configAccount),
            }
        }));
    });
}
function makeSwapTransactionWithAuthority(program, amountIn, minimumAmountOut, ownerAccount, fromUserAccount, toTokenAccount, fromTokenMint, pool, authority) {
    let amountInBN;
    let minimumAmountOutBN;
    let fromPoolAccount;
    let toPoolAccount;
    let base = 10;
    let coinDecimals = Math.pow(base, pool.poolCoinDecimal);
    let pcDecimals = Math.pow(base, pool.poolPcDecimal);
    if (fromTokenMint.toString() === pool.poolCoinMint) {
        amountInBN = new anchor_1.BN(amountIn * coinDecimals);
        minimumAmountOutBN = new anchor_1.BN(minimumAmountOut * pcDecimals);
        fromPoolAccount = new web3_js_1.PublicKey(pool.poolCoinTokenAccount);
        toPoolAccount = new web3_js_1.PublicKey(pool.poolPcTokenAccount);
    }
    else {
        amountInBN = new anchor_1.BN(amountIn * pcDecimals);
        minimumAmountOutBN = new anchor_1.BN(minimumAmountOut * coinDecimals);
        fromPoolAccount = new web3_js_1.PublicKey(pool.poolPcTokenAccount);
        toPoolAccount = new web3_js_1.PublicKey(pool.poolCoinTokenAccount);
    }
    let userTransferAuthority = ownerAccount;
    return makeSwapInstructionWithAuthority(program, userTransferAuthority, fromUserAccount, toTokenAccount, fromPoolAccount, toPoolAccount, amountInBN, minimumAmountOutBN, pool, authority);
}
exports.makeSwapTransactionWithAuthority = makeSwapTransactionWithAuthority;
function makeSwapInstructionWithAuthority(program, userTransferAuthority, fromUserAccount, toTokenAccount, fromPoolAccount, toPoolAccount, amountIn, minimumOut, pool, authority) {
    return (program.instruction.swap(amountIn, minimumOut, {
        accounts: {
            authority,
            amm: new web3_js_1.PublicKey(pool.amm),
            userTransferAuthority: userTransferAuthority,
            sourceInfo: fromUserAccount,
            destinationInfo: toTokenAccount,
            swapSource: fromPoolAccount,
            swapDestination: toPoolAccount,
            poolMint: new web3_js_1.PublicKey(pool.poolMint),
            feeAccount: new web3_js_1.PublicKey(pool.feeAccount),
            tokenProgram: spl_token_2.TOKEN_PROGRAM_ID,
            pythPcAccount: new web3_js_1.PublicKey(pool.pythPcAccount),
            pythAccount: new web3_js_1.PublicKey(pool.pythAccount),
            configAccount: new web3_js_1.PublicKey(pool.configAccount),
        }
    }));
}
exports.makeSwapInstructionWithAuthority = makeSwapInstructionWithAuthority;
