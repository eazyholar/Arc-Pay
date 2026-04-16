// src/components/dashboard/TransactionHistory.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { useWalletStore, type TxRecord } from "@/store/wallet-store";
import { truncateAddress, timeAgo, getExplorerTxUrl, cn } from "@/lib/utils";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Receipt,
  RefreshCw,
} from "lucide-react";

function statusIcon(state: TxRecord["state"]) {
  switch (state) {
    case "CONFIRMED": return <CheckCircle2 className="w-3.5 h-3.5 text-arc-400" />;
    case "FAILED": return <XCircle className="w-3.5 h-3.5 text-red-400" />;
    default: return <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />;
  }
}

function TxRow({ tx, myAddress }: { tx: TxRecord; myAddress?: string }) {
  const isSent = myAddress
    ? tx.from.toLowerCase() === myAddress.toLowerCase()
    : tx.source === "inbuilt";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 py-3.5 px-4 hover:bg-white/2 transition-colors rounded-xl group"
    >
      {/* Direction icon */}
      <div className={cn(
        "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
        isSent
          ? "bg-red-500/10 border border-red-500/20"
          : "bg-arc-500/10 border border-arc-500/20"
      )}>
        {isSent
          ? <ArrowUpRight className="w-4 h-4 text-red-400" />
          : <ArrowDownLeft className="w-4 h-4 text-arc-400" />
        }
      </div>

      {/* Address + time */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">
          {isSent ? "Sent to" : "Received from"}{" "}
          <span className="font-mono text-white/60">
            {truncateAddress(isSent ? tx.to : tx.from, 5)}
          </span>
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {statusIcon(tx.state)}
          <span className="text-xs text-white/30 capitalize">
            {tx.state.toLowerCase()}
          </span>
          <span className="text-white/15">·</span>
          <Clock className="w-3 h-3 text-white/20" />
          <span className="text-xs text-white/30">{timeAgo(tx.timestamp)}</span>
        </div>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p className={cn(
          "text-sm font-display font-bold",
          isSent ? "text-red-400" : "text-arc-400"
        )}>
          {isSent ? "−" : "+"}{parseFloat(tx.amount).toFixed(2)} USDC
        </p>
        {tx.hash && (
          <a
            href={getExplorerTxUrl(tx.hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/20 hover:text-arc-400 transition-colors flex items-center justify-end gap-0.5 mt-0.5 opacity-0 group-hover:opacity-100"
          >
            Explorer <ExternalLink className="w-2.5 h-2.5" />
          </a>
        )}
      </div>
    </motion.div>
  );
}

export function TransactionHistory() {
  const { walletMode, circleWallet, transactions } = useWalletStore();
  const { address: externalAddress } = useAccount();

  const myAddress = walletMode === "inbuilt"
    ? circleWallet?.address
    : externalAddress;

  // Also fetch from explorer API
  const { data: explorerTxs, isLoading, refetch } = useQuery({
    queryKey: ["transactions", myAddress],
    queryFn: async () => {
      if (!myAddress) return [];
      const res = await fetch(`/api/transactions?address=${myAddress}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.transactions as TxRecord[];
    },
    enabled: !!myAddress,
    refetchInterval: 30_000,
  });

  // Merge local + explorer transactions, deduplicate by id/hash
  const allTxs = [...transactions];
  if (explorerTxs) {
    for (const eTx of explorerTxs) {
      const exists = allTxs.some(
        (t) => t.id === eTx.id || (eTx.hash && t.hash === eTx.hash)
      );
      if (!exists) allTxs.push(eTx);
    }
  }

  // Sort by timestamp desc
  allTxs.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-surface-2 border border-white/5 rounded-2xl shadow-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-arc-400" />
          <h2 className="text-sm font-bold text-white">Transaction History</h2>
          {allTxs.length > 0 && (
            <span className="text-xs font-semibold bg-arc-500/20 text-arc-400 rounded-full px-2 py-0.5">
              {allTxs.length}
            </span>
          )}
        </div>
        <button
          onClick={() => refetch()}
          className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
        </button>
      </div>

      {/* List */}
      <div className="divide-y divide-white/[0.03] max-h-[420px] overflow-y-auto scrollbar-thin">
        <AnimatePresence initial={false}>
          {allTxs.length > 0 ? (
            allTxs.map((tx) => (
              <TxRow key={tx.id} tx={tx} myAddress={myAddress} />
            ))
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center px-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-surface-3 border border-white/5 flex items-center justify-center mb-3">
                <Receipt className="w-5 h-5 text-white/20" />
              </div>
              <p className="text-white/40 text-sm font-semibold">
                {myAddress ? "No transactions yet" : "Connect a wallet"}
              </p>
              <p className="text-white/20 text-xs mt-1">
                {myAddress
                  ? "Your USDC transfers will appear here"
                  : "to see your transaction history"
                }
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}