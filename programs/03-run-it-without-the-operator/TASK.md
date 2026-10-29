# 03 — Run it without the operator

A rewards program with a small market attached. The admin credits users with rewards, the admin pays them out, the team's bot writes the price, and users buy tokens from the vault at that price.

Two of these are operators. `pay_reward` needs the admin's key, so rewards are paid only while the admin's server runs. `set_price` needs the bot's key, so the market has a price only while the bot runs. Stop both servers and the protocol stops with them.

Lectures: Untrusted executor, Role inversion.

## What you're given

- `initialize`, `accrue`, `pay_reward`, `set_price` and `buy` — complete, and the happy-path test passes. `accrue` is where rewards come from; it stays with the admin.
- `src/ed25519.rs` — `parse_ed25519`, which takes an Ed25519 instruction and returns the key that signed and the message, for the pull price.
- `config.oracle` — the key the oracle signs prices with off-chain. The given program never reads it.
- `tests/03-run-it-without-the-operator/` — a fixture with a funded vault, a user, a stranger, the bot and the oracle keypairs, the calls for every instruction, and one happy-path test.

## What you do

1. Replace `pay_reward` with `claim`, which anyone can send for any user. The reward goes to the user's token account no matter who sent the transaction, and the caller keeps a small part of the payout as the fee for sending it. Size that fee so that running a bot pays, and cap it. A claim must not pay twice.
2. Replace `set_price` with a pull price: the caller puts an Ed25519 instruction signed by `config.oracle` in the same transaction, with the price and its publish time in the message, and the program checks the signature through the instructions sysvar, refuses an update older than `max_price_age`, and stores or uses the price. Nothing the bot used to do should be left.
3. When you are done, no instruction except `accrue` and settings changes may require the admin, and none may require the bot.
4. Tests: a wallet that is neither the admin nor the bot claims for the user and is paid the fee, and a buy whose price came from a signed update built in the test, with no bot transaction. The old admin and bot paths must be gone or refused.
5. `SOLUTION.md`.

## Rules

- Put the claim in `src/instructions/claim.rs` and the pull price in `src/instructions/set_price.rs` or `src/instructions/buy.rs`. The reviewer reads only `src/lib.rs`, `src/error.rs`, `src/state/`, `src/instructions/claim.rs`, `src/instructions/set_price.rs`, `src/instructions/buy.rs`, your tests and `SOLUTION.md`.
- Keep the given test green, adapting its calls to your instructions.
- Keep it small: no reward token beyond the one mint, no order book.

## Run it

```bash
npm install
npm run test:runItWithoutTheOperator
```
