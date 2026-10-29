use anchor_lang::prelude::*;
use anchor_spl::token::{transfer_checked, Mint, Token, TokenAccount, TransferChecked};

use crate::{Book, BookError, CELLS, NONE};

#[derive(Accounts)]
pub struct CancelOrder<'info> {
    pub owner: Signer<'info>,
    #[account(mut, seeds = [b"book"], bump = book.load()?.bump)]
    pub book: AccountLoader<'info, Book>,
    #[account(address = book.load()?.mint)]
    pub mint: Account<'info, Mint>,
    #[account(mut, token::mint = mint, token::authority = owner)]
    pub owner_tokens: Account<'info, TokenAccount>,
    #[account(mut, seeds = [b"vault"], bump)]
    pub vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

pub fn cancel_order(ctx: Context<CancelOrder>, cell: u16) -> Result<()> {
    require!((cell as usize) < CELLS, BookError::BadCell);
    let (size, bump) = {
        let mut book = ctx.accounts.book.load_mut()?;
        let c = book.cells[cell as usize];
        require!(c.alive == 1, BookError::DeadCell);
        require_keys_eq!(c.owner, ctx.accounts.owner.key(), BookError::NotOwner);

        if c.prev == NONE {
            book.head = c.next;
        } else {
            book.cells[c.prev as usize].next = c.next;
        }
        if c.next != NONE {
            book.cells[c.next as usize].prev = c.prev;
        }
        let free_head = book.free_head;
        let dead = &mut book.cells[cell as usize];
        dead.alive = 0;
        dead.prev = NONE;
        dead.next = free_head;
        book.free_head = cell;
        (c.size, book.bump)
    };

    let seeds: &[&[u8]] = &[b"book", &[bump]];
    transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.vault.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.owner_tokens.to_account_info(),
                authority: ctx.accounts.book.to_account_info(),
            },
            &[seeds],
        ),
        size,
        ctx.accounts.mint.decimals,
    )
}
