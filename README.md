# tdb-vazhipadu-frontend

A frontend for booking vazhipadu — ritual offerings a devotee pays a temple to perform, usually in
the name of a person and their birth date. There is no real backend: a typed in-memory mock API in
`src/api/` simulates network latency and failures.

**Stack:** React 19 · TypeScript (strict) · Vite · Tailwind CSS v4 · React Router · Vitest + React
Testing Library · pnpm.

## Getting started

```bash
nvm use              # Node 22
corepack enable      # pnpm 9
pnpm install
pnpm dev             # http://localhost:5173
```

| Command             | What it does                              |
| ------------------- | ----------------------------------------- |
| `pnpm lint`         | ESLint, zero warnings allowed             |
| `pnpm format:check` | Prettier check (`pnpm format` to fix)     |
| `pnpm typecheck`    | TypeScript project build, no emit         |
| `pnpm test`         | Vitest + React Testing Library            |
| `pnpm build`        | Type-check and production build to `dist` |

CI runs all five on every PR into `main`.

## Problems

Each problem is one branch, one PR, one review and one merge, in order. See
[`docs/brief.md`](docs/brief.md).

| #   | Problem | PR  |
| --- | ------- | --- |
| P1  | —       | —   |
| P2  | —       | —   |
| P3  | —       | —   |
| P4  | —       | —   |
| P5  | —       | —   |
