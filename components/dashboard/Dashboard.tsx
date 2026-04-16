"use client";
import { useWalletStore } from "../../store/wallet-store";
import { Zap, LogOut } from "lucide-react";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { BalanceCard } from "./BalanceCard";
import { SendReceive } from "./SendReceive";
import { TransactionHistory } from "./TransactionHistory";

export function Dashboard() {
  const { user, logout, walletMode } = useWalletStore();
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-[#080c10] text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-[#080c10]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#14b897] to-[#0d9479] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-lg">ArcPay</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#14b897]" />
                <span className="text-[10px] text-[#14b897]/60 font-mono">Arc Testnet</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ConnectKitButton />
            {user && (
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Welcome */}
        <div className="bg-[#161b22] border border-white/5 rounded-2xl p-5">
          <p className="text-white font-bold text-lg">
            Welcome, {user?.name}! 👋
          </p>
          <p className="text-white/40 text-sm mt-1">
            {walletMode === "inbuilt"
              ? "Using your Circle-powered ArcPay wallet"
              : isConnected
              ? "Using your external wallet"
              : "Connect a wallet to get started"}
          </p>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left — Balance + Send/Receive */}
          <div className="lg:col-span-3 space-y-6">
            <BalanceCard />
            <SendReceive />
          </div>

          {/* Right — Transaction History */}
          <div className="lg:col-span-2">
            <TransactionHistory />
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/15 text-xs pb-8">
          ArcPay · Arc Testnet · Chain 5042002 · Gas paid in USDC
        </p>
      </main>
    </div>
  );
}