---
name: raise-pr
description: Open the single pull request for a problem the tdb-vazhipadu-frontend way — verify the feature/p<N>-<slug> branch, run lint/format/typecheck/test/build, check the commit story, create the PR into main with a "P<N>: ..." title and the repo's PR template (Problem, Assumptions, Decisions & trade-offs, How to test), then link it in the README table. Use when a problem is done, e.g. "/raise-pr" or "open the PR for p2".
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
4. **Commit story.** `git log --oneline origin/main..HEAD` reads as small, imperative, meaningful
   steps. No `fix`/`changes`/`final`/`wip`; no `Co-Authored-By`. If a message is bad and the branch
   is **not yet pushed**, fix it now (`git commit --amend` for the tip only); once pushed, leave history
   alone. `git status` clean.

## Compose the body and open the PR

```bash
git push -u origin HEAD
```

Write `pr-body.md` (in the scratchpad, not the repo) following `.github/pull_request_template.md`
exactly — `## Problem`, `## Assumptions`, `## Decisions & trade-offs`, `## How to test`, nothing
else — filled per `github-pr.md`:

- **Assumptions** start from the list recorded by `/start-problem`, plus any gap hit while building.
- **Any mock API signature change goes in Decisions & trade-offs.**
- **How to test** names real commands, UI steps and test files — check each path exists.

```bash
gh pr create --base main --head feature/p<N>-<slug> --title "P<N>: <short description>" --body-file <scratchpad>/pr-body.md
```

(Optional screenshot: see `github-pr.md` — embed with a commit-SHA raw URL and check it returns
`200` with `curl -sI`.)

## Link it in the README

Fill the P<N> row of the README `| # | Problem | PR |` table with the problem title and PR link,
commit on the same branch (`Link P<N> PR in README`), push. Then post the PR URL and suggest
`/pr-review <PR>`.

## Definition of done

Five gates green; PR titled `P<N>: ...`, body has exactly the four template sections with real
assumptions, base `main`; README row linked; commit history is a clean story.
