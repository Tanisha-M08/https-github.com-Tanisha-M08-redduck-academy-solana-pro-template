use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Position {
    pub owner: Pubkey,
    pub collateral: u64,
    pub debt: u64,
    pub bump: u8,
}
