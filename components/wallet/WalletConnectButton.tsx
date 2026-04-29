// components/wallet/WalletConnectButton.tsx
// Fixed wallet connection — properly reads isConnected from Wagmi
// Shows address + disconnect when connected, connect button when not

"use client";

import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { useWalletStore } from "../../store/wallet-store";
import { arcTestnet } from "../../lib/wagmi";
import { useState } from "react";
import { LogOut, ExternalLink, Copy, Check, ChevronDown, Wallet } from "lucide-react";

function truncate(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function WalletConnectButton() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const { setWalletMode, walletMode } = useWalletStore();
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isWrongNetwork = isConnected && chain?.id !== arcTestnet.id;

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchChainAsync({ chainId: arcTestnet.id });
    } catch (err) {
      console.error("Failed to switch network:", err);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setWalletMode(null);
    setDropdownOpen(false);
  };

  // ── Wrong network warning ──────────────────────────────────────────────────
  if (isWrongNetwork) {
    return (
      <button
        onClick={handleSwitchNetwork}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
      >
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-amber-400 text-sm font-semibold">Wrong Network</span>
      </button>
    );
  }

  // ── Connected state ────────────────────────────────────────────────────────
  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#1c2128] border border-white/8 hover:border-[#14b897]/40 transition-all"
        >
          <div className="w-2 h-2 rounded-full bg-[#14b897]" />
          <span className="text-sm font-mono text-white/80">{truncate(address)}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-64 z-50 bg-[#161b22] border border-white/8 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1">Connected Wallet</p>
                <p className="text-sm font-mono text-white/70 truncate">{address}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#14b897]" />
                  <span className="text-[10px] text-[#14b897]/70">Arc Testnet</span>
                </div>
              </div>

              <div className="p-2">
                <button onClick={handleCopy}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-left transition-colors">
                  {copied ? <Check className="w-4 h-4 text-[#14b897]" /> : <Copy className="w-4 h-4 text-white/40" />}
                  <span className="text-sm text-white/70">{copied ? "Copied!" : "Copy Address"}</span>
                </button>

                <a href={`https://5042002.testnet.circlescan.io/address/${address}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-left transition-colors">
                  <ExternalLink className="w-4 h-4 text-white/40" />
                  <span className="text-sm text-white/70">View on Explorer</span>
                </a>

                <button onClick={handleDisconnect}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-left transition-colors mt-1 border-t border-white/5 pt-3">
                  <LogOut className="w-4 h-4 text-red-400/70" />
                  <span className="text-sm text-red-400/70">Disconnect</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Disconnected state — use ConnectKit ───────────────────────────────────
  return (
    <ConnectKitButton.Custom>
      {({ isConnecting, show }) => (
        <button
          onClick={() => {
            show?.();
            setWalletMode("external");
          }}
          disabled={isConnecting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1c2128] border border-white/8 hover:border-[#14b897]/40 hover:bg-[#14b897]/5 transition-all text-sm font-semibold text-white/70 hover:text-white disabled:opacity-50"
        >
          <Wallet className="w-4 h-4" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
    </ConnectKitButton.Custom>
  );
}
