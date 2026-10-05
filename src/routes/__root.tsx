import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
// @ts-expect-error - plain JSX component
import Layout from "../components/Layout/Layout";
// @ts-expect-error - plain JSX component
import { AuthProvider } from "../login-view/AuthContext";

function NotFoundComponent() {
  return (
    <div className="container" style={{ padding: "120px 24px", textAlign: "center" }}>
      <h1 style={{ fontSize: "4rem" }}>404</h1>
      <h2 style={{ marginTop: 12, fontSize: "1.25rem" }}>Page not found</h2>
      <p style={{ marginTop: 12, color: "var(--muted)" }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={{ marginTop: 24 }}>
        <Link to="/">Go home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="container" style={{ padding: "120px 24px", textAlign: "center" }}>
      <h1 style={{ fontSize: "1.5rem" }}>This page didn't load</h1>
      <p style={{ marginTop: 12, color: "var(--muted)" }}>
        Something went wrong on our end. You can try refreshing or head back home.
      </p>
      <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center" }}>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
        >
          Try again
        </button>
        <a href="/">Go home</a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: "Colabify" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
      { rel: "icon", href: "/digital-skills-house.png?v=20", type: "image/png" },
      { rel: "icon", href: "/favicon-32x32.png?v=20", sizes: "32x32", type: "image/png" },
      { rel: "icon", href: "/favicon-16x16.png?v=20", sizes: "16x16", type: "image/png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=20", sizes: "180x180" },
      { rel: "shortcut icon", href: "/favicon.ico?v=20" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Layout>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </Layout>
      </AuthProvider>
    </QueryClientProvider>
  );
}
