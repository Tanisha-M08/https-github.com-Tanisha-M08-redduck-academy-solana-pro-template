import { BN } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { sendIxs } from "../helpers";
import { BookFixture, Trader } from "./fixture";

export const placeOrder = async (
  env: BookFixture,
  trader: Trader,
  price: BN,
  size: BN,
  hint: number | null,
) => {
  const ix = await env.program.methods
    .placeOrder(price, size, hint)
    .accountsPartial({
      owner: trader.keypair.publicKey,
      mint: env.mint,
      ownerTokens: trader.tokens,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
  await sendIxs(env.context, [trader.keypair], ix);
};

export const cancelOrder = async (
  env: BookFixture,
  trader: Trader,
  cell: number,
) => {
  const ix = await env.program.methods
    .cancelOrder(cell)
    .accountsPartial({
      owner: trader.keypair.publicKey,
      mint: env.mint,
      ownerTokens: trader.tokens,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
  await sendIxs(env.context, [trader.keypair], ix);
};
