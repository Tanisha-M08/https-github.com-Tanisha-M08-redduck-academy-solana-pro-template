# 04 — Rewards without a loop

A staking pool. Stakers deposit the pool's token, rewards in the same token arrive from time to time, and every staker gets a share of every reward in proportion to their stake.

The given program splits a reward the moment it arrives: `add_rewards` takes the stakers as remaining accounts and credits each one. It works for the three stakers in the test. With three hundred, the transaction does not fit, and whoever sends the reward has to know and bring every staker.

Lectures: Lazy loading, Pay-as-you-act.

## What you're given

- `initialize`, `stake`, `unstake`, `add_rewards` and `claim` — complete, and the happy-path test passes.
- `tests/04-rewards-without-a-loop/` — a fixture with three funded stakers, the calls for every instruction (the fixture passes the stakers as remaining accounts to `add_rewards`), and one happy-path test.

## What you do

1. Remove the loop. `add_rewards` must touch no staker account; the remaining accounts the fixture still passes are ignored. The pool keeps one number, the reward per staked token, and a reward only raises it. Keep enough precision that small rewards on a big stake do not vanish.
2. Each staker's account keeps the value of that number at their last settlement. `claim` pays the difference times their stake and moves the marker.
3. `stake` and `unstake` settle what the staker is owed before the stake changes, never after.
4. A staker who never claims must be owed exactly the right amount whenever they come, after any number of rewards and other stakers' actions.
5. Tests: three stakers with rewards arriving between their actions, each paid the right amount in whatever order they claim; a deposit that does not change what was owed before it; a staker who claims last after everyone else.
6. `SOLUTION.md`.

## Rules

- Keep the pool fields in `src/state/pool.rs`, the staker fields in `src/state/staker.rs`, and the logic in `src/instructions/`. The reviewer reads only these, `src/lib.rs`, `src/error.rs`, your tests and `SOLUTION.md`.
- Do not change the instruction signatures or the accounts the fixture passes. The given test must stay green.
- Keep it small: one token, no lockups, no reward schedule.

## Run it

```bash
npm install
npm run test:rewardsWithoutALoop
```
