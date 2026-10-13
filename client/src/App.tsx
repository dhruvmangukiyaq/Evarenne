import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { ToastProvider } from "./components/ui/Toast";
import { HomePage } from "./pages/HomePage";
import { CatalogPage } from "./pages/CatalogPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { Skeleton } from "./components/ui/Display";

// Route-level code splitting for the heavier, less-visited pages
const EducationPage = lazy(() =>
  import("./pages/EducationPage").then((m) => ({ default: m.EducationPage })),
);
const StaticPage = lazy(() => import("./pages/StaticPage").then((m) => ({ default: m.StaticPage })));
const AppointmentPage = lazy(() =>
  import("./pages/AppointmentPage").then((m) => ({ default: m.AppointmentPage })),
);

// The admin panel: lazy like the rest, and deliberately outside the public
// `Layout` — no storefront chrome, and no route above links to these paths.
const AdminLoginPage = lazy(() =>
  import("./pages/admin/AdminLoginPage").then((m) => ({ default: m.AdminLoginPage })),
);
const AdminGuard = lazy(() =>
  import("./pages/admin/AdminGuard").then((m) => ({ default: m.AdminGuard })),
);
const AdminChrome = lazy(() =>
  import("./components/admin/AdminChrome").then((m) => ({ default: m.AdminChrome })),
);
const AdminProductsPage = lazy(() =>
  import("./pages/admin/AdminProductsPage").then((m) => ({ default: m.AdminProductsPage })),
);
const AdminProductFormPage = lazy(() =>
  import("./pages/admin/AdminProductFormPage").then((m) => ({ default: m.AdminProductFormPage })),
);

function PageFallback() {
  return (
    <div className="mx-auto max-w-(--container-page) px-4 py-16 lg:px-8" aria-busy="true">
      <Skeleton className="h-10 w-64" />
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

/**
 * The catalogue sells lab-grown diamonds only, so the old stone-type URLs
 * collapse onto the one catalog. The query string is carried over, so a
 * shared link with filters still lands on the same result set.
 */
function DiamondsRedirect() {
  const location = useLocation();
  return <Navigate to={{ pathname: "/diamonds", search: location.search }} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {/* Admin panel — unlinked from the site, password-gated by AdminGuard,
              and marked noindex while it is on screen. */}
          <Route
            path="admin/login"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminLoginPage />
              </Suspense>
            }
          />
          <Route
            path="admin"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminGuard />
              </Suspense>
            }
          >
            <Route
              element={
                <Suspense fallback={<PageFallback />}>
                  <AdminChrome />
                </Suspense>
              }
            >
              <Route index element={<Navigate to="/admin/products" replace />} />
              <Route path="products" element={
                <Suspense fallback={<PageFallback />}>
                  <AdminProductsPage />
                </Suspense>
              } />
              <Route path="products/new" element={
                <Suspense fallback={<PageFallback />}>
                  <AdminProductFormPage />
                </Suspense>
              } />
              <Route path="products/:id/edit" element={
                <Suspense fallback={<PageFallback />}>
                  <AdminProductFormPage />
                </Suspense>
              } />
              {/* Anything else under /admin lands on the dashboard. */}
              <Route path="*" element={<Navigate to="/admin/products" replace />} />
            </Route>
          </Route>

          <Route element={<Layout />}>
            <Route index element={<HomePage />} />

            {/* Catalog routes */}
            <Route path="diamonds" element={<CatalogPage />} />
            <Route path="diamonds/:diamondType" element={<DiamondsRedirect />} />
            <Route path="search" element={<CatalogPage />} />

            {/* Product detail */}
            <Route path="products/:slugOrId" element={<ProductDetailPage />} />

            {/* Education */}
                <Route
                  path="diamond-guide"
                  element={
                    <Suspense fallback={<PageFallback />}>
                      <EducationPage />
                    </Suspense>
                  }
                />
                <Route
                  path="diamond-guide/:topic"
                  element={
                    <Suspense fallback={<PageFallback />}>
                      <EducationPage />
                    </Suspense>
                  }
                />

                {/* Support */}
                <Route
                  path="appointments"
                  element={
                    <Suspense fallback={<PageFallback />}>
                      <AppointmentPage />
                    </Suspense>
                  }
                />
                <Route
                  path="contact"
                  element={
                    <Suspense fallback={<PageFallback />}>
                      <StaticPage key="contact" />
                    </Suspense>
                  }
                />
                <Route
                  path="faq"
                  element={
                    <Suspense fallback={<PageFallback />}>
                      <StaticPage key="faq" />
                    </Suspense>
                  }
                />
                <Route
                  path="shipping-returns"
                  element={
                    <Suspense fallback={<PageFallback />}>
                      <StaticPage key="shipping-returns" />
                    </Suspense>
                  }
                />
                <Route
                  path="our-story"
                  element={
                    <Suspense fallback={<PageFallback />}>
                      <StaticPage key="our-story" />
                    </Suspense>
                  }
                />
                <Route
                  path="privacy"
                  element={
                    <Suspense fallback={<PageFallback />}>
                      <StaticPage key="privacy" />
                    </Suspense>
                  }
                />
                <Route
                  path="terms"
                  element={
                    <Suspense fallback={<PageFallback />}>
                      <StaticPage key="terms" />
                    </Suspense>
                  }
                />

                <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
