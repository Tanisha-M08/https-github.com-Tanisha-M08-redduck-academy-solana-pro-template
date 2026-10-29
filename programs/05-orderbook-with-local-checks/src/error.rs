use anchor_lang::prelude::*;

#[error_code]
pub enum BookError {
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("The book is full")]
    BookFull,
    #[msg("The cell index is out of range")]
    BadCell,
    #[msg("The cell holds no open order")]
    DeadCell,
    #[msg("Only the owner can cancel an order")]
    NotOwner,
    #[msg("The hint does not point to the right place for this price")]
    BadHint,
}
