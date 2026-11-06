import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteFooter, SiteNav } from "@/components/site-nav";

// Dark is the default; visitors who picked light keep their choice.
const THEME_INIT_SCRIPT =
  "try{if(localStorage.getItem('theme')==='light'){document.documentElement.classList.remove('dark')}}catch(e){}";

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-1 items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-pixel text-xl font-semibold text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 font-mono text-sm text-muted-foreground">
          Something went wrong on our end. You can try again or head back home.
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center rounded-md border border-border px-4 py-2 font-mono text-sm text-foreground transition-colors hover:bg-accent"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Vipin V" },
      { name: "description", content: "Personal blog of Vipin V — articles straight from Medium." },
      { property: "og:title", content: "Vipin V" },
      { property: "og:description", content: "Personal blog of Vipin V — articles straight from Medium." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://blog.vipinv.dev/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://blog.vipinv.dev/og-image.jpg" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Silkscreen:wght@400;700&display=swap",
      },
    ],
    scripts: [{ children: THEME_INIT_SCRIPT }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen antialiased">
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
      <div className="flex min-h-screen flex-col overflow-x-clip">
        <SiteNav />
        {/* Full-height side rules framing the content column */}
        <div aria-hidden className="pointer-events-none fixed inset-y-0 left-1/2 -z-10 w-full max-w-3xl -translate-x-1/2 border-x border-border" />
        <main className="flex flex-1 flex-col">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </QueryClientProvider>
  );
}
