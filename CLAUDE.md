# CLAUDE.md

tdb-vazhipadu-frontend — a temple offering (vazhipadu) booking frontend, built as five problems
(P1–P5), each shipped as its own branch, PR, review and merge into `main`. Vite + React 19 +
TypeScript (strict) + Tailwind v4 + React Router, pnpm, Vitest + React Testing Library. **No real
backend** — data comes from the typed in-memory mock API in `src/api/`. Brief: `docs/brief.md`.

## Commands

```bash
pnpm install                 # pnpm 9, Node 22 (.nvmrc)
pnpm dev                     # http://localhost:5173
pnpm lint                    # ESLint, --max-warnings=0
pnpm format                  # Prettier (format:check in CI)
pnpm typecheck               # tsc -b
pnpm test                    # Vitest (test:watch for watch mode)
pnpm test:hooks              # guardrail hook tests (local only)
pnpm build                   # tsc -b && vite build
pnpm screenshots <route>     # PNG of /<route> into docs/screenshots/ (bare route; `home` = /)
```

## Workflow

```
feature/p<N>-<slug>  --PR-->  main        (P1 -> P5, strictly in order)
```

- `main` is the only long-lived branch; a hook blocks commits/merges/rewrites on it.
- One branch per problem, cut from the latest `main` **after the previous problem has merged**
  (`feature/p1-offerings-list`). Its requirements are committed as `docs/problems/p<N>-<slug>.md`.
- Small, meaningful, imperative commits (`Add offering search`, `Show order total in rupees`) —
  never `fix` / `changes` / `wip` / `final`. No `Co-Authored-By` trailers.
- **Exactly one PR per problem** — never open chore/docs/fix PRs. Anything extra rides as a commit
  on the current problem's branch.
- PR body follows `.github/pull_request_template.md` (Problem, Assumptions, Decisions & trade-offs,
  How to test). Every PR gets a review
  with **at least one inline comment on a specific line**, answered by a follow-up commit or a reply,
  before it merges (merge commit). Then pull `main`.

Skills: `/start-problem <N>` -> implement -> `/raise-pr` -> `/pr-review <PR>` ->
`/fix-review-comments <PR>` -> `/merge-pr <PR>`. Full rules: `.claude/conventions/git-hygiene.md`,
`.claude/conventions/github-pr.md`.

## Architecture (orientation)

Alias `@/` -> `src/`. `src/api/` is the mock API (in-memory data, random 200–1000 ms latency,
configurable failure rate). UI for each area lives in `src/features/<slug>/` with a public
`index.ts`; routes are wired in `src/app/routes.tsx`. Stack, state, data, typing, a11y and testing
rules live in the **`react-conventions` skill — the single source of truth, loaded for any
frontend work.**
