# 09 — Write the exit

A round-based game. Players join a round with a stake in the game's token, or pay with another token that the program swaps through an external DEX. The moves of each round run on an ephemeral rollup. When the round ends, the rollup's executor key settles it on Solana and the whole pot goes to the winner.

The program has three dependencies, and none of them has a way out.

1. **The ephemeral rollup.** Only `config.executor` can settle a round. If the rollup stops, every stake in the round stays in the vault for good.
2. **The external DEX.** `join_with_swap` can only call `DEX_PROGRAM_ID`, a constant in the code. If that DEX is shut down or hacked, paying with another token stops until someone upgrades the program.
3. **The upgrade authority.** The program's upgrade authority is a Squads multisig run by a third-party service: 2 of 3 signers, no timelock.

Lectures: Execution layer shift, Dependency independency.

## What you're given

- `initialize`, `open_round`, `join`, `join_with_swap` and `settle` — complete.
- `tests/09-write-the-exit/` — a fixture with three funded players, the calls for the given instructions, and one happy-path test.

## What you do

1. In `SOLUTION.md`, take each dependency through one question: would the product make sense without it? If yes, describe its exit: what triggers it, who can trigger it, how long it takes, and what someone could do with the same exit if they stole the key. If no, explain why there is nothing to plan.
2. For the rollup, also decide whether the rounds should run on it at all. Justify it with a Solana limit, not with speed, or argue that the rounds belong on Solana itself.
3. Implement the exits your answers call for. At minimum:
   - a player can get their stake back from a round the executor never settles, without the executor;
   - the swap venue can be replaced without a program upgrade, and a change does not take effect at once.
4. Add tests for the exits you wrote.

The upgrade authority has no code in this program. Its exit lives in `SOLUTION.md`.

## Rules

- Put the round exit in `src/instructions/refund.rs` and the venue change in `src/instructions/change_dex.rs`. The reviewer reads only these files, `src/lib.rs`, `src/constants.rs`, `src/error.rs`, `src/state/`, `src/instructions/settle.rs`, `src/instructions/join_with_swap.rs`, your tests and `SOLUTION.md`.
- Keep the given instructions working. The given test must stay green.
- Keep it small: nothing beyond the exits.

## Run it

```bash
npm install
npm run test:writeTheExit
```
