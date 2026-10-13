import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ApiError } from "../../lib/api";
import { adminApi } from "../../lib/admin-api";
import { useApi } from "../../lib/useApi";
import { useNoindex } from "../../lib/useNoindex";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Form";
import { ErrorState, Skeleton } from "../../components/ui/Display";

/**
 * Password gate for the admin panel.
 *
 * The URL is not a secret and this page never pretends otherwise — it exists
 * only to present the one input that the server checks (with a deliberate
 * delay and a failure throttle behind it). Nothing about the panel is
 * reachable until that check passes.
 */
export function AdminLoginPage() {
  useNoindex("Admin sign in · Evarenne");
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const session = useApi((signal) => adminApi.session(signal), []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await adminApi.login(password);
      navigate("/admin/products", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (session.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory px-4" aria-busy="true">
        <Skeleton className="h-72 w-full max-w-sm" />
      </div>
    );
  }

  // Signed in already (a second tab, say) — straight through to the panel.
  if (session.data?.authenticated) {
    return <Navigate to="/admin/products" replace />;
  }

  const notConfigured = session.data?.configured === false;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ivory px-4 py-14">
      <div className="w-full max-w-sm border border-ivory-dim bg-white p-7 shadow-card sm:p-8">
        <p className="font-sans text-xs tracking-[0.22em] text-charcoal-faint uppercase">
          Evarenne
        </p>
        <h1 className="mt-2 font-display text-3xl text-charcoal">Admin sign in</h1>
        <p className="mt-2 text-sm leading-relaxed text-charcoal-soft">
          This panel is private. Enter the password to manage the diamond catalogue.
        </p>

        {session.error && (
          <div className="mt-5">
            <ErrorState
              title="Couldn't reach the server"
              description={session.error.message}
              onRetry={session.refetch}
            />
          </div>
        )}

        {notConfigured ? (
          <p className="mt-6 border border-ivory-dim bg-ivory-deep/60 p-4 text-sm text-charcoal-soft">
            Admin access isn't configured on this deployment yet, so the panel stays closed.
          </p>
        ) : (
          <form onSubmit={(event) => void onSubmit(event)} className="mt-6 flex flex-col gap-4">
            <Input
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              autoFocus
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={error ?? undefined}
              disabled={submitting}
            />
            <Button type="submit" fullWidth loading={submitting}>
              Sign in
            </Button>
          </form>
        )}
      </div>

      <Link
        to="/"
        className="mt-6 font-sans text-sm text-charcoal-soft underline-offset-4 transition-colors hover:text-olive hover:underline"
      >
        ← Back to the site
      </Link>
    </div>
  );
}
