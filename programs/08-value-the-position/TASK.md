# 08 — Value the position at its worst

A small lending market. Users deposit a collateral token and borrow a debt token against it. Both tokens are priced by Pyth. When a position crosses the liquidation line, anyone can repay its whole debt and take its collateral.

Every number this program gets from outside is a guess. Your job is to act on that guess the way the protocols from the lectures do: take the end that hurts the protocol, refuse what is too old to use, draw one line for borrowing and another for liquidation, and derive one value from the market's own state instead of asking the oracle for it.

Lectures: Internal oracle, Defensive computation, Fail-fast.

## What you're given

- `src/lib.rs` — four instructions: `initialize`, `deposit`, `borrow`, `liquidate`.
- `initialize` and `deposit` — complete.
- The account contexts of `borrow` and `liquidate`, including both Pyth price accounts.
- `src/pricing.rs` — `Band` (a price as its low end, middle and high end, in USD with 6 decimals), `scale` (turns a Pyth price with any exponent into 6 decimals) and `value` (a token amount times a price).
- `MarketParams` — `max_price_age`, `borrow_ltv_bps` and `liquidation_ltv_bps`.
- `tests/08-value-the-position/` — a fixture that boots the market and writes Pyth price accounts for you (`setPrices`), the calls for every instruction, and one happy-path test.

## What you implement

1. `read_band` — read the market's feed from a Pyth price account and refuse a price older than `max_price_age`.
2. `borrow` — add the new debt, then value the position at its worst: collateral at the low end of its band, debt at the high end of its band. Refuse the borrow above `borrow_ltv_bps`.
3. `liquidate` — allow it only above `liquidation_ltv_bps`, then repay the debt from the liquidator and pay out the collateral. A liquidation must never be refused by a rule that exists only to protect new borrowing.
4. A value from the market's own state. The market keeps its own time-weighted average of the collateral price in its account, updated by the instructions that read the price. When the collateral price jumps, `borrow` must not lend against the jump until it has lasted. Pyth publishes an EMA too; do not use it. You decide where the average is used and where it is not.
5. The errors and the rest of the tests: a stale price, a wide band, a short price spike, a position between the two lines.
6. `SOLUTION.md`.

## Rules

- Keep the price logic in `src/pricing.rs`, the checks in `src/instructions/borrow.rs` and `src/instructions/liquidate.rs`, and the new market fields in `src/state/market.rs`. The reviewer reads only these files, `src/error.rs`, your tests and `SOLUTION.md`.
- Keep it small: no interest, no partial liquidations, no extra assets.
- Do not change the instruction signatures or the accounts the fixture passes. The given test must stay green.

## Run it

```bash
npm install
npm run test:valueThePosition
```
