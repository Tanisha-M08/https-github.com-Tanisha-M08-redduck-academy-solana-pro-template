use anchor_lang::prelude::*;

pub const CELLS: usize = 64;
pub const NONE: u16 = u16::MAX;

/// One order, or a free cell. Orders are linked by cell index from the highest price to the
/// lowest; free cells are linked through `next` from `Book::free_head`.
#[zero_copy]
#[repr(C)]
pub struct Cell {
    pub owner: Pubkey,
    pub price: u64,
    pub size: u64,
    pub prev: u16,
    pub next: u16,
    pub alive: u8,
    pub _pad: [u8; 3],
}

#[account(zero_copy)]
#[repr(C)]
pub struct Book {
    pub mint: Pubkey,
    pub head: u16,
    pub free_head: u16,
    pub bump: u8,
    pub _pad: [u8; 3],
    pub cells: [Cell; CELLS],
}

impl Book {
    pub const SIZE: usize = 8 + std::mem::size_of::<Book>();

    pub fn cell(&self, index: u16) -> Option<&Cell> {
        if index == NONE {
            None
        } else {
            self.cells.get(index as usize)
        }
    }
}
