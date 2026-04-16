// src/components/dashboard/BalanceCard.tsx
"use client";

import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { useExternalBalance, useCircleBalance } from "../../hooks/useBalance";
import { useUsdcPrice } from "../../hooks/usePrice";
import { useWalletStore } from "@/store/wallet-store";
import { formatUsdc, formatUsd, truncateAddress, getExplorerAddressUrl, cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ExternalLink,
  Shield,
  Wallet,
  Zap,
} from "lucide-react";

export function BalanceCard() {
  const { walletMode, circleWallet } = useWalletStore();
  const { address: externalAddress } = useAccount();

  const external = useExternalBalance();
  const circle = useCircleBalance();
  const { data: price } = useUsdcPrice();

  // Pick the right data source
  const isExternal = walletMode === "external";
  const balance = isExternal ? external.balance : circle.data ?? null;
  const isLoading = isExternal ? external.isLoading : circle.isLoading;
  const refetch = isExternal ? external.refetch : circle.refetch;
  const displayAddress = isExternal ? externalAddress : circleWallet?.address;

  const usdValue = balance != null && price ? balance * price.usd : null;
  const priceChange = price?.usd_24h_change ?? 0;
  const isPositive = priceChange >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl bg-arc-gradient p-px shadow-arc-glow"
    >
      <div className="relative rounded-[15px] bg-surface-1 overflow-hidden">
        {/* Subtle mesh background */}
        <div className="absolute inset-0 bg-card-gradient" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-arc-500/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                isExternal ? "bg-blue-500/20 border border-blue-500/30" : "bg-arc-gradient"
              )}>
                {isExternal
                  ? <Wallet className="w-4 h-4 text-blue-400" />
                  : <Shield className="w-4 h-4 text-white" />
                }
              </div>
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                  {isExternal ? "External Wallet" : "ArcPay Wallet"}
                </p>
                {displayAddress && (
                  <a
                    href={getExplorerAddressUrl(displayAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-white/30 hover:text-arc-400 transition-colors font-mono"
                  >
                    {truncateAddress(displayAddress)}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>

            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all"
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </button>
          </div>

          {/* Balance display */}
          <div className="mb-6">
            {isLoading && balance == null ? (
              <div className="space-y-2">
                <div className="h-10 w-48 bg-white/5 rounded-lg animate-pulse" />
                <div className="h-5 w-32 bg-white/5 rounded-lg animate-pulse" />
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-display font-bold text-white tracking-tight">
                    {balance != null ? formatUsdc(BigInt(Math.floor(balance * 1e6))) : "—"}
                  </span>
                  <span className="text-xl font-semibold text-arc-400">USDC</span>
                </div>
                {usdValue != null && (
                  <p className="text-white/40 text-sm mt-1.5">
                    ≈ {formatUsd(usdValue)} USD
                  </p>
                )}
              </>
            )}
          </div>

          {/* Price info */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg",
                isPositive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              )}>
                {isPositive
                  ? <TrendingUp className="w-3 h-3" />
                  : <TrendingDown className="w-3 h-3" />
                }
                {isPositive ? "+" : ""}{priceChange.toFixed(3)}% (24h)
              </div>
              <span className="text-xs text-white/30">
                1 USDC = {price?.usd?.toFixed(4) ?? "1.0000"} USD
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-arc-400/60 font-mono">
              <Zap className="w-3 h-3" />
              Gas in USDC
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}