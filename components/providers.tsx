"use client";

import { type ReactNode, useCallback, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAccessToken, useAuth } from "@workos-inc/authkit-nextjs/components";
import { ConvexReactClient, ConvexProviderWithAuth } from "convex/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { publicEnv } from "@/lib/public-env";

function useAuthFromWorkOS() {
  const { user, loading } = useAuth();
  const { getAccessToken, refresh } = useAccessToken();

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (!user) {
        return null;
      }

      try {
        if (forceRefreshToken) {
          return (await refresh()) ?? null;
        }

        return (await getAccessToken()) ?? null;
      } catch (error) {
        console.error("Failed to retrieve WorkOS access token for Convex", error);
        return null;
      }
    },
    [getAccessToken, refresh, user],
  );

  return {
    isAuthenticated: Boolean(user),
    isLoading: loading,
    fetchAccessToken,
  };
}

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      {children}
      <Toaster position="top-right" richColors />
    </TooltipProvider>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [convex] = useState(
    () => new ConvexReactClient(publicEnv().NEXT_PUBLIC_CONVEX_URL),
  );
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ConvexProviderWithAuth client={convex} useAuth={useAuthFromWorkOS}>
        {children}
      </ConvexProviderWithAuth>
    </QueryClientProvider>
  );
}
