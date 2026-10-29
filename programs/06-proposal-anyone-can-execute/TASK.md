# 06 — Proposal that anyone can execute

A small multisig. A proposal is an account that stores a future action as data: the program to call, its accounts and its instruction data. Members approve it one by one, over as long as it takes. The treasury is a PDA, and executing a proposal runs the stored instruction with that PDA as the signer.

Only the admin can execute. A proposal that every member approved still waits for the admin's server, and the admin's key is a single point of failure for every treasury action. The given `execute` also trusts whatever accounts the sender passes, and nothing stops a proposal from being executed twice.

Lectures: Commit-execution split, Action as data, Virtual execution.

## What you're given

- `initialize`, `create_proposal`, `approve` and `execute` — complete, and the happy-path test passes.
- `src/state/proposal.rs` — `Proposal` and `StoredMeta`, the stored account list.
- `tests/06-proposal-anyone-can-execute/` — a fixture with three members, a treasury token account owned by the vault PDA, a helper that builds a token transfer from the treasury as a proposal, the calls for every instruction, and one happy-path test where the admin executes.

## What you do

1. Open `execute` to anyone. Once the approvals reach the threshold, any wallet may send it. No admin, no member signature.
2. Check the accounts. The remaining accounts the executor passes must match the stored metas one by one: same pubkey, same writability, and signer only for the vault PDA. The target program must match the stored one.
3. Execute once. A second `execute` of the same proposal is refused.
4. Add `cancel`: the proposer or a member can cancel an unexecuted proposal and recover its rent, and anyone can close a proposal past `expires_at`.
5. Tests: a wallet that is not a member executes an approved proposal; execute refused below the threshold; a second execute refused; an execute with a changed account list refused; cancel and expiry.
6. `SOLUTION.md`.

## Rules

- Keep the changes in `src/instructions/execute.rs` and the new `src/instructions/cancel.rs`. The reviewer reads only these, `src/lib.rs`, `src/error.rs`, `src/state/`, `src/instructions/approve.rs`, your tests and `SOLUTION.md`.
- Keep the given test green, adapting its executor to any wallet.
- Keep it small: no roles, no per-member permissions, no batches.

## Run it

```bash
npm install
npm run test:proposalAnyoneCanExecute
```
