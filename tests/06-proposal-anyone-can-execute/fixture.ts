import { Program } from "@coral-xyz/anchor";
import { ProgramTestContext } from "solana-bankrun";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import BN from "bn.js";

import { OpenMultisig } from "../../target/types/open_multisig";
import idl from "../../target/idl/open_multisig.json";
import {
  createMintAndFund,
  findPDA,
  initBankrun,
  oneToken,
  processTransaction,
  sendIxs,
} from "../helpers";

export const THRESHOLD = 2;

export interface MultisigFixture {
  context: ProgramTestContext;
  program: Program<OpenMultisig>;
  payer: Keypair;
  members: Keypair[];
  stranger: Keypair;
  config: PublicKey;
  vault: PublicKey;
  treasury: PublicKey;
  mint: PublicKey;
  memberTokens: (member: PublicKey) => PublicKey;
  proposal: (id: number) => PublicKey;
}

export const setupMultisig = async (): Promise<MultisigFixture> => {
  const { context, program, accounts } = await initBankrun(idl as OpenMultisig);
  const payer = context.payer;
  const members = [payer, accounts[0], accounts[1]];
  const stranger = accounts[2];

  const config = findPDA(["config"], program)[0];
  const vault = findPDA(["vault"], program)[0];
  const { mint, ata: payerTokens } = await createMintAndFund(
    context,
    payer,
    payer.publicKey,
    oneToken().muln(1_000_000),
  );
  const treasury = getAssociatedTokenAddressSync(mint, vault, true);
  const memberTokens = (member: PublicKey) =>
    getAssociatedTokenAddressSync(mint, member);

  const fund = new Transaction().add(
    createAssociatedTokenAccountInstruction(
      payer.publicKey,
      treasury,
      vault,
      mint,
    ),
    createTransferInstruction(
      payerTokens,
      treasury,
      payer.publicKey,
      BigInt(oneToken().muln(1_000).toString()),
    ),
  );
  for (const member of members.slice(1)) {
    fund.add(
      createAssociatedTokenAccountInstruction(
        payer.publicKey,
        memberTokens(member.publicKey),
        member.publicKey,
        mint,
      ),
    );
  }
  await processTransaction(context, fund, [payer]);

  const initIx = await program.methods
    .initialize(
      members.map((m) => m.publicKey),
      THRESHOLD,
    )
    .accountsPartial({ admin: payer.publicKey })
    .instruction();
  await sendIxs(context, [payer], initIx);

  const proposal = (id: number) =>
    findPDA(["proposal", new BN(id).toArrayLike(Buffer, "le", 8)], program)[0];

  return {
    context,
    program,
    payer,
    members,
    stranger,
    config,
    vault,
    treasury,
    mint,
    memberTokens,
    proposal,
  };
};
