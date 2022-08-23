"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEventLogs = void 0;
const token_utils_1 = require("@saberhq/token-utils");
const parseUint = (str) => !str || str === "0x0" ? undefined : new token_utils_1.u64(str.slice("0x".length), 16);
const parseEventRaw = (type, msg) => {
    const parts = msg.slice("Program log: ".length).split(", ");
    return Object.entries({
        type,
        tokenAAmount: parseUint(parts[1]),
        tokenBAmount: parseUint(parts[2]),
        poolTokenAmount: parseUint(parts[3]),
        fee: parseUint(parts[4]),
    })
        .filter(([, v]) => !!v)
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
};
/**
 * Parses the log message to return the StableSwap info about the transaction.
 * @param logMessages
 * @returns
 */
const parseEventLogs = (logMessages) => {
    if (!logMessages) {
        return [];
    }
    return logMessages.reduce((acc, logMessage, i) => {
        const nextLog = logMessages[i + 1];
        return logMessage.startsWith("Program log: Event: ") && nextLog
            ? [
                ...acc,
                parseEventRaw(logMessage.slice("Program log: Event: ".length), nextLog),
            ]
            : acc;
    }, []);
};
exports.parseEventLogs = parseEventLogs;
//# sourceMappingURL=events.js.map