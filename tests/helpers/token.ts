import { BN } from "@coral-xyz/anchor";
import {
  AccountLayout,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { ProgramTestContext } from "solana-bankrun";

import { processTransaction } from "./bankrun";
import { toBN } from "./bn";

export const DEFAULT_DECIMALS = 6;

export const oneToken = (decimals = DEFAULT_DECIMALS) => toBN(10 ** decimals);

export const createMintAndFund = async (
  context: ProgramTestContext,
  payer: Keypair,
  owner: PublicKey,
  amount: BN,
  decimals = DEFAULT_DECIMALS,
): Promise<{ mint: PublicKey; ata: PublicKey }> => {
  const mint = Keypair.generate();
  const ata = getAssociatedTokenAddressSync(mint.publicKey, owner);

  const rent = await context.banksClient.getRent();
  const lamports = Number(rent.minimumBalance(BigInt(MINT_SIZE)));

  await processTransaction(
    context,
    new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMint2Instruction(
        mint.publicKey,
        decimals,
        payer.publicKey,
        null,
      ),
      createAssociatedTokenAccountInstruction(
        payer.publicKey,
        ata,
        owner,
        mint.publicKey,
      ),
      createMintToInstruction(
        mint.publicKey,
        ata,
        payer.publicKey,
        BigInt(amount.toString()),
      ),
    ),
    [payer, mint],
  );

  return { mint: mint.publicKey, ata };
};

export const tokenBalance = async (
  context: ProgramTestContext,
  address: PublicKey,
): Promise<bigint> => {
  const account = await context.banksClient.getAccount(address);
  if (!account) return 0n;
  return AccountLayout.decode(Buffer.from(account.data)).amount;
};
