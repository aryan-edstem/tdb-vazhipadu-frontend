---
name: raise-pr
description: Open the single pull request for a problem the tdb-vazhipadu-frontend way — verify the feature/p<N>-<slug> branch, run lint/format/typecheck/test/build, capture and commit screenshots, check the commit story, create the PR into main with a "P<N>: ..." title and the repo's PR template, then link it in the README table. Use when a problem is done, e.g. "/raise-pr" or "open the PR for p2".
---

# Raise a PR

Land a problem as **its one PR**, passing CI on the first try. Rules live in
`.claude/conventions/git-hygiene.md` and `.claude/conventions/github-pr.md`; this is the checklist
that applies them.

## Pre-flight (block on any failure)

1. **Branch.** `git rev-parse --abbrev-ref HEAD` is `feature/p<N>-<slug>`, not `main`. No PR already
   exists for it (`gh pr list --head <branch>`) — never open a second one.
2. **Up to date.** `git fetch origin`; if `origin/main` has moved, `git merge origin/main` (no rebase).
3. **Gates:**
   ```bash
   pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build
   ```
4. **Screenshots.** Capture the route's key states (one-time per machine:
   `pnpm exec playwright install chromium`):
   ```bash
   pnpm screenshots <route> --name=p<N>-<slug>
   ```
   The mock API fails 10% of the time and takes up to 1 s, so wait for the loaded state, and retake
   if an error banner was captured by accident. For an "after" state that needs interaction (or a
   deliberate error state), capture with a small Playwright snippet in the scratchpad — don't ship
   test-only branches in components. Look at each PNG (Read it) before committing. Commit them alone:
   `git add docs/screenshots/p<N>-*.png && git commit -m "Add <problem> screenshots"`.
5. **Commit story.** `git log --oneline origin/main..HEAD` reads as small, imperative, meaningful
   steps. No `fix`/`changes`/`final`/`wip`; no `Co-Authored-By`. If a message is bad and the branch
   is **not yet pushed**, fix it now (`git commit --amend` for the tip only); once pushed, leave history
   alone. `git status` clean.

## Compose the body and open the PR

Push first so the screenshot commit SHA exists on GitHub:

```bash
git push -u origin HEAD
git log -1 --format=%H -- docs/screenshots     # <sha> for image URLs
```

Write `pr-body.md` (in the scratchpad, not the repo) following `.github/pull_request_template.md`
exactly — `## Problem`, `## Approach`, `## Decisions & trade-offs`, `## Screenshots`,
`## How to test` — filled per `github-pr.md`. **Any mock API signature change goes in Decisions &
trade-offs.** Images:
`![<alt>](https://raw.githubusercontent.com/aryan-edstem/tdb-vazhipadu-frontend/<sha>/docs/screenshots/<file>.png)`.

```bash
gh pr create --base main --head feature/p<N>-<slug> --title "P<N>: <short description>" --body-file <scratchpad>/pr-body.md
```

Verify each image URL resolves (`curl -sI <raw-url>` -> `200`).

## Link it in the README

Fill the P<N> row of the README `| # | Problem | PR |` table with the problem title and PR link,
commit on the same branch (`Link P<N> PR in README`), push. Then post the PR URL and suggest
`/pr-review <PR>`.

## Definition of done

Five gates green; screenshots committed and embedded; PR titled `P<N>: ...`, body follows the
template, base `main`; README row linked; commit history is a clean story.
