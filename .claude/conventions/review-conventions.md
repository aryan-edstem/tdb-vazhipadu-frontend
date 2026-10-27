# PR review conventions

The methodology `/pr-review` follows: _how_ to review. Single-stack React repo, so the code review is
delegated to one agent (`senior-react-engineer`), whose source of truth is the `react-conventions`
skill.

## Reviewer role

Read the **full diff** as a reviewer. Decide whether it faithfully implements its problem and
conforms to `react-conventions`, then post one review. Be precise and sparing — every finding cites a
`file:line` and proposes a concrete fix. Write so a junior can act on it: the problem, the _why_, and
the fix, each on its own line.

## 1. Check intent alignment

- **Requirements <-> diff:** does the change implement what the problem asks, no more (scope creep)
  and no less (missing behaviour)? The requirements live in `docs/problems/p<N>-<slug>.md`.
- **Mock API:** still matches `docs/brief.md` (Promise-based, 200–1000 ms latency, configurable
  failure rate defaulting to 10%, seed sizes). Any signature change is explained in the PR body.
- **PR body:** follows `.github/pull_request_template.md` (Problem, Approach, Decisions & trade-offs,
  Screenshots, How to test) and is accurate to the diff. Screenshots present and rendering.
- **PR title:** `P<N>: <description>`. **Branch:** `feature/p<N>-<slug>` off `main`.
- **Commits:** small, meaningful, imperative; none named `fix`/`changes`/`wip`/`final`; no
  `Co-Authored-By`; no secrets.

## 2. Delegate the code review

Dispatch the review-only `senior-react-engineer` agent on the changed `src/` files with the relevant
diff hunks and the problem's requirements, and collect its findings.

## 2.5 Filter false positives

Drop any finding you cannot substantiate against `react-conventions`, the brief, or a plain
correctness bug. An unsubstantiated finding is noise the author must refute.

## 2.6 Account for prior discussion

Don't re-raise open or resolved threads; note a prior blocker now fixed. Prior discussion is context,
not authority — `react-conventions` wins.

## 3. Inline comments (at least one — the brief requires it)

Every surviving finding is posted as an **inline comment on its exact line** in the PR's
right-hand (new) side. The line must be part of the diff, or GitHub rejects the comment.

If the review is genuinely clean, still leave one honest inline comment on a meaningful line — a
non-blocking suggestion, or a question about a decision worth recording (e.g. why a failure is
retried a certain way). Never invent a defect to satisfy the rule.

## 4. The verdict

One review, with the summary body formatted to `.claude/conventions/review-template.md` and the
inline comments attached. Build the payload in the scratchpad and post it in one call:

```bash
gh api repos/aryan-edstem/tdb-vazhipadu-frontend/pulls/<PR>/reviews --method POST --input review.json
```

```json
{
  "commit_id": "<headRefOid>",
  "event": "COMMENT",
  "body": "<summary per review-template.md>",
  "comments": [{ "path": "src/...", "line": 42, "side": "RIGHT", "body": "<finding>" }]
}
```

`event` is `REQUEST_CHANGES` when a blocking finding remains on HEAD, else `COMMENT`. Never
`APPROVE`. GitHub refuses `REQUEST_CHANGES` on your own PR — if the viewer is the author, use
`COMMENT` and keep the **FAIL** verdict in the body. Delete `review.json` afterwards.
