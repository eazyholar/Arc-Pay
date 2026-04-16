"use client";
import { useQuery } from "@tanstack/react-query";

export function useUsdcPrice() {
  return useQuery({
    queryKey: ["usdc-price"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/price");
        if (!res.ok) throw new Error("Price fetch failed");
        return res.json();
      } catch {
        return { usd: 1.0, usd_24h_change: 0, last_updated_at: Date.now() };
      }
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
    placeholderData: { usd: 1.0, usd_24h_change: 0, last_updated_at: Date.now() },
  });
}