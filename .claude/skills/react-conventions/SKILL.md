---
name: react-conventions
description: Conventions for tdb-vazhipadu-frontend (src/) — React 19 + TypeScript (strict) + Vite + Tailwind v4 + React Router, pnpm, Vitest + React Testing Library, and the in-memory mock API in src/api. Covers quality gates, folder layout, mock-API and data-fetching rules, state management, typing, accessibility, testing, and what to flag in review. Load for any frontend work or PR review in this repo.
---

# Frontend conventions (`src/`, React 19 + TypeScript)

A vazhipadu (temple offering) booking app built as five sequential problems over one shared mock
API. This file is the single source of truth for stack rules; the `senior-react-engineer` review
agent applies it to a diff. The product brief is `docs/brief.md`.

## Quality gates (CI + pre-commit)

| Tool         | Command                             | Setting                                                          |
| ------------ | ----------------------------------- | ---------------------------------------------------------------- |
| ESLint       | `pnpm lint`                         | flat config, typescript-eslint + react-hooks, `--max-warnings=0` |
| Prettier     | `pnpm format` / `pnpm format:check` | formatter of record                                              |
| TypeScript   | `pnpm typecheck`                    | `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`     |
| Vitest + RTL | `pnpm test`                         | behaviour-focused tests, jsdom                                   |
| Build        | `pnpm build`                        | `tsc -b && vite build` must succeed                              |

Husky pre-commit runs `lint-staged`. Node 22 (`.nvmrc`), pnpm 9.

## Layout

Import alias `@/` -> `src/`.

- `src/api/` — the mock API (see below). The only data source; no `fetch`, no real backend.
- `src/app/` — `App.tsx` (router), `routes.tsx` (route tree; lazy-loads feature pages).
- `src/components/` — shared, presentational UI used by more than one feature (`Layout/`, …). Don't
  move feature-specific UI here.
- `src/features/<slug>/` — one folder per product area (offerings, cart/checkout, orders, …):
  ```
  index.ts           public API — the only file other features may import from
  pages/             route components (default-exported for lazy loading)
  components/        presentational pieces
  hooks/             use* hooks holding the feature's state/data logic
  types.ts           UI-only types (domain types live in src/api/types.ts)
  *.test.tsx         tests next to what they cover
  ```
  Later problems extend earlier features rather than duplicating them. Cross-feature imports go
  through `@/features/<slug>` only.
- `src/lib/` — framework-free helpers (`format.ts`: `formatINR`, `formatCalendarDate`).
- `src/pages/` — non-feature pages (home, not-found).
- `src/test/` — `setup.ts` (jest-dom, restore mocks/timers) and `renderRoute()`.

## Mock API (`src/api/`)

Must keep matching the brief:

- Typed functions: `getTemples()`, `getOfferings(templeId)`, `createOrder(request)`,
  `getOrders(query)`, `cancelOrder(orderId)`. Domain types (`Temple`, `Offering`, `Order`,
  `OrderQuery`, `Page<T>`, …) in `src/api/types.ts`, exported from `src/api/index.ts`.
- Data in memory, seeded once: ≥2 temples × 8–10 offerings (name, price, active flag), ~50 orders.
  Seed is deterministic (fixed data or a seeded PRNG) so screenshots and tests are stable.
- Every call returns a Promise after a random **200–1000 ms** and fails at a configurable rate
  (**default 10%**) with a typed `ApiError`. Latency and failure rate are configurable
  (e.g. `configureMockApi({ failureRate, latency })`) so tests can set 0% / 0 ms.
- Returned objects are copies — callers can never mutate the store by reference.
- Server-like rules live in the API, not the UI: validate requests (inactive offering, empty order,
  bad quantity), compute totals server-side, refuse to cancel an already-cancelled order, filter and
  paginate in `getOrders`.
- Calls accept an optional `{ signal?: AbortSignal }` so stale requests can be dropped.
- **Changing a signature is allowed when a problem needs it — and must be explained in the PR's
  "Decisions & trade-offs".**

## Data in the UI

- Components never call `src/api` directly — a `use*` hook in the feature does, and exposes a
  discriminated status (`idle | loading | success | error`).
- Every async view handles **loading, empty, error (with Retry)** — with a 10% failure rate,
  errors are the normal case, not the edge case.
- Ignore stale responses (abort or request-id check) when inputs change quickly (temple switch,
  filter change, paging).
- Mutations (`createOrder`, `cancelOrder`) disable their trigger while in flight, can't double-fire,
  show failure without losing the user's input, and refresh or patch affected lists on success.
  Optimistic updates roll back on failure.
- Filters, search and page number for lists live in URL search params, so a view is linkable and
  survives reload.

## Money & dates

- Prices are integer rupees in the API; format only at the edge with `formatINR`. Order totals come
  from the API / are derived from line items — never stored separately in state.
- Birth dates and ritual dates are calendar days: keep `YYYY-MM-DD` strings and format with
  `formatCalendarDate`. Never `new Date('YYYY-MM-DD')` for display (it shifts by timezone).

## TypeScript

- No `any`. Use `unknown` + narrowing at boundaries. No non-null `!` to silence a real `undefined`
  (`noUncheckedIndexedAccess` is on for a reason).
- Model state with discriminated unions over boolean soup.
- `import type` for type-only imports (enforced).
- Props typed with an interface/type next to the component; export types that other files use.
- Prefer derived values over duplicated state.

## React & state

- State lives at the lowest common owner. Lift only when siblings need it; `useReducer` when
  transitions are many or interdependent (a cart/order builder); Context only when prop drilling is
  genuinely painful — and keep a Context's value memoized.
- Effects are for synchronising with something external (the mock API, timers, storage). Every
  effect cleans up. No derived state in effects. Correct dependency arrays — never silence
  `react-hooks/exhaustive-deps`.
- Stable, unique `key`s — never array index for lists that reorder/insert/delete.
- `useMemo`/`useCallback` only where they buy something. No blanket memoization.
- No new runtime dependencies without a reason stated in the PR's "Decisions & trade-offs".

## Forms

- Real `<form>` with `onSubmit`; every input has a `<label>`. Validate on submit (and on blur where
  helpful); errors next to the field via `aria-describedby`; focus the first invalid field.
- API validation errors are mapped back onto fields where possible, not only shown as a banner.

## Accessibility

- Semantic elements first (`button`, `ul/li`, `table` for tabular orders, `form`, `label`, headings in
  order).
- Every interactive control has an accessible name; icon-only buttons get `aria-label`.
- Keyboard operable throughout, including dialogs (focus trap + restore) and confirm-cancel flows.
- Live updates that matter (order total, load errors, order placed/cancelled) are announced
  (`role="status"` / `role="alert"`).

## Styling

- Tailwind v4 utilities plus the shared component classes in `src/index.css` (`btn`, `card`, `input`,
  `alert`, `badge`, `empty-state`, `skeleton`…). No inline `style` except truly dynamic values.
- Works at 375px; screenshots cleanly at 1280px.

## Testing

- Vitest + RTL + `@testing-library/user-event` (`userEvent`, not `fireEvent`).
- **Mock API tests** (`src/api/*.test.ts`): fake timers + configured latency/failure rate to prove
  the 200–1000 ms delay, the failure rate, filtering, paging, validation and cancellation rules.
- **UI tests**: render the page via `renderRoute()` and stub the api functions with `vi.spyOn` (resolve,
  reject, or a controllable deferred) — never depend on real latency or randomness. Cover loading,
  error + retry, empty, and the problem's edge cases (duplicate submit, stale response, …).
- Query priority: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`.

## Always flag (review priorities)

1. **Correctness vs. the problem's requirements** — missing or wrong behaviour, unhandled edge cases.
2. **Mock API fidelity** — latency/failure behaviour broken or bypassed, store mutated by reference,
   business rules done in the UI instead of the API, undocumented signature changes.
3. **State & data bugs** — stale closures, missing effect cleanup, stale responses applied, duplicate
   submits, derived state stored and drifting, mutation, index keys, missing loading/error/retry.
4. **Types** — `any`, unsafe casts, `!` hiding real undefined, types that allow invalid states.
5. **Accessibility** — unlabeled controls, non-semantic clickable `div`s, mouse-only interactions.
6. **Tests** — required behaviour untested; tests relying on real timers/randomness; tests coupled to
   implementation details.
7. **Structure** — layout above broken, imports into another feature's internals, UI calling
   `src/api` outside a hook.

## Skip (do not flag)

- Formatting covered by Prettier/ESLint. `pnpm-lock.yaml`. Seed data values. Screenshot PNGs.

## Definition of done

All five gates green; requirement + edge cases covered by tests; loading/empty/error states
handled; screenshots committed; PR body follows the template; mock-API signature changes explained.
