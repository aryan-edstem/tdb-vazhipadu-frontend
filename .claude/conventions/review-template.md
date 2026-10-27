# PR review template

`/pr-review` posts one review: a **summary body** (this shape) plus **inline comments** on specific
lines (at least one — see `review-conventions.md` §3).

Keep it short and **junior-readable**: one sentence each for the problem, the _why_, and the fix,
laid out on their own lines, not chained into one paragraph. Plain language, a concrete snippet over
prose where it's clearer. Do not invent nits.

## Summary body

Cite every finding by `file:line`. Give each section its own `##` heading. Drop empty sections.

---

## Verdict

<one line — **FAIL** if any blocking finding remains on HEAD, otherwise **PASS**>

## Blocking (<count>)

<correctness, broken requirement, state/race bug, missing tests for required behaviour, PR body not following the template>

- **`<file>:<line>`** — <the problem, one sentence>
  - **Why:** <plain-language reason, one line>
  - **Fix:** <concrete fix or snippet>

## Non-blocking (<count>)

<style, suggestions>

- **`<file>:<line>`** — <the suggestion, one sentence>
  - **Fix:** <concrete fix>

---

## Inline comment body

```markdown
**<Blocking|Non-blocking|Question>:** <the problem or question, one sentence>

**Why:** <one line>

**Fix:** <concrete fix or snippet>
```
