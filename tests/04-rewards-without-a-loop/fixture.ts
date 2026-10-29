import { Program } from "@coral-xyz/anchor";
import { ProgramTestContext } from "solana-bankrun";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import { LazyPool } from "../../target/types/lazy_pool";
import idl from "../../target/idl/lazy_pool.json";
import {
  createMintAndFund,
  findPDA,
  initBankrun,
  oneToken,
  processTransaction,
  sendIxs,
} from "../helpers";

export interface StakerAccount {
  keypair: Keypair;
  tokens: PublicKey;
  account: PublicKey;
}

export interface PoolFixture {
  context: ProgramTestContext;
  program: Program<LazyPool>;
  payer: Keypair;
  payerTokens: PublicKey;
  pool: PublicKey;
  vault: PublicKey;
  mint: PublicKey;
  stakers: StakerAccount[];
}

export const setupPool = async (): Promise<PoolFixture> => {
  const { context, program, accounts } = await initBankrun(idl as LazyPool);
  const payer = context.payer;

  const pool = findPDA(["pool"], program)[0];
  const vault = findPDA(["vault"], program)[0];
  const { mint, ata: payerTokens } = await createMintAndFund(
    context,
    payer,
    payer.publicKey,
    oneToken().muln(1_000_000),
  );

  const stakers: StakerAccount[] = accounts.slice(0, 3).map((keypair) => ({
    keypair,
    tokens: getAssociatedTokenAddressSync(mint, keypair.publicKey),
    account: findPDA(["staker", keypair.publicKey], program)[0],
  }));
  const fund = new Transaction();
  for (const staker of stakers) {
    fund.add(
      createAssociatedTokenAccountInstruction(
        payer.publicKey,
        staker.tokens,
        staker.keypair.publicKey,
        mint,
      ),
      createTransferInstruction(
        payerTokens,
        staker.tokens,
        payer.publicKey,
        BigInt(oneToken().muln(10_000).toString()),
      ),
    );
  }
  await processTransaction(context, fund, [payer]);

  const initIx = await program.methods
    .initialize()
    .accountsPartial({
      admin: payer.publicKey,
      mint,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
  await sendIxs(context, [payer], initIx);

  return { context, program, payer, payerTokens, pool, vault, mint, stakers };
};
