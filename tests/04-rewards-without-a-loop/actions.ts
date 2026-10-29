import { BN } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { sendIxs } from "../helpers";
import { PoolFixture, StakerAccount } from "./fixture";

export const stake = async (
  env: PoolFixture,
  staker: StakerAccount,
  amount: BN,
) => {
  const ix = await env.program.methods
    .stake(amount)
    .accountsPartial({
      owner: staker.keypair.publicKey,
      mint: env.mint,
      ownerTokens: staker.tokens,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
  await sendIxs(env.context, [staker.keypair], ix);
};

export const unstake = async (
  env: PoolFixture,
  staker: StakerAccount,
  amount: BN,
) => {
  const ix = await env.program.methods
    .unstake(amount)
    .accountsPartial({
      owner: staker.keypair.publicKey,
      mint: env.mint,
      ownerTokens: staker.tokens,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
  await sendIxs(env.context, [staker.keypair], ix);
};

/** Sends a reward. The given program needs every staker as a remaining account. */
export const addRewards = async (
  env: PoolFixture,
  amount: BN,
  stakers: StakerAccount[] = env.stakers,
) => {
  const ix = await env.program.methods
    .addRewards(amount)
    .accountsPartial({
      funder: env.payer.publicKey,
      mint: env.mint,
      funderTokens: env.payerTokens,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .remainingAccounts(
      stakers.map((staker) => ({
        pubkey: staker.account,
        isSigner: false,
        isWritable: true,
      })),
    )
    .instruction();
  await sendIxs(env.context, [env.payer], ix);
};

export const claim = async (env: PoolFixture, staker: StakerAccount) => {
  const ix = await env.program.methods
    .claim()
    .accountsPartial({
      owner: staker.keypair.publicKey,
      mint: env.mint,
      ownerTokens: staker.tokens,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
  await sendIxs(env.context, [staker.keypair], ix);
};
