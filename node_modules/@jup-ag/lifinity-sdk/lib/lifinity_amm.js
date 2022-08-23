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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSwapTransactionWithAuthority = exports.getSwapInstruction = exports.getAmountOut = exports.Lifinity = void 0;
// Copyright © 2022 LIFINITY FOUNDATION All Rights Reserved.
const anchor_1 = require("@project-serum/anchor");
const web3_js_1 = require("@solana/web3.js");
const decimal_js_1 = __importDefault(require("decimal.js"));
const lifinity_amm_1 = require("./idl/lifinity_amm");
const network_1 = require("./network");
const pool_1 = require("./pool");
const transaction_1 = require("./transaction");
const utils_1 = require("./utils");
const curve_1 = require("./curve");
class Lifinity {
    constructor(connection, wallet) {
        this.stateAddress = web3_js_1.PublicKey.default;
        this.programAuthority = web3_js_1.PublicKey.default;
        this.connection = connection;
        this.wallet = wallet;
        const programAddress = new web3_js_1.PublicKey((0, network_1.getProgramAddress)());
        const provider = new anchor_1.Provider(connection, wallet, anchor_1.Provider.defaultOptions());
        this.program = new anchor_1.Program(lifinity_amm_1.IDL, programAddress, provider);
    }
    static build(connection, wallet) {
        return __awaiter(this, void 0, void 0, function* () {
            const instance = new Lifinity(connection, wallet);
            return instance;
        });
    }
    swap(amountIn, minimumAmountOut, fromMint, toMint) {
        return __awaiter(this, void 0, void 0, function* () {
            const poolInfo = (0, pool_1.getPool)(fromMint.toString(), toMint.toString());
            try {
                const tx = yield (0, transaction_1.sendSwap)(this.program, poolInfo, fromMint, toMint, amountIn, minimumAmountOut);
                return tx;
            }
            catch (error) {
                console.error(error);
                return "";
            }
        });
    }
}
exports.Lifinity = Lifinity;
;
function getAmountOut(connection, amountIn, fromMint, toMint, slippage) {
    return __awaiter(this, void 0, void 0, function* () {
        const poolInfo = (0, pool_1.getPool)(fromMint.toString(), toMint.toString());
        if (poolInfo) {
            let amount = new decimal_js_1.default(amountIn);
            let tradeDirection;
            let inDecimal;
            let outDecimal;
            if (poolInfo.poolCoinMint === fromMint.toString()) {
                amount = amount.times(new decimal_js_1.default(10).pow(poolInfo.poolCoinDecimal));
                inDecimal = poolInfo.poolCoinDecimal;
                outDecimal = poolInfo.poolPcDecimal;
                tradeDirection = curve_1.TradeDirection.AtoB;
            }
            else {
                amount = amount.times(new decimal_js_1.default(10).pow(poolInfo.poolPcDecimal));
                inDecimal = poolInfo.poolPcDecimal;
                outDecimal = poolInfo.poolCoinDecimal;
                tradeDirection = curve_1.TradeDirection.BtoA;
            }
            const publicKeys = [
                new web3_js_1.PublicKey(poolInfo.amm),
                new web3_js_1.PublicKey(poolInfo.poolCoinTokenAccount),
                new web3_js_1.PublicKey(poolInfo.poolPcTokenAccount),
                new web3_js_1.PublicKey(poolInfo.configAccount),
                new web3_js_1.PublicKey(poolInfo.pythAccount),
            ];
            if (poolInfo.pythAccount !== poolInfo.pythPcAccount) {
                publicKeys.push(new web3_js_1.PublicKey(poolInfo.pythPcAccount));
            }
            try {
                const multipleInfo = yield (0, utils_1.getMultipleAccounts)(connection, publicKeys);
                const { amm, fees, coinBalance, pcBalance, config, pyth, pythPc } = (0, utils_1.getParsedData)(multipleInfo, poolInfo);
                const slot = yield connection.getSlot();
                const { amountSwapped, priceImpact, fee, feePercent } = (0, curve_1.getCurveAmount)(amount, slot, amm, fees, coinBalance, pcBalance, config, pyth, pythPc, tradeDirection);
                const slippagePercent = new decimal_js_1.default(slippage).div(100);
                const amountOutWithSlippage = new decimal_js_1.default(Math.floor(amountSwapped.times(new decimal_js_1.default(1).minus(slippagePercent)).toNumber()));
                const amountOutWithSlippageTokenAmount = amountOutWithSlippage.div(new decimal_js_1.default(10).pow(outDecimal)).toNumber();
                const amountOutTokenAmount = amountSwapped.div(new decimal_js_1.default(10).pow(outDecimal)).toNumber();
                const feeTokenAmount = fee.div(new decimal_js_1.default(10).pow(inDecimal)).toNumber();
                return {
                    amountIn,
                    amountOut: amountOutTokenAmount,
                    amountOutWithSlippage: amountOutWithSlippageTokenAmount,
                    priceImpact: priceImpact.toNumber(),
                    fee: feeTokenAmount,
                    feePercent: feePercent.toNumber()
                };
            }
            catch (error) {
                console.error(error);
                return {
                    amountIn: 0,
                    amountOut: 0,
                    amountOutWithSlippage: 0,
                    priceImpact: 0,
                    fee: 0,
                    feePercent: 0
                };
            }
        }
    });
}
exports.getAmountOut = getAmountOut;
;
function getSwapInstruction(connection, ownerAccount, amountIn, minimumOut, fromMint, toMint, fromUserAccount, toTokenAccount, approve = true) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const poolInfo = (0, pool_1.getPool)(fromMint.toString(), toMint.toString());
            let amount = new decimal_js_1.default(amountIn);
            let amountOut = new decimal_js_1.default(minimumOut);
            let fromPoolAccount;
            let toPoolAccount;
            if (fromMint.toString() === poolInfo.poolCoinMint) {
                amount = amount.times(new decimal_js_1.default(10).pow(poolInfo.poolCoinDecimal));
                amountOut = amountOut.times(new decimal_js_1.default(10).pow(poolInfo.poolPcDecimal));
                fromPoolAccount = new web3_js_1.PublicKey(poolInfo.poolCoinTokenAccount);
                toPoolAccount = new web3_js_1.PublicKey(poolInfo.poolPcTokenAccount);
            }
            else {
                amount = amount.times(new decimal_js_1.default(10).pow(poolInfo.poolPcDecimal));
                amountOut = amountOut.times(new decimal_js_1.default(10).pow(poolInfo.poolCoinDecimal));
                fromPoolAccount = new web3_js_1.PublicKey(poolInfo.poolPcTokenAccount);
                toPoolAccount = new web3_js_1.PublicKey(poolInfo.poolCoinTokenAccount);
            }
            // Dummy Wallet
            // @ts-ignore 
            let wallet = web3_js_1.Keypair.generate();
            const programAddress = new web3_js_1.PublicKey((0, network_1.getProgramAddress)());
            const provider = new anchor_1.Provider(connection, wallet, anchor_1.Provider.defaultOptions());
            const program = new anchor_1.Program(lifinity_amm_1.IDL, programAddress, provider);
            const { approveInstruction, swapInstruction, signers } = yield (0, transaction_1.getInstruction)(program, poolInfo, amount, amountOut, ownerAccount, fromUserAccount, toTokenAccount, fromPoolAccount, toPoolAccount, approve);
            return { approveInstruction, swapInstruction, signers };
        }
        catch (error) {
            console.warn(error);
            const approveInstruction = null;
            const swapInstruction = null;
            const signers = [];
            return { approveInstruction, swapInstruction, signers };
        }
    });
}
exports.getSwapInstruction = getSwapInstruction;
function getSwapTransactionWithAuthority(connection, ownerAccount, amountIn, minimumAmountOut, fromMint, toMint, fromUserAccount, toTokenAccount, authority) {
    const poolInfo = (0, pool_1.getPool)(fromMint.toString(), toMint.toString());
    // Dummy Wallet
    // @ts-ignore 
    let wallet = web3_js_1.Keypair.generate();
    const programAddress = new web3_js_1.PublicKey((0, network_1.getProgramAddress)());
    const provider = new anchor_1.Provider(connection, wallet, anchor_1.Provider.defaultOptions());
    const program = new anchor_1.Program(lifinity_amm_1.IDL, programAddress, provider);
    return (0, transaction_1.makeSwapTransactionWithAuthority)(program, amountIn, minimumAmountOut, ownerAccount, fromUserAccount, toTokenAccount, fromMint, poolInfo, authority);
}
exports.getSwapTransactionWithAuthority = getSwapTransactionWithAuthority;
