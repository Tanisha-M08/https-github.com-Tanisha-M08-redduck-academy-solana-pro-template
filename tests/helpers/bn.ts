import { BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export const toBN = (n: number | string | bigint) => new BN(n.toString());

export const fromBN = (bn?: BN) => BigInt((bn ?? 0).toString());

export const sol = (amount: number) =>
  new BN(Math.round(amount * LAMPORTS_PER_SOL));
