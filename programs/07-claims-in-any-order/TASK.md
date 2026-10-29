# 07 — Claims in any order

A rewards program for devices. An oracle signs each day's reward for a device, and anyone can bring that signed message to `claim`, which pays the amount to the device's owner. The signature is checked against the oracle key in the config, through the instructions sysvar with its address verified.

The message carries a step: the amount to add and a nonce, and `claim` accepts only the next nonce. That gives uniqueness and nothing else. Two messages in flight at once can land in either order, and the second one to arrive is refused for good. A message that never arrives leaves a gap that no later message can fill.

Lectures: One-way state, Boundary of consent.

## What you're given

- `initialize`, `register_device` and `claim` — complete, and the happy-path test passes.
- `src/ed25519.rs` — `parse_ed25519`, which takes an Ed25519 instruction and returns the key that signed and the message.
- `claim_message` in `src/instructions/claim.rs` — the message the oracle signs today.
- `tests/07-claims-in-any-order/` — a fixture with a funded vault, a device owner and the oracle keypair, a `claim` call that builds the signed message and the Ed25519 instruction for you, and one happy-path test.

## What you do

1. Change the message. The oracle signs the total a device has earned since the beginning, not the day's reward. Change `claim`'s arguments to match, and update `claimMessage` and `claim` in `tests/07-claims-in-any-order/actions.ts` with it.
2. Change the state. The device stores how much was already paid. A claim pays the difference between the signed total and the paid amount, and moves the paid amount up to the total. A message with a total at or below the paid amount changes nothing. The paid amount never goes down.
3. Remove the nonce, and do not replace it with any other memory of which messages were seen. The only thing a message is compared with is the device's current state.
4. Keep the signature check as it is: the oracle key from the config, the sysvar address verified before anything is read from it.
5. Tests: two claims with an older total and a newer one sent in both orders, and the same claim sent twice, each run ending in the same paid amount and the same balance.
6. `SOLUTION.md`.

## Rules

- Keep the change in `src/instructions/claim.rs` and `src/state/device.rs`. The reviewer reads only these, `src/lib.rs`, `src/error.rs`, `src/state/config.rs`, your tests and `SOLUTION.md`.
- The given test must stay green with your message format.
- Keep it small: one oracle, one token.

## Run it

```bash
npm install
npm run test:claimsInAnyOrder
```
