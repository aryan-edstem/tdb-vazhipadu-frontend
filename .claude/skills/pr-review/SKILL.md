---
name: pr-review
description: Reviews an open problem PR locally. Reads the full diff with the gh CLI, reviews it against the problem's requirements, the brief and the react-conventions skill (delegating the code review to the senior-react-engineer agent), then posts one review with a summary body plus at least one inline comment on a specific line. Invoke with the PR number, e.g. "/pr-review 3".
---

# PR review (local)

Review an open PR and post one review with inline comments. **The methodology lives in
`.claude/conventions/review-conventions.md`; read it.** This skill covers the I/O.

**Precondition:** `gh auth status` OK.

## 1. Gather context

```bash
gh pr view <PR> --json number,title,body,author,headRefName,baseRefName,headRefOid,commits,files
gh pr diff <PR>
gh api user --jq .login
```

Read the **full diff** — the brief requires a real reviewer's read, not a skim.

Existing discussion (owner `aryan-edstem`, repo `tdb-vazhipadu-frontend`):

```bash
gh api graphql -f owner='aryan-edstem' -f name='tdb-vazhipadu-frontend' -F pr=<PR> -f query='
query($owner: String!, $name: String!, $pr: Int!) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $pr) {
      comments(first: 100) { nodes { author { login } createdAt body } }
      reviews(first: 100) { nodes { author { login } state submittedAt body } }
      reviewThreads(first: 100) {
        nodes { isResolved isOutdated comments(first: 100) { nodes { author { login } path line originalLine body } } }
      }
    }
  }
}'
```

Requirements: `docs/problems/p<N>-<slug>.md` (from the branch name) and `docs/brief.md`. A file at
the PR head:

```bash
gh api -H "Accept: application/vnd.github.raw" "repos/aryan-edstem/tdb-vazhipadu-frontend/contents/<path>?ref=<sha>"
```

## 2. Review

Follow review-conventions §1 (intent, brief, template, commits), §2 (delegate to
`senior-react-engineer` with the diff hunks + requirements), §2.5 (filter), §2.6 (prior discussion).

## 3. Post the review

Per review-conventions §3–§4: a summary body to `.claude/conventions/review-template.md` plus **at
least one inline comment** on a line in the diff, posted together as one review via
`gh api .../pulls/<PR>/reviews --input <scratchpad>/review.json` (`commit_id` = `headRefOid`).
Never `APPROVE`; `COMMENT` on your own PR. Confirm the inline comment appears
(`gh api repos/aryan-edstem/tdb-vazhipadu-frontend/pulls/<PR>/comments --jq length` ≥ 1), delete the
file, and suggest `/fix-review-comments <PR>`.
