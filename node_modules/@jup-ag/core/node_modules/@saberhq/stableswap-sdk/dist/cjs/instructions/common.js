"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildInstruction = void 0;
const web3_js_1 = require("@solana/web3.js");
const buildInstruction = ({ config: { swapProgramID }, keys, data, }) => {
    return new web3_js_1.TransactionInstruction({
        keys,
        programId: swapProgramID,
        data,
    });
};
exports.buildInstruction = buildInstruction;
//# sourceMappingURL=common.js.map