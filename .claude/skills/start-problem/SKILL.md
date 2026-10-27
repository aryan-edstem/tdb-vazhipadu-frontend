---
name: start-problem
description: The front door for one problem (P1-P5). Checks the previous problem has merged, saves the problem statement, loads react-conventions, creates the feature/p<N>-<slug> branch from the latest main, and produces a scoped plan with a commit story. Use at the start of any problem, e.g. "/start-problem 1" or when the user pastes the next problem statement.
---

# Start a problem

Turn one problem statement into a concrete, scoped plan on its own branch before writing code.

| Piece        | Value                          |
| ------------ | ------------------------------ |
| Branch       | `feature/p<N>-<slug>`          |
| Requirements | `docs/problems/p<N>-<slug>.md` |
| PR title     | `P<N>: <short description>`    |

## Steps

1. **Order check.** Problems go strictly P1 -> P5. For N > 1, `gh pr list --state merged` must show
   the P<N-1> PR merged; if not, stop and say so. There must be no other open PR.

2. **Get the requirements.** The user gives each problem's statement. If it's missing or the
   acceptance criteria are unclear, stop and ask — don't invent requirements. Pick a short kebab-case
   `<slug>` from its title (e.g. `offerings-list`).

3. **Load conventions.** Invoke **`react-conventions`**; re-read `docs/brief.md` (mock API rules).
   Skim `.claude/conventions/git-hygiene.md`.

4. **Branch from the latest `main`** (never work on `main`):

   ```bash
   git switch main && git pull --ff-only
   git switch -c feature/p<N>-<slug>
   ```

5. **Save the statement** verbatim to `docs/problems/p<N>-<slug>.md` and make it the branch's first
   commit: `Add P<N> problem statement`.

6. **Plan.** Identify which features/hooks from earlier problems this extends, and whether any mock
   API signature must change (if so, note why — it goes in the PR's Decisions & trade-offs).
   Plan the commit story — 4–8 small steps, each with an imperative message (see git-hygiene). The
   last steps are tests (if not written alongside) and screenshots.

## Output

End with a short brief, then let the user confirm before implementing (skip the pause only when the
user has already said to go ahead):

- **Scope:** 2–4 lines on what the problem asks and its acceptance criteria.
- **Branch:** what you created.
- **Mock API:** functions used; any signature change and why.
- **State design:** where state lives and why (local / reducer / hook / context / URL).
- **Commit plan:** the ordered commit messages.

When implementation is done, use `/raise-pr`.
