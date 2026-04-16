// src/components/dashboard/SendReceive.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSendTransaction } from "../../hooks/useSendTransaction";
import { useUsdcPrice } from "../../hooks/usePrice";
import { useWalletStore } from "../../store/wallet-store";
import { isValidAddress, cn, getExplorerTxUrl, truncateAddress } from "@/lib/utils";
import {
  Send,
  QrCode,
  Copy,
  Check,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Zap,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useAccount } from "wagmi";

type TabMode = "send" | "receive";

export function SendReceive() {
  const [tab, setTab] = useState<TabMode>("send");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  const { send, status, error, result, reset } = useSendTransaction();
  const { walletMode, circleWallet } = useWalletStore();
  const { address: externalAddress } = useAccount();
  const { data: price } = useUsdcPrice();

  const receiveAddress = walletMode === "inbuilt"
    ? circleWallet?.address
    : externalAddress;

  const usdPreview = amount && price
    ? (parseFloat(amount) * price.usd).toFixed(2)
    : null;

  const isAddressValid = to ? isValidAddress(to) : null;
  const canSend =
    status === "idle" || status === "failed"
      ? isValidAddress(to) && parseFloat(amount) > 0 && walletMode !== null
      : false;

  const handleSend = async () => {
    if (!canSend) return;
    try {
      await send({ to, amount, note });
    } catch {
      // Error handled in hook state
    }
  };

  const handleReset = () => {
    reset();
    setTo("");
    setAmount("");
    setNote("");
  };

  const copyReceiveAddress = () => {
    if (!receiveAddress) return;
    navigator.clipboard.writeText(receiveAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-surface-2 border border-white/5 rounded-2xl shadow-card overflow-hidden"
    >
      {/* Tab header */}
      <div className="flex border-b border-white/5">
        {(["send", "receive"] as TabMode[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); reset(); }}
            className={cn(
              "flex-1 py-4 text-sm font-semibold capitalize flex items-center justify-center gap-2 transition-all duration-200",
              tab === t
                ? "text-arc-400 border-b-2 border-arc-500 bg-arc-500/5"
                : "text-white/30 hover:text-white/60"
            )}
          >
            {t === "send"
              ? <><ArrowUpRight className="w-4 h-4" /> Send</>
              : <><QrCode className="w-4 h-4" /> Receive</>
            }
          </button>
        ))}
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">

          {/* ── SEND TAB ────────────────────────────────────────────────── */}
          {tab === "send" && (
            <motion.div
              key="send"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Success state */}
              {status === "submitted" || status === "confirmed" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="w-16 h-16 bg-arc-500/10 border border-arc-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-arc-400" />
                  </div>
                  <h3 className="text-white font-display font-bold text-xl mb-1">
                    {status === "confirmed" ? "Confirmed!" : "Submitted!"}
                  </h3>
                  <p className="text-white/40 text-sm mb-4">
                    {amount} USDC → {truncateAddress(to)}
                  </p>
                  {result?.txHash && (
                    <a
                      href={getExplorerTxUrl(result.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-arc-400 hover:text-arc-300 transition-colors mb-4"
                    >
                      View on Explorer
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={handleReset}
                    className="w-full py-3 rounded-xl bg-surface-3 border border-white/8 text-white/70 hover:text-white text-sm font-semibold transition-all"
                  >
                    Send Another
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {/* Wallet mode warning */}
                  {!walletMode && (
                    <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <p className="text-xs text-amber-400">Connect a wallet to send</p>
                    </div>
                  )}

                  {/* Recipient */}
                  <div>
                    <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                      Recipient Address
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={to}
                        onChange={(e) => setTo(e.target.value.trim())}
                        placeholder="0x..."
                        className={cn(
                          "w-full bg-surface-3 border rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none transition-all text-sm font-mono",
                          to === ""
                            ? "border-white/8 focus:border-arc-500/40 focus:ring-1 focus:ring-arc-500/20"
                            : isAddressValid
                            ? "border-arc-500/40 ring-1 ring-arc-500/20"
                            : "border-red-500/40 ring-1 ring-red-500/20"
                        )}
                      />
                      {to && (
                        <div className={cn(
                          "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center",
                        )}>
                          {isAddressValid
                            ? <CheckCircle2 className="w-4 h-4 text-arc-400" />
                            : <XCircle className="w-4 h-4 text-red-400" />
                          }
                        </div>
                      )}
                    </div>
                    {to && !isAddressValid && (
                      <p className="text-red-400 text-xs mt-1.5">Invalid address format</p>
                    )}
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                      Amount (USDC)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.000001"
                        className="w-full bg-surface-3 border border-white/8 rounded-xl px-4 py-3 pr-24 text-white placeholder-white/20 focus:outline-none focus:border-arc-500/40 focus:ring-1 focus:ring-arc-500/20 transition-all text-2xl font-display font-bold"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-end">
                        <span className="text-sm font-bold text-arc-400">USDC</span>
                        {usdPreview && (
                          <span className="text-xs text-white/30">≈ ${usdPreview}</span>
                        )}
                      </div>
                    </div>

                    {/* Quick amounts */}
                    <div className="flex gap-2 mt-2">
                      {["10", "50", "100", "500"].map((q) => (
                        <button
                          key={q}
                          onClick={() => setAmount(q)}
                          className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-surface-3 border border-white/8 text-white/40 hover:text-arc-400 hover:border-arc-500/40 transition-all"
                        >
                          ${q}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Note (optional) */}
                  <div>
                    <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                      Note <span className="normal-case font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Coffee, rent, etc."
                      maxLength={80}
                      className="w-full bg-surface-3 border border-white/8 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-arc-500/40 transition-all text-sm"
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-400">{error}</p>
                    </div>
                  )}

                  {/* One-Click Send button */}
                  <button
                    onClick={handleSend}
                    disabled={!canSend || status === "pending"}
                    className={cn(
                      "w-full py-4 rounded-xl font-display font-bold text-base transition-all duration-200 flex items-center justify-center gap-2",
                      canSend && status !== "pending"
                        ? "bg-arc-gradient text-white shadow-arc-glow-sm hover:opacity-90 hover:shadow-arc-glow"
                        : "bg-surface-3 text-white/20 cursor-not-allowed"
                    )}
                  >
                    {status === "pending" ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {walletMode === "inbuilt" ? "Sending via Circle..." : "Confirm in Wallet..."}
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send USDC
                      </>
                    )}
                  </button>

                  {/* USDC-as-gas note */}
                  <div className="flex items-center justify-center gap-1.5">
                    <Zap className="w-3 h-3 text-arc-500/60" />
                    <p className="text-[11px] text-white/25 text-center">
                      Gas is paid automatically in USDC — no ETH needed
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── RECEIVE TAB ──────────────────────────────────────────────── */}
          {tab === "receive" && (
            <motion.div
              key="receive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-center space-y-6"
            >
              {receiveAddress ? (
                <>
                  {/* Stylized QR placeholder */}
                  <div className="w-48 h-48 mx-auto bg-white rounded-2xl p-4 flex items-center justify-center relative">
                    <div className="absolute inset-4 grid grid-cols-7 grid-rows-7 gap-0.5 opacity-90">
                      {/* Simplified QR pattern for demo */}
                      {Array.from({ length: 49 }).map((_, i) => {
                        const isCorner =
                          (i < 3 && (Math.floor(i / 7) < 1 || i % 7 < 3)) ||
                          (i > 45 && i % 7 > 3);
                        const isFilled = isCorner || Math.random() > 0.5;
                        return (
                          <div
                            key={i}
                            className={cn(
                              "rounded-sm",
                              isFilled ? "bg-gray-900" : "bg-transparent"
                            )}
                          />
                        );
                      })}
                    </div>
                    <QrCode className="w-32 h-32 text-gray-800 absolute" />
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center z-10 shadow-lg">
                      <Zap className="w-5 h-5 text-arc-600" />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2">
                      Your USDC Address (Arc Testnet)
                    </p>
                    <div className="flex items-center gap-2 bg-surface-3 border border-white/8 rounded-xl px-4 py-3">
                      <span className="flex-1 text-sm font-mono text-white/70 truncate">
                        {receiveAddress}
                      </span>
                      <button
                        onClick={copyReceiveAddress}
                        className="text-white/40 hover:text-arc-400 transition-colors flex-shrink-0"
                      >
                        {copied
                          ? <Check className="w-4 h-4 text-arc-400" />
                          : <Copy className="w-4 h-4" />
                        }
                      </button>
                    </div>
                  </div>

                  <div className="bg-arc-500/5 border border-arc-500/20 rounded-xl px-4 py-3">
                    <p className="text-xs text-arc-400/80 text-center">
                      Share this address to receive USDC on Arc Testnet.
                      Only send USDC — this is not an Ethereum mainnet address.
                    </p>
                  </div>
                </>
              ) : (
                <div className="py-8">
                  <QrCode className="w-12 h-12 text-white/10 mx-auto mb-3" />
                  <p className="text-white/30 text-sm">
                    Connect a wallet to get your receive address
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}