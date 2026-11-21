import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster as SonnerToaster } from "sonner";
import { Toaster } from "@/components/ui/toaster";
import PageNotFound from "@/lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { LanguageProvider } from "@/lib/i18n";
import { CartProvider } from "@/lib/CartContext";
import { FlyToCartProvider } from "@/lib/flyToCart";
import SabinaAssistant from "@/components/sabina/SabinaAssistant";

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Mizher Medical Hub | مزهر الطبي" },
      { name: "description", content: "Jordan's trusted healthcare platform — connect with top doctors, hospitals, and medical tourism packages." },
      { name: "author", content: "Mizher Medical Hub" },
      { property: "og:title", content: "Mizher Medical Hub | مزهر الطبي" },
      { property: "og:description", content: "Jordan's trusted healthcare platform — connect with top doctors, hospitals, and medical tourism packages." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: PageNotFound,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <CartProvider>
            <FlyToCartProvider>
              <AuthGate>
                {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
                <Outlet />
              </AuthGate>
              {/* Sabina — the site's AI doctor-assistant, on every page */}
              <SabinaAssistant />
              <Toaster />
              <SonnerToaster richColors position="top-center" />
            </FlyToCartProvider>
          </CartProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

function AuthGate({ children }: { children: ReactNode }) {
  const { isLoadingAuth } = useAuth();
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-teal-200 border-t-teal-500 rounded-full animate-spin"></div>
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
