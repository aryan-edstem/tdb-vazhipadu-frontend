# Git hygiene

Shared reference, read on demand by `/start-problem`, `/raise-pr`, `/fix-review-comments` and the
review agent. It governs **every** change on the repo, from the first commit on a branch.

## Branches

One long-lived branch: **`main`**. It stays releasable and is never committed to directly (a hook
blocks commits, merges and history rewrites on it). Everything lands through a PR.

One branch per problem, named `feature/p<N>-<slug>` — e.g. `feature/p1-offerings-list`. The slug is
short kebab-case taken from the problem's title, and matches `docs/problems/p<N>-<slug>.md`.

**Exactly one PR per problem.** Never cut `chore/`, `docs/` or `fix/` branches — tooling tweaks,
README updates and follow-up fixes ride as commits on the current problem's branch.

Problems are done **strictly in order**: P<N+1> is cut only after P<N> has merged, from the latest
`main`:

```bash
git switch main && git pull --ff-only
git switch -c feature/p<N>-<slug>
```

## Commits

- Short, meaningful, **imperative** subject lines describing that step, e.g.
  `Add offering search`, `Show order total in rupees`. No trailing period, no emoticons.
- **Never** `fix`, `changes`, `wip`, `final`, `update`, or anything that doesn't say what changed.
- **No `Co-Authored-By` lines** and no "Generated with ..." trailers.
- **Atomic commits.** Each commit is one coherent step that builds and passes lint on its own. A
  typical problem reads as a story, e.g.:
  1. `Add P1 problem statement`
  2. `Add offering types and mock API seed data`
  3. `Render a temple's offerings with loading and error states`
  4. `Add offering search`
  5. `Test offering search and retry`
  6. `Link P1 PR in README`
- Stage selectively by path (`git add src/features/offerings/hooks/useOfferings.ts`) — never blanket
  `git add -A` / `git add .`.
- Husky pre-commit runs `lint-staged` (ESLint `--fix --max-warnings=0` + Prettier). Let it run —
  **never `--no-verify`**; fix what it flags.
- Never commit secrets.
- Don't rewrite pushed history. Prefer a new commit; if you truly must, `--force-with-lease` on your
  own feature branch only.

## Keeping a branch in sync

Problems are sequential, so `main` shouldn't move under an open PR. If it does, **merge `main` into
the branch — don't rebase**: `git fetch origin && git merge origin/main`.

## Before you push

- `git status` clean; no stray files, no `dist/`.
- `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build` all green.

```bash
git push -u origin HEAD
```
