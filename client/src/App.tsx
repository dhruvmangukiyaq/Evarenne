import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />

            {/* Catalog routes */}
            <Route path="diamonds/:diamondType" element={<CatalogPage />} />
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
