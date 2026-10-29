# 05 — Orderbook with local checks

An order book in one account. The book is a fixed array of cells, every open order points to its price neighbors by cell number, and the list runs from the highest price to the lowest. Placing an order locks its size in the vault; cancelling gives it back.

The given `place_order` finds the place for a new order by walking the list from the head. Every new order pays for every order in front of it, and since anyone can place orders, anyone can make that walk as long as the book.

Lectures: Divide and conquer, Complexity asymmetry.

## What you're given

- `initialize`, `place_order` and `cancel_order` — complete, and the happy-path test passes. `place_order` already takes a `hint`, the cell the new order goes after, and ignores it.
- `src/state/book.rs` — the zero-copy `Book` and `Cell`, with `NONE` as the empty link, and `link`, which wires a cell in after another one.
- `tests/05-orderbook-with-local-checks/` — a fixture with three funded traders, `readBook` and `findHint`, which computes the hint off-chain the way a client would, the calls for every instruction, and one happy-path test that already passes hints.

## What you do

1. Make `place_order` use the hint and nothing else. It reads the hint cell and its next cell, checks that the hint is alive, that its price is not below the new price, that the next cell is `NONE` or alive with a price strictly below the new price, and for a `None` hint that the head is `NONE` or cheaper. Any other case is refused with `BadHint`, including a hint that was right until another order landed next to it. No loop over the cells.
2. Keep the rest: the free list, the fund lock, `cancel_order`.
3. Tests: an insertion at the head, in the middle and at the tail; a wrong hint refused; a hint that went stale after another insertion refused; a cancel in the middle that relinks, and an insertion into the cell it freed; a full book refused.
4. `SOLUTION.md`.

## Rules

- Keep the change in `src/instructions/place_order.rs`. The reviewer reads only this file, `src/instructions/cancel_order.rs`, `src/state/book.rs`, `src/lib.rs`, `src/error.rs`, your tests and `SOLUTION.md`.
- Do not change the instruction signatures or the accounts the fixture passes. The given test must stay green.
- Read only the cells you need. The book stays zero-copy.

## Run it

```bash
npm install
npm run test:orderbookWithLocalChecks
```
