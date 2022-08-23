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
const marketConfig = (0, config_1.getPerpMarketConfig)(groupIds, (x) => x.name.includes(symbol));
const marketIndex = marketConfig.marketIndex;
function checkPerpMarket() {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = new web3_js_1.Connection(config.cluster_urls[cluster]);
        const client = new __1.MangoClient(connection, groupIds.mangoProgramId);
        const mangoGroup = yield client.getMangoGroup(groupIds.publicKey);
        const cache = yield mangoGroup.loadCache(connection);
        const marketCache = cache.perpMarketCache[marketIndex];
        const market = yield mangoGroup.loadPerpMarket(connection, marketIndex, marketConfig.baseDecimals, marketConfig.quoteDecimals);
        const accounts = yield client.getAllMangoAccounts(mangoGroup, undefined, false);
        let sumQuote = __1.ZERO_I80F48;
        let sumBase = __1.ZERO_BN;
        let sumMngo = __1.ZERO_BN;
        let accountsWithMngo = 0;
        for (const account of accounts) {
            const perpAccount = account.perpAccounts[marketIndex];
            sumQuote = sumQuote.add(perpAccount.getQuotePosition(marketCache));
            sumBase = sumBase.add(perpAccount.basePosition);
            // if (!perpAccount.getQuotePosition(marketCache).isZero()) {
            //     console.log('Account', account.publicKey.toBase58(), 'had quote position', perpAccount.getQuotePosition(marketCache).toNumber());
            // }
            // if (!perpAccount.basePosition.isZero()) {
            //     console.log('Account', account.publicKey.toBase58(), 'had base position', perpAccount.basePosition.toNumber());
            // }
            if (!perpAccount.mngoAccrued.isZero()) {
                accountsWithMngo++;
                console.log('Account', account.publicKey.toBase58(), 'had base position', perpAccount.basePosition.toNumber());
            }
            sumMngo = sumMngo.add(perpAccount.mngoAccrued);
        }
        //console.log(accountsWithMngo)
        console.log(`Market Mode: ${__1.MarketMode[mangoGroup.tokens[marketIndex].perpMarketMode]}`);
        console.log(`Open interest is 0 ${market.openInterest.isZero() ? '✅' : `❎ - ${market.openInterest}`}`);
        console.log(`Fees accrued is 0 ${market.feesAccrued.isZero() ? '✅' : `❎ - ${market.feesAccrued.toNumber()}`}`);
        console.log(`Sum of quote positions is 0 ${sumQuote.isZero() ? '✅' : `❎ - ${sumQuote}`}`);
        console.log(`Sum of base positions is 0 ${sumBase.isZero() ? '✅' : `❎ - ${sumBase}`}`);
        console.log(`MNGO accrued is 0 ${sumMngo.isZero() ? '✅' : `❎ - ${(0, __1.nativeToUi)(sumMngo.toNumber(), 6)}`}`);
    });
}
checkPerpMarket();
//# sourceMappingURL=delistPerpChecks.js.map