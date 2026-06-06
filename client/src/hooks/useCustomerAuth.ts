/**
 * Customer authentication state for the storefront. Reads the current customer
 * via the first-party session cookie. Separate from the admin `useAuth`.
 */
import { trpc } from "@/lib/trpc";

export function useCustomerAuth() {
  const { data, isLoading, refetch } = trpc.customerAuth.me.useQuery(undefined, {
    retry: false,
    staleTime: 60_000,
  });
  return {
    customer: data ?? null,
    isAuthenticated: !!data,
    isLoading,
    refetch,
  };
}
