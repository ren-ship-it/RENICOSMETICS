/**
 * Vanilla (non-React) tRPC client.
 *
 * Used by fire-and-forget utilities such as analytics tracking and consent
 * recording, where calling React hooks would be awkward. Shares the same router
 * types, transformer and credentials policy as the React client in main.tsx.
 */
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../../../server/routers";

export const trpcVanilla = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, { ...(init ?? {}), credentials: "include" });
      },
    }),
  ],
});
