"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { ConnectKitProvider } from "connectkit";
import { SessionProvider } from "next-auth/react";
import { wagmiConfig } from "../../lib/wagmi";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 10_000, retry: 2 } },
  }));

  return (
    <SessionProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ConnectKitProvider theme="midnight"
            customTheme={{
              "--ck-font-family": '"DM Sans", sans-serif',
              "--ck-border-radius": "16px",
              "--ck-body-background": "#0d1117",
              "--ck-body-color": "#e6edf3",
              "--ck-primary-button-background": "#14b897",
              "--ck-primary-button-color": "#ffffff",
              "--ck-focus-color": "#14b897",
            }}>
            {children}
          </ConnectKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </SessionProvider>
  );
}