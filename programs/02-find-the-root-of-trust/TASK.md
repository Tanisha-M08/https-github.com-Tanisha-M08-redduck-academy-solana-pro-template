# 02 — Find the root of trust

A vault. Anyone can deposit, and a withdrawal pays out only when an oracle has signed it. The signature is verified by Solana's Ed25519 program in the instruction before `withdraw`, the program reads the instructions sysvar to confirm that check ran, and the keys allowed to sign live in an allowlist account.

Every check is there. Every account they depend on comes from the caller: the instructions account is passed unchecked and read with the program's own `load_instruction_unchecked`, and the allowlist is an account that anyone can create with `create_allowlist`.

Lectures: Root of trust, Identity rejection.

## What you're given

- `initialize`, `deposit`, `create_allowlist` and `withdraw` — complete, and the happy-path test passes. The hole is in `withdraw`.
- `src/ed25519.rs` — `parse_ed25519`, which takes an Ed25519 instruction and returns the key that signed and the message. You do not have to parse the precompile's layout yourself.
- `src/sysvar.rs` — `load_instruction_unchecked`, which reads an instruction from any account that has the sysvar's layout. Its doc comment describes that layout; your exploit test builds an account in it.
- `withdrawal_message` in `src/instructions/withdraw.rs` — the message the oracle signs: vault, recipient token account, amount.
- `tests/02-find-the-root-of-trust/` — a fixture with a funded vault, an oracle keypair and an allowlist, the calls for every instruction, and one happy-path withdrawal.

## What you do

1. Write the exploit test first. Build an ordinary account whose data has the layout of the instructions sysvar and contains a fake Ed25519 entry for a key of your own, pass it as `instructions` together with an allowlist you created yourself, and withdraw from the vault. It must pass against the given program.
2. Trace the chain in `SOLUTION.md`: every check `withdraw` makes, which account it depends on, and where the chain ends.
3. Give the program a root. The keys allowed to sign move into the config PDA, the instructions account is compared with the real sysvar address before anything is read from it, and the key and message of the Ed25519 instruction are compared with the config and the withdrawal, not with anything the caller brought. Every instruction has to use the same config.
4. Make the exploit test fail against the fixed program: mark it as expected to fail, invert it, or assert the error.
5. Add the rest of the tests: a wrong instructions account, a key that is not in the config, a message that does not match the withdrawal.
6. `SOLUTION.md`.

## Rules

- Keep the fix in `src/instructions/withdraw.rs`, `src/instructions/initialize.rs`, `src/state/config.rs` and `src/error.rs`. `create_allowlist` and `src/state/allowlist.rs` may be deleted or kept unused. The reviewer reads only these files, `src/lib.rs`, your tests and `SOLUTION.md`.
- Keep the given test green, adapting its calls if the config now carries the keys.
- Keep it small: no new instructions beyond what the root needs.

## Run it

```bash
npm install
npm run test:findTheRootOfTrust
```
