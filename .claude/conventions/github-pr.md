# GitHub & PR conventions

Shared reference, read on demand by `/raise-pr`, `/pr-review`, `/fix-review-comments`, `/merge-pr`
and the review agent.

Repo: `aryan-edstem/tdb-vazhipadu-frontend` (public). One PR per problem, base `main`.

## PR title

`P<N>: <short description>` — e.g. `P1: Offerings list with search`.

## PR body

Follows `.github/pull_request_template.md` exactly — same headings, same order:

```markdown
## Problem

What this PR solves (1–2 lines).

## Assumptions

Gaps in the problem statement you had to fill, and what you decided.

## Decisions & trade-offs

What you chose, and why over the alternatives.

## How to test

Commands, steps in the UI, test files.
```

No other sections — in particular no Approach or Screenshots headings.

- **Problem** — the problem's requirement in 1–2 lines; link `docs/problems/p<N>-<slug>.md`.
- **Assumptions** — one bullet per gap in the statement: the ambiguity, then what was decided
  (`Search matches offering name only, case-insensitive — the statement doesn't say which fields`).
  Collected while working (start with the list from `/start-problem`), not reconstructed at the end.
  If there were genuinely none, say so in one line.
- **Decisions & trade-offs** — 2–4 bullets: what was chosen, the alternative, why. Where state lives
  belongs here when it was a real choice. **Any change to a mock API signature is explained here**
  (the brief requires it), as is any new runtime dependency.
- **How to test** — commands (`pnpm install`, `pnpm dev`, `pnpm test`), numbered steps in the UI at
  `http://localhost:5173/<route>` (including how to see the error/retry state — e.g. the failure-rate
  setting), and the test files that cover the problem.

Screenshots are optional. If one genuinely helps, commit it under `docs/screenshots/p<N>-*.png`
(`pnpm screenshots <route>`) and embed it in How to test with a commit-SHA raw URL
(`https://raw.githubusercontent.com/aryan-edstem/tdb-vazhipadu-frontend/<sha>/docs/screenshots/<file>.png`).

## Review (required before every merge)

The PR gets one review with **at least one inline comment anchored to a specific line** of the diff.
Each inline comment is then addressed — a follow-up commit (reply with its SHA) or a short reply
explaining why no change is needed. See `review-conventions.md`.

## CI (`.github/workflows/ci.yml`) — must be green to merge

`pnpm lint` (zero warnings), `pnpm format:check`, `pnpm typecheck`, `pnpm test`, `pnpm build`.

## Merging

`gh pr merge <N> --merge --delete-branch` — a **merge commit**, not squash: the small, meaningful
commits are part of what is being shown, so they must survive onto `main`. Then
`git switch main && git pull --ff-only`.

## README problems table

`README.md` has a `| # | Problem | PR |` table. Because PRs are capped at one per problem, each
problem's row is filled by a commit on **its own** branch after the PR is opened
(`Link P<N> PR in README`). Never open a docs PR for it.
