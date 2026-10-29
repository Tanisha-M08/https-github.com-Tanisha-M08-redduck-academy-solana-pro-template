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

import { LocalBook } from "../../target/types/local_book";
import idl from "../../target/idl/local_book.json";
import {
  createMintAndFund,
  findPDA,
  initBankrun,
  oneToken,
  processTransaction,
  sendIxs,
} from "../helpers";

export const NONE = 65535;

export interface Trader {
  keypair: Keypair;
  tokens: PublicKey;
}

export interface Cell {
  owner: PublicKey;
  price: BN;
  size: BN;
  prev: number;
  next: number;
  alive: number;
}

export interface BookState {
  head: number;
  freeHead: number;
  cells: Cell[];
}

export interface BookFixture {
  context: ProgramTestContext;
  program: Program<LocalBook>;
  payer: Keypair;
  book: PublicKey;
  vault: PublicKey;
  mint: PublicKey;
  traders: Trader[];
  readBook: () => Promise<BookState>;
}

export const setupBook = async (): Promise<BookFixture> => {
  const { context, program, accounts } = await initBankrun(idl as LocalBook);
  const payer = context.payer;

  const book = findPDA(["book"], program)[0];
  const vault = findPDA(["vault"], program)[0];
  const { mint, ata: payerTokens } = await createMintAndFund(
    context,
    payer,
    payer.publicKey,
    oneToken().muln(1_000_000),
  );

  const traders: Trader[] = accounts.slice(0, 3).map((keypair) => ({
    keypair,
    tokens: getAssociatedTokenAddressSync(mint, keypair.publicKey),
  }));
  const fund = new Transaction();
  for (const trader of traders) {
    fund.add(
      createAssociatedTokenAccountInstruction(
        payer.publicKey,
        trader.tokens,
        trader.keypair.publicKey,
        mint,
      ),
      createTransferInstruction(
        payerTokens,
        trader.tokens,
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

  const readBook = async (): Promise<BookState> => {
    const state = await program.account.book.fetch(book);
    return {
      head: state.head,
      freeHead: state.freeHead,
      cells: state.cells as Cell[],
    };
  };

  return { context, program, payer, book, vault, mint, traders, readBook };
};

/** Walks the list off-chain and returns the cell a new order at `price` goes after, or null for the head. */
export const findHint = (book: BookState, price: BN): number | null => {
  let after: number | null = null;
  let cursor = book.head;
  while (cursor !== NONE && book.cells[cursor].price.gte(price)) {
    after = cursor;
    cursor = book.cells[cursor].next;
  }
  return after;
};

/** The open orders from the highest price to the lowest, as cell indexes. */
export const listOrders = (book: BookState): number[] => {
  const result: number[] = [];
  let cursor = book.head;
  while (cursor !== NONE) {
    result.push(cursor);
    cursor = book.cells[cursor].next;
  }
  return result;
};
