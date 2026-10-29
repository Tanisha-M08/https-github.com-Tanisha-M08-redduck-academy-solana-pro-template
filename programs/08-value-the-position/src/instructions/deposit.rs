use anchor_lang::prelude::*;
use anchor_spl::token::{transfer_checked, Mint, Token, TokenAccount, TransferChecked};

use crate::{Market, MarketError, Position};

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(seeds = [b"market"], bump = market.bump)]
    pub market: Account<'info, Market>,
    #[account(
        init_if_needed,
        payer = owner,
        space = 8 + Position::INIT_SPACE,
        seeds = [b"position", owner.key().as_ref()],
        bump,
    )]
    pub position: Account<'info, Position>,
    #[account(address = market.collateral_mint)]
    pub collateral_mint: Account<'info, Mint>,
    #[account(mut, token::mint = collateral_mint, token::authority = owner)]
    pub owner_collateral: Account<'info, TokenAccount>,
    #[account(mut, seeds = [b"collateral_vault"], bump)]
    pub collateral_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.owner_collateral.to_account_info(),
                mint: ctx.accounts.collateral_mint.to_account_info(),
                to: ctx.accounts.collateral_vault.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        ),
        amount,
        ctx.accounts.collateral_mint.decimals,
    )?;
    let position = &mut ctx.accounts.position;
    position.owner = ctx.accounts.owner.key();
    position.bump = ctx.bumps.position;
    position.collateral = position
        .collateral
        .checked_add(amount)
        .ok_or(MarketError::MathOverflow)?;
    Ok(())
}
