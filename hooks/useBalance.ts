"use client";
import { useQuery } from "@tanstack/react-query";
import { useAccount, useReadContract } from "wagmi";
import { useWalletStore } from "@/store/wallet-store";
import { formatUnits } from "viem";

const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as `0x${string}`;
const ERC20_ABI = [
  { name: "balanceOf", type: "function", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }] },
] as const;

export function useExternalBalance() {
  const { address, isConnected } = useAccount();
  const { data: rawBalance, isLoading, refetch } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 10_000,
    },
  });
  const balance = rawBalance != null
    ? parseFloat(formatUnits(rawBalance as bigint, 6))
    : null;
  return { balance, isLoading, refetch, address };
}

export function useCircleBalance() {
  const { circleWallet } = useWalletStore();
  const address = circleWallet?.address;
  return useQuery({
    queryKey: ["circle-balance", address],
    queryFn: async () => {
      if (!address) return null;
      const res = await fetch(`/api/balance?address=${address}`);
      if (!res.ok) return 0;
      const data = await res.json();
      return data.balance as number;
    },
    enabled: !!address,
    refetchInterval: 15_000,
    staleTime: 5_000,
    placeholderData: 0,
  });
}

export function useActiveBalance() {
  const { walletMode, circleWallet } = useWalletStore();
  const external = useExternalBalance();
  const circle = useCircleBalance();

  if (walletMode === "external") {
    return { balance: external.balance, isLoading: external.isLoading, address: external.address, refetch: external.refetch };
  }
  if (walletMode === "inbuilt") {
    return { balance: circle.data ?? 0, isLoading: circle.isLoading, address: circleWallet?.address ?? null, refetch: circle.refetch };
  }
  return { balance: null, isLoading: false, address: null, refetch: () => {} };
}