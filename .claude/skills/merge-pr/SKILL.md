---
name: merge-pr
user_invocable: true
description: Merge a problem's GitHub PR after verifying pre-merge conditions (CI green, body with all four template sections, a review with at least one inline comment that has been addressed, clean commit story, README row linked), then pull main so the next problem starts from it. Use when the user says "merge PR #N", "land this", or asks if a PR is ready to merge.
---

# Merge PR

Merge a problem PR into `main`, then sync.

## 1. Gather context (in parallel)

```bash
gh pr view <PR> --json number,title,body,url,state,headRefName,baseRefName,mergeable,mergeStateStatus,reviews,commits
gh pr checks <PR>
gh api repos/aryan-edstem/tdb-vazhipadu-frontend/pulls/<PR>/comments --paginate --jq '.[] | {id, in_reply_to_id, path, line, body}'
```

## 2. Pre-merge checklist — all must pass

```
Pre-merge checklist for #<PR> (<head> -> main):
[PASS/FAIL] CI checks green (N/N)
[PASS/FAIL] Body has exactly the 4 template sections (Problem, Assumptions, Decisions & trade-offs, How to test)
[PASS/FAIL] Title "P<N>: ..."; branch feature/p<N>-<slug>; P<N-1> already merged
[PASS/FAIL] Reviewed: ≥1 inline comment on a specific line
[PASS/FAIL] Every inline comment answered (follow-up commit or reply)
[PASS/FAIL] No unresolved blocking finding
[PASS/FAIL] README P<N> row links this PR
[PASS/FAIL] Commit story clean (no fix/changes/final/wip)
[PASS/FAIL] Mergeable (no conflicts with main)
```

An inline comment counts as answered when a reply (`in_reply_to_id` = its id) exists. A required
check stuck pending with no run: say so, don't wait forever. If anything fails, explain and stop —
point to `/pr-review` or `/fix-review-comments` as needed. Otherwise ask: "All checks pass. Merge #<PR>?" — unless the user already told you to merge.

## 3. Merge

```bash
gh pr merge <PR> --merge --delete-branch
```

**Merge commit, not squash** — the small commits are part of what is being shown. If the merge
fails, report the error; don't retry blindly.

## 4. Sync main

```bash
git switch main && git pull --ff-only
git branch -d feature/p<N>-<slug>    # if the local branch still exists
```

## Summary

```
Merged: #<PR> (<title>)  feature/p<N>-<slug> -> main
main pulled; ready for P<N+1> (/start-problem <N+1>)
```

Note any post-merge step that failed so the user can finish it by hand.
