import { PublicKey } from '@solana/web3.js';
import Markets from '../config/markets.json';
import TokenMints from '../config/token-mints.json';

export const TOKEN_MINTS: Array<{
  address: PublicKey;
  name: string;
}> = TokenMints.map((mint) => {
  return {
    address: new PublicKey(mint.address),
    name: mint.name,
  };
});

export const MARKETS: Array<{
  address: PublicKey;
  name: string;
  programId: PublicKey;
  deprecated: boolean;
}> = Markets.map((market) => {
  return {
    address: new PublicKey(market.address),
    name: market.name,
    programId: new PublicKey(market.programId),
    deprecated: market.deprecated,
  };
});
