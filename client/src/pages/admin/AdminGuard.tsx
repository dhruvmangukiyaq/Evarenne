import { Navigate, Outlet } from "react-router-dom";
import { adminApi } from "../../lib/admin-api";
import { useApi } from "../../lib/useApi";
import { useNoindex } from "../../lib/useNoindex";
import { ErrorState, Skeleton } from "../../components/ui/Display";

/**
 * Authentication gate for every admin route.
 *
 * The session cookie is checked server-side on mount: a visitor who types
 * `/admin` (or follows a leaked link) is bounced to the password screen, and
 * the actual product routes never render unauthenticated. It is deliberately
 * the *server's* answer that decides — a client-only check would be
 * theatre, since the API rejects the same request anyway.
 */
export function AdminGuard() {
  useNoindex("Admin · Evarenne");
  const { data, loading, error, refetch } = useApi((signal) => adminApi.session(signal), []);

  if (loading) {
    return (
      <div className="mx-auto max-w-(--container-lg) px-4 py-16" aria-busy="true">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-6 h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-(--container-lg) px-4 py-16">
        <ErrorState
          title="We couldn't verify your session"
          description={error.message}
          onRetry={refetch}
        />
      </div>
    );
  }

  if (data && data.configured === false) {
    return (
      <div className="mx-auto max-w-(--container-lg) px-4 py-16">
        <ErrorState
          title="The admin panel isn't set up here"
          description="This deployment has no admin password configured, so the panel stays closed."
        />
      </div>
    );
  }

  if (!data?.authenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
