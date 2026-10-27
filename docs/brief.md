# Brief

A vazhipadu is a ritual offering that a devotee pays the temple to perform. The devotee pays a fixed
fee, and the priest performs the ritual, usually in the name of a person and their birth date.

## Stack

- React 18+ and TypeScript (strict mode), built with Vite. Styling, routing, data-fetching and test
  tools are our choice (Tailwind CSS preferred; Vitest or Jest with React Testing Library preferred).
- No real backend. Build a mock API inside the app (see below). No other setup is needed.

## Mock API

A typed mock API module (`src/api/`) that keeps its data in memory and behaves like a real network:

- Every call returns a Promise and takes a random 200–1000 ms.
- Calls fail at a configurable rate (default 10%) with an error.
- Seed at least 2 temples with 8–10 offerings each (name, price, active flag), and around 50
  existing orders.

| Function                 | Purpose                                   |
| ------------------------ | ----------------------------------------- |
| `getTemples()`           | List temples                              |
| `getOfferings(templeId)` | A temple's offerings                      |
| `createOrder(request)`   | Place an order with one or more offerings |
| `getOrders(query)`       | List orders, with filters and pages       |
| `cancelOrder(orderId)`   | Cancel an order                           |

Signatures may change (for example, to add parameters) if a problem needs it — explain the change in
the PR.

## Way of working

Work the way you would on a real team: each problem is one branch, one PR, one review and one merge,
in order (P1 to P5).

1. A public GitHub repo named `tdb-vazhipadu-frontend`. On `main`, a README and the base Vite
   project.
2. For each problem, a branch from the latest `main`, e.g. `feature/p1-offerings-list`.
3. Commit in small, meaningful steps, such as `Add offering search` or `Show order total in rupees`.
   No commits like `fix`, `changes`, `wip` or `final`. No direct commits to `main`.
4. Open a PR into `main` using the PR template.
5. Review the PR before merging. Read the full diff as a reviewer. Leave at least one review comment
   on a specific line (own or from an AI review tool). Address it with a follow-up commit or a short
   reply explaining why no change is needed.
6. Merge the PR (squash or merge commit, both fine), then pull `main` before starting the next
   problem.

Problem statements: `docs/problems/p<N>-<slug>.md`, added on each problem's branch.
