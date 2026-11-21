import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  // One client per request: a module-level QueryClient leaks cached data between SSR requests.
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Lets Query own freshness; set caching defaults on the QueryClient, not the router.
    defaultPreloadStaleTime: 0,
    // Plain string search params (?doctor=abc) so pages can read them with URLSearchParams.
    parseSearch: (search: string) => Object.fromEntries(new URLSearchParams(search)),
    stringifySearch: (obj: Record<string, unknown>) => {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(obj || {})) {
        if (v === undefined || v === null || v === "") continue;
        params.set(k, typeof v === "string" ? v : JSON.stringify(v));
      }
      const qs = params.toString();
      return qs ? `?${qs}` : "";
    },
  });

  return router;
};
