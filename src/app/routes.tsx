import type { RouteObject } from 'react-router';
import { Layout } from '@/components/Layout/Layout';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Feature pages are added here, lazy-loaded so each feature ships in its own chunk:
//   { path: 'offerings', lazy: async () => ({ Component: (await import('@/features/offerings')).OfferingsPage }) },
export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
