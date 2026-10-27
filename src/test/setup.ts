import '@testing-library/jest-dom/vitest';

// Tests never wait on the mock API's real latency or random failures: stub the `@/api` functions
// with `vi.spyOn(...)`, or use fake timers and a 0% failure rate when exercising the API itself.
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// jsdom doesn't implement scrolling; React Router's <ScrollRestoration> calls it on navigation.
window.scrollTo = () => {};
