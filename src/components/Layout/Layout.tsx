import { Suspense } from 'react';
import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router';

// Top-level destinations. Add a feature's entry here when its route goes live.
const NAV_ITEMS: { to: string; label: string }[] = [{ to: '/', label: 'Home' }];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition ${
    isActive
      ? 'bg-brand-50 text-brand-700'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

function PageFallback() {
  return (
    <div role="status" className="page space-y-4" aria-label="Loading page">
      <div className="skeleton h-8 w-64 max-w-full" />
      <div className="skeleton h-4 w-96 max-w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="skeleton h-40" />
        <div className="skeleton h-40" />
        <div className="skeleton h-40" />
      </div>
    </div>
  );
}

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="page flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 rounded-lg">
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white shadow-sm"
            >
              TDB
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold text-slate-900">TDB Vazhipadu</span>
              <span className="block text-xs text-slate-500">Temple offering booking</span>
            </span>
          </Link>
          <nav aria-label="Main">
            <ul className="flex gap-1 overflow-x-auto">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} end className={navLinkClass}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main className="flex-1 px-4 py-6 sm:px-6 lg:py-10">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <ScrollRestoration />
    </div>
  );
}
