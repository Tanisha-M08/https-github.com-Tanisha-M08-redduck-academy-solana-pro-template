import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { sendIxs } from "../helpers";
import { MarketFixture } from "./fixture";

export const deposit = async (env: MarketFixture, amount: BN) => {
  const ix = await env.program.methods
    .deposit(amount)
    .accountsPartial({
      owner: env.payer.publicKey,
      collateralMint: env.collateralMint,
      ownerCollateral: env.payerCollateral,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
  await sendIxs(env.context, [env.payer], ix);
};

export const borrow = async (env: MarketFixture, amount: BN) => {
  const ix = await env.program.methods
    .borrow(amount)
    .accountsPartial({
      owner: env.payer.publicKey,
      collateralMint: env.collateralMint,
      debtMint: env.debtMint,
      ownerDebt: env.payerDebt,
      collateralPrice: env.collateralPrice,
      debtPrice: env.debtPrice,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
  await sendIxs(env.context, [env.payer], ix);
};

export const liquidate = async (env: MarketFixture, owner: PublicKey) => {
  const ix = await env.program.methods
    .liquidate()
    .accountsPartial({
      liquidator: env.liquidator.publicKey,
      position: env.position(owner),
      collateralMint: env.collateralMint,
      debtMint: env.debtMint,
      liquidatorDebt: env.liquidatorDebt,
      liquidatorCollateral: env.liquidatorCollateral,
      collateralPrice: env.collateralPrice,
      debtPrice: env.debtPrice,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
  await sendIxs(env.context, [env.liquidator], ix);
};
