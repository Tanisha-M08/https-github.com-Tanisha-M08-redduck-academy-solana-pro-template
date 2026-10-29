use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Config {
    pub admin: Pubkey,
    /// The team's bot, the only key that may write the price.
    pub bot: Pubkey,
    /// The oracle that signs prices off-chain. Unused by the given program.
    pub oracle: Pubkey,
    pub mint: Pubkey,
    /// Lamports per whole token, written by the bot.
    pub price: u64,
    pub price_time: i64,
    pub max_price_age: i64,
    pub bump: u8,
}
