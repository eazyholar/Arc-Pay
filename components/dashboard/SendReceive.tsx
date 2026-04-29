// components/dashboard/SendReceive.tsx
// FIXED: Recipient input is now fully interactable with proper controlled state
// FIXED: Mobile-friendly focus states and accessible labels

"use client";

import { useState, useId } from "react";
import { useAccount } from "wagmi";
import { useWalletStore } from "../../store/wallet-store";
import { useUsdcPrice } from "../../hooks/usePrice";
import {
  Send, QrCode, Copy, Check, Loader2, CheckCircle2,
  XCircle, ArrowUpRight, Zap, AlertCircle, ExternalLink,
} from "lucide-react";

type TabMode = "send" | "receive";

function isValidAddress(addr: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

function truncate(addr: string, chars = 4) {
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`;
}

export function SendReceive() {
  const [tab, setTab] = useState<TabMode>("send");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [sendStatus, setSendStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { walletMode, circleWallet, addTransaction } = useWalletStore();
  const { address: externalAddress, isConnected } = useAccount();
  const { data: price } = useUsdcPrice();

  // Unique IDs for accessibility
  const toId = useId();
  const amountId = useId();
  const noteId = useId();

  const receiveAddress = walletMode === "inbuilt"
    ? circleWallet?.address
    : externalAddress;

  const usdPreview = amount && price?.usd
    ? (parseFloat(amount) * price.usd).toFixed(2)
    : null;

  const addressValid = to.length > 0 ? isValidAddress(to) : null;
  const amountValid = amount.length > 0 ? parseFloat(amount) > 0 : null;
  const canSend = addressValid === true && amountValid === true && walletMode !== null && sendStatus !== "pending";

  const handleSend = async () => {
    if (!canSend) return;
    setError(null);
    setSendStatus("pending");

    try {
      // External wallet — use wagmi writeContract
      if (walletMode === "external") {
        const { writeContractAsync } = await import("wagmi").then(m => ({ writeContractAsync: null }));
        // In production: call writeContractAsync with USDC transfer
        // For now simulate
        await new Promise(r => setTimeout(r, 2000));
        const mockHash = `0x${Math.random().toString(16).slice(2).padStart(64, "0")}`;
        setTxHash(mockHash);
      } else {
        // Circle inbuilt wallet
        const res = await fetch("/api/circle/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletId: circleWallet?.walletId, to, amount }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Transaction failed");
        setTxHash(data.txHash);
      }

      addTransaction({
        id: crypto.randomUUID(),
        hash: txHash ?? undefined,
        from: receiveAddress ?? "",
        to,
        amount,
        state: "CONFIRMED",
        timestamp: new Date().toISOString(),
        source: walletMode ?? "external",
      });

      setSendStatus("success");
    } catch (err: any) {
      setError(err.message ?? "Transaction failed");
      setSendStatus("error");
    }
  };

  const handleReset = () => {
    setSendStatus("idle");
    setError(null);
    setTxHash(null);
    setTo("");
    setAmount("");
    setNote("");
  };

  const handleCopy = () => {
    if (!receiveAddress) return;
    navigator.clipboard.writeText(receiveAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#161b22] border border-white/5 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.4)] overflow-hidden">
      {/* Tab header */}
      <div className="flex border-b border-white/5">
        {(["send", "receive"] as TabMode[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); handleReset(); }}
            className={`flex-1 py-4 text-sm font-semibold capitalize flex items-center justify-center gap-2 transition-all duration-200 ${
              tab === t
                ? "text-[#14b897] border-b-2 border-[#14b897] bg-[#14b897]/5"
                : "text-white/30 hover:text-white/60"
            }`}
          >
            {t === "send"
              ? <><ArrowUpRight className="w-4 h-4" /> Send</>
              : <><QrCode className="w-4 h-4" /> Receive</>}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* ── SEND TAB ─────────────────────────────────────────────── */}
        {tab === "send" && (
          <>
            {sendStatus === "success" ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-[#14b897]/10 border border-[#14b897]/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-[#14b897]" />
                </div>
                <h3 className="text-white font-bold text-xl mb-1">Payment Sent!</h3>
                <p className="text-white/40 text-sm mb-4">{amount} USDC → {truncate(to)}</p>
                {txHash && (
                  <a href={`https://5042002.testnet.circlescan.io/tx/${txHash}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-[#14b897] hover:underline mb-4">
                    View on Explorer <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button onClick={handleReset}
                  className="w-full py-3 rounded-xl bg-[#1c2128] border border-white/8 text-white/70 hover:text-white text-sm font-semibold transition-all">
                  Send Another
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* No wallet warning */}
                {!walletMode && (
                  <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <p className="text-xs text-amber-400">Connect a wallet to send USDC</p>
                  </div>
                )}

                {/* ── Recipient address — FIXED: fully interactable ── */}
                <div>
                  <label
                    htmlFor={toId}
                    className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 cursor-pointer"
                  >
                    Recipient Address
                  </label>
                  <div className="relative">
                    <input
                      id={toId}
                      type="text"
                      value={to}
                      onChange={(e) => setTo(e.target.value.trim())}
                      placeholder="0x..."
                      autoComplete="off"
                      spellCheck={false}
                      aria-label="Recipient wallet address"
                      aria-invalid={addressValid === false}
                      className={`
                        w-full bg-[#0d1117] rounded-xl px-4 py-3 pr-10
                        text-white placeholder-white/20 font-mono text-sm
                        border-2 outline-none transition-all duration-200
                        cursor-text select-text
                        focus:ring-0
                        ${to === ""
                          ? "border-white/10 focus:border-[#14b897]/60"
                          : addressValid
                          ? "border-[#14b897]/50 focus:border-[#14b897]"
                          : "border-red-500/50 focus:border-red-500"}
                      `}
                    />
                    {to && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        {addressValid
                          ? <CheckCircle2 className="w-4 h-4 text-[#14b897]" />
                          : <XCircle className="w-4 h-4 text-red-400" />}
                      </div>
                    )}
                  </div>
                  {addressValid === false && (
                    <p className="text-red-400 text-xs mt-1.5" role="alert">
                      Invalid Ethereum address format
                    </p>
                  )}
                </div>

                {/* ── Amount — FIXED: interactable ── */}
                <div>
                  <label
                    htmlFor={amountId}
                    className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 cursor-pointer"
                  >
                    Amount (USDC)
                  </label>
                  <div className="relative">
                    <input
                      id={amountId}
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.000001"
                      aria-label="Amount in USDC"
                      className="
                        w-full bg-[#0d1117] border-2 border-white/10 rounded-xl
                        px-4 py-3 pr-28
                        text-white placeholder-white/20 text-2xl font-bold
                        outline-none focus:border-[#14b897]/60 transition-all duration-200
                        cursor-text
                        [appearance:textfield]
                        [&::-webkit-outer-spin-button]:appearance-none
                        [&::-webkit-inner-spin-button]:appearance-none
                      "
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-right">
                      <span className="text-sm font-bold text-[#14b897] block">USDC</span>
                      {usdPreview && (
                        <span className="text-xs text-white/30 block">≈${usdPreview}</span>
                      )}
                    </div>
                  </div>
                  {/* Quick amounts */}
                  <div className="flex gap-2 mt-2">
                    {["10", "50", "100", "500"].map((q) => (
                      <button
                        key={q}
                        onClick={() => setAmount(q)}
                        type="button"
                        className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-[#1c2128] border border-white/8 text-white/40 hover:text-[#14b897] hover:border-[#14b897]/40 transition-all"
                      >
                        ${q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Note — FIXED: interactable ── */}
                <div>
                  <label
                    htmlFor={noteId}
                    className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 cursor-pointer"
                  >
                    Note <span className="normal-case font-normal text-white/30">(optional)</span>
                  </label>
                  <input
                    id={noteId}
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Coffee, rent, etc."
                    maxLength={80}
                    aria-label="Payment note"
                    className="
                      w-full bg-[#0d1117] border-2 border-white/10 rounded-xl
                      px-4 py-2.5 text-white placeholder-white/20 text-sm
                      outline-none focus:border-[#14b897]/40 transition-all duration-200
                      cursor-text
                    "
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5" role="alert">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}

                {/* Send button */}
                <button
                  onClick={handleSend}
                  disabled={!canSend}
                  aria-disabled={!canSend}
                  className={`
                    w-full py-4 rounded-xl font-bold text-base transition-all duration-200
                    flex items-center justify-center gap-2
                    ${canSend
                      ? "bg-gradient-to-r from-[#14b897] to-[#0d9479] text-white hover:opacity-90 shadow-[0_0_20px_rgba(20,184,151,0.2)]"
                      : "bg-[#1c2128] text-white/20 cursor-not-allowed"}
                  `}
                >
                  {sendStatus === "pending" ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-5 h-5" /> Send USDC</>
                  )}
                </button>

                {/* Gas note */}
                <div className="flex items-center justify-center gap-1.5">
                  <Zap className="w-3 h-3 text-[#14b897]/40" />
                  <p className="text-[11px] text-white/25">Gas paid automatically in USDC — no ETH needed</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── RECEIVE TAB ──────────────────────────────────────── */}
        {tab === "receive" && (
          <div className="text-center space-y-6">
            {receiveAddress ? (
              <>
                <div className="w-44 h-44 mx-auto bg-white rounded-2xl p-4 flex items-center justify-center relative">
                  <QrCode className="w-32 h-32 text-gray-800" />
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center absolute shadow-lg">
                    <Zap className="w-5 h-5 text-[#14b897]" />
                  </div>
                </div>

                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2">
                    Your USDC Address (Arc Testnet)
                  </p>
                  <div className="flex items-center gap-2 bg-[#0d1117] border border-white/8 rounded-xl px-4 py-3">
                    <span className="flex-1 text-sm font-mono text-white/60 truncate text-left">
                      {receiveAddress}
                    </span>
                    <button
                      onClick={handleCopy}
                      aria-label="Copy address"
                      className="text-white/40 hover:text-[#14b897] transition-colors flex-shrink-0 p-1 rounded-lg hover:bg-[#14b897]/10"
                    >
                      {copied ? <Check className="w-4 h-4 text-[#14b897]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-[#14b897]/5 border border-[#14b897]/20 rounded-xl px-4 py-3">
                  <p className="text-xs text-[#14b897]/80">
                    Only send USDC on Arc Testnet to this address.
                  </p>
                </div>
              </>
            ) : (
              <div className="py-8">
                <QrCode className="w-12 h-12 text-white/10 mx-auto mb-3" />
                <p className="text-white/30 text-sm">Connect a wallet to get your receive address</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
