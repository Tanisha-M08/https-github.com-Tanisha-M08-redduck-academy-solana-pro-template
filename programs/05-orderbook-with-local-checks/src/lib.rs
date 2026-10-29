use anchor_lang::prelude::*;

pub mod error;
pub mod instructions;
pub mod state;

pub use error::*;
pub use instructions::*;
pub use state::*;

declare_id!("EsEqChqQourPX4Ti8FA6P2PjxufNfW4iLBJckFbAEFbc");

#[program]
pub mod local_book {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize(ctx)
    }

    pub fn place_order(
        ctx: Context<PlaceOrder>,
        price: u64,
        size: u64,
        hint: Option<u16>,
    ) -> Result<()> {
        instructions::place_order(ctx, price, size, hint)
    }

    pub fn cancel_order(ctx: Context<CancelOrder>, cell: u16) -> Result<()> {
        instructions::cancel_order(ctx, cell)
    }
}
