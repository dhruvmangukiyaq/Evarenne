import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-(--container-lg) flex-col items-center gap-5 px-4 py-24 text-center">
      <p className="text-eyebrow text-champagne-deep">404</p>
      <h1 className="font-display text-h1 text-charcoal">Page not found</h1>
      <p className="max-w-md text-charcoal-soft">
        The page you're looking for doesn't exist or may have moved. Let's get you back to something
        beautiful.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="inline-flex h-11 items-center bg-olive px-6 font-sans text-sm font-medium text-ivory hover:bg-olive-hover anim-shrink"
        >
          Return home
        </Link>
        <Link
          to="/diamonds"
          className="inline-flex h-11 items-center border border-olive px-6 font-sans text-sm font-medium text-olive hover:bg-olive hover:text-ivory anim-shrink"
        >
          Browse diamonds
        </Link>
      </div>
    </div>
  );
}
