import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="badge badge-neutral mb-4">404</p>
      <h1 className="page-title">Page not found</h1>
      <p className="page-description">That page doesn&apos;t exist or has moved.</p>
      <Link to="/" className="btn btn-primary mt-6">
        Back to home
      </Link>
    </div>
  );
}
