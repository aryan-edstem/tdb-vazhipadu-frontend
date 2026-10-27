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

## Approach

How the components and state are organised.

## Decisions & trade-offs

What you chose, and why over the alternatives.

## Screenshots

UI before/after or a GIF.

## How to test

Page to open, steps, test files.
```

- **Problem** — the problem's requirement in 1–2 lines; link `docs/problems/p<N>-<slug>.md`.
- **Approach** — component tree, where state lives (local / reducer / context / custom hook / URL),
  data flow through `src/api`. A short bullet list or a tiny tree beats prose.
- **Decisions & trade-offs** — 2–4 bullets: what was chosen, the alternative, why. **Any change to a
  mock API signature is explained here** (the brief requires it), as is any new runtime dependency.
- **Screenshots** — PNGs captured with `pnpm screenshots <route>` and committed under
  `docs/screenshots/p<N>-*.png` on the branch. Embed with a **commit-SHA raw URL** so the image
  survives branch deletion:
  `![Offerings](https://raw.githubusercontent.com/aryan-edstem/tdb-vazhipadu-frontend/<sha>/docs/screenshots/p1-offerings.png)`.
  Before/after: "before" is the initial/loading state, "after" is the state after interaction.
- **How to test** — `pnpm dev` -> open `http://localhost:5173/<route>`, numbered steps, and the test
  files with `pnpm test`.

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
