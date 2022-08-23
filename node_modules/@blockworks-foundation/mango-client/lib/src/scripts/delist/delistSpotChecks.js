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
const web3_js_1 = require("@solana/web3.js");
const __1 = require("../..");
const config_1 = require("../../config");
const config = new config_1.Config(__1.IDS);
const cluster = (process.env.CLUSTER || 'mainnet');
const groupName = process.env.GROUP || 'mainnet.1';
const symbol = process.env.MARKET || 'LUNA';
const groupIds = config.getGroup(cluster, groupName);
const marketConfig = (0, config_1.getSpotMarketConfig)(groupIds, (x) => x.name.includes(symbol));
const marketIndex = marketConfig.marketIndex;
function checkSpotMarket() {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = new web3_js_1.Connection(config.cluster_urls[cluster]);
        const client = new __1.MangoClient(connection, groupIds.mangoProgramId);
        const mangoGroup = yield client.getMangoGroup(groupIds.publicKey);
        const rootBank = (yield mangoGroup.loadRootBanks(connection))[marketIndex];
        const nodeBanks = yield rootBank.loadNodeBanks(connection);
        const vaults = yield Promise.all(nodeBanks.map((n) => {
            return connection.getAccountInfo(n.vault).then((ai) => {
                return new __1.TokenAccount(n.vault, __1.TokenAccountLayout.decode(ai.data));
            });
        }));
        const accounts = yield client.getAllMangoAccounts(mangoGroup, undefined, true);
        let hasOpenOrdersAccounts = false;
        let hasOpenOrdersAccountsCount = 0;
        let toLiquidate = 0;
        const vaultBalance = vaults.reduce((sum, v) => sum + v.amount, 0);
        console.log(vaults[0].publicKey.toBase58());
        for (const account of accounts) {
            if (!account.spotOpenOrders[marketIndex].equals(web3_js_1.PublicKey.default)) {
                hasOpenOrdersAccounts = true;
                hasOpenOrdersAccountsCount++;
                //console.log('Account', account.publicKey.toBase58(), 'has open orders account', account.spotOpenOrders[marketIndex].toBase58());
            }
            if (!account.spotOpenOrders[marketIndex].equals(web3_js_1.PublicKey.default) || !account.deposits[marketIndex].isZero() || !account.borrows[marketIndex].isZero()) {
                toLiquidate++;
            }
        }
        const [dustAccountPk] = yield web3_js_1.PublicKey.findProgramAddress([mangoGroup.publicKey.toBytes(), Buffer.from('DustAccount', 'utf-8')], groupIds.mangoProgramId);
        const dustAccount = yield client.getMangoAccount(dustAccountPk, mangoGroup.dexProgramId);
        const nonDustAccountDeposits = rootBank.getNativeTotalDeposit().sub(dustAccount.getNativeDeposit(rootBank, marketIndex));
        const nonDustAccountVaultBalance = vaultBalance - dustAccount.getNativeDeposit(rootBank, marketIndex).ceil().toNumber();
        console.log(`Market Mode: ${__1.MarketMode[mangoGroup.tokens[marketIndex].spotMarketMode]}`);
        console.log(`Deposits are dust ${nonDustAccountDeposits.lt(__1.ONE_I80F48) ? '✅' : `❎ - ${(0, __1.nativeToUi)(nonDustAccountDeposits.toNumber(), marketConfig.baseDecimals)}`}`);
        console.log(`Borrows are dust ${rootBank.getNativeTotalBorrow().lt(__1.ONE_I80F48) ? '✅' : `❎ - ${(0, __1.nativeToUi)(rootBank.getNativeTotalBorrow().toNumber(), marketConfig.baseDecimals)}`}`);
        console.log(`Vault balance is 0 ${nonDustAccountVaultBalance == 0 ? '✅' : `❎ - ${(0, __1.nativeToUi)(nonDustAccountVaultBalance, marketConfig.baseDecimals)}`}`);
        console.log(`All open orders accounts closed ${!hasOpenOrdersAccounts ? '✅' : `❎ - ${hasOpenOrdersAccountsCount}`}`);
        //console.log('Accounts to liquidate', toLiquidate)
    });
}
checkSpotMarket();
//# sourceMappingURL=delistSpotChecks.js.map