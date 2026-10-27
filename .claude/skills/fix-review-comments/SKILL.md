---
name: fix-review-comments
description: Acts on the review comments of an open problem PR — verifies each comment against the react-conventions skill and the brief, weighs fix options with you, then commits follow-up fixes to the PR's own branch, pushes, and replies on each inline thread (fixed with SHA, or why no change is needed). Use when the user says "fix the review comments on PR X" or "address the review". Invoke as "/fix-review-comments 3". Counterpart to /pr-review.
---

# Fix review comments

Turn a PR's review comments into verified, decided, committed fixes, then close every thread. **Verify
before you change** — a comment is a discussion point, not an order. The brief requires every inline
comment to be addressed by a follow-up commit or a short reply before merge.

## 1. Gather context

```bash
gh pr view <PR> --json number,title,body,headRefName,baseRefName,headRefOid,files,reviews
gh api repos/aryan-edstem/tdb-vazhipadu-frontend/pulls/<PR>/comments --paginate --jq '.[] | {id, path, line, original_line, author: {login: .user.login}, in_reply_to_id, body}'
gh api repos/aryan-edstem/tdb-vazhipadu-frontend/issues/<PR>/comments --paginate --jq '.[] | {author: {login: .user.login}, body}'
gh api user --jq .login
```

Collect every open comment; skip threads already answered. Read the requirements
(`docs/problems/p<N>-<slug>.md`, `docs/brief.md`).

## 2. Verify each claim

Load `react-conventions`. For each comment decide, citing what decides it:

- **Valid** — a real convention violation, brief mismatch or correctness bug.
- **Invalid** — contradicts the conventions/brief or is a false positive.
- **Out of scope** — fair, but not this problem's requirement (note it for a later problem; never a
  separate PR).

## 3. Decide with the user

Valid -> present 2+ fix options with trade-offs (`AskUserQuestion`). Invalid -> draft a cited reply.
Out of scope -> draft a reply saying where it will be handled. Settle every comment before writing
code.

## 4. Apply on the PR's own branch

`git switch <headRefName> && git pull --ff-only`; merge `origin/main` in if behind (no rebase). Make
the edits, run `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`. One
commit per addressed comment, message names the change (`Ignore stale offerings response on temple
switch`), staged by path. Re-capture screenshots if the UI changed. `git push`.

## 5. Reply on each thread

Reply **in the inline thread** of each comment, so the line-level discussion is visibly closed:

```bash
gh api repos/aryan-edstem/tdb-vazhipadu-frontend/pulls/<PR>/comments/<comment_id>/replies -f body='Fixed in <sha>: <one line>.'
```

Use **Fixed in `<sha>`** (+ what changed), **No change needed** (+ the reason, one or two lines), or
**Deferred to P<M>** (+ why). For a summary-only comment, reply once with `gh pr comment <PR>
--body-file <scratchpad file>`. If the comments came from the viewer's own review, that's expected
here — reply plainly.
