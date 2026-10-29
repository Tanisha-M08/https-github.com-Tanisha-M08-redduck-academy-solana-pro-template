use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::{Book, CELLS, NONE};

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(init, payer = admin, space = Book::SIZE, seeds = [b"book"], bump)]
    pub book: AccountLoader<'info, Book>,
    pub mint: Account<'info, Mint>,
    #[account(
        init,
        payer = admin,
        seeds = [b"vault"],
        bump,
        token::mint = mint,
        token::authority = book,
    )]
    pub vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
    let mut book = ctx.accounts.book.load_init()?;
    book.mint = ctx.accounts.mint.key();
    book.head = NONE;
    book.free_head = 0;
    book.bump = ctx.bumps.book;
    for i in 0..CELLS {
        book.cells[i].prev = NONE;
        book.cells[i].next = if i + 1 < CELLS { (i + 1) as u16 } else { NONE };
        book.cells[i].alive = 0;
    }
    Ok(())
}
