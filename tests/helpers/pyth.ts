import { createHash } from "crypto";
import { PublicKey } from "@solana/web3.js";
import { ProgramTestContext } from "solana-bankrun";

export const PYTH_RECEIVER_ID = new PublicKey(
  "rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ",
);

export const PYTH_EXPONENT = -8;

export type PythPrice = {
  price: number;
  conf: number;
  publishTime: bigint;
};

const toUnits = (value: number) =>
  BigInt(Math.round(value * 10 ** -PYTH_EXPONENT));

export const setPythPrice = (
  context: ProgramTestContext,
  address: PublicKey,
  feedId: Buffer,
  { price, conf, publishTime }: PythPrice,
) => {
  const data = Buffer.alloc(134);
  let offset = 0;
  createHash("sha256")
    .update("account:PriceUpdateV2")
    .digest()
    .copy(data, offset, 0, 8);
  offset += 8 + 32;
  data.writeUInt8(1, offset);
  offset += 1;
  feedId.copy(data, offset);
  offset += 32;
  data.writeBigInt64LE(toUnits(price), offset);
  offset += 8;
  data.writeBigUInt64LE(toUnits(conf), offset);
  offset += 8;
  data.writeInt32LE(PYTH_EXPONENT, offset);
  offset += 4;
  data.writeBigInt64LE(publishTime, offset);
  offset += 8;
  data.writeBigInt64LE(publishTime, offset);
  offset += 8;
  data.writeBigInt64LE(toUnits(price), offset);
  offset += 8;
  data.writeBigUInt64LE(toUnits(conf), offset);

  context.setAccount(address, {
    lamports: 1_000_000_000,
    data,
    owner: PYTH_RECEIVER_ID,
    executable: false,
  });
};
