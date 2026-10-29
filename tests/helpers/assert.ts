import { Keypair } from "@solana/web3.js";

export type OptionalCommonParams = {
  from?: Keypair;
  revertedWith?: {
    message?: string;
  };
};

export const expectReverted = async (
  opt: OptionalCommonParams,
  promise: Promise<unknown>,
) => {
  if (!opt?.revertedWith?.message) {
    throw new Error("opt should contain revertedWith.message");
  }

  try {
    await promise;
  } catch (err: any) {
    if (!err.toString().includes(opt.revertedWith.message)) {
      throw new Error(
        `Expected tx to revert with "${opt.revertedWith.message}". Got: ${err.toString()}`,
      );
    }
    return;
  }

  throw new Error("Expected to be reverted but it succeeded");
};

export const numToHex = (decimalCode: number) =>
  `0x${decimalCode.toString(16).toLowerCase()}`;
