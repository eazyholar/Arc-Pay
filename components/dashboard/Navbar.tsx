// src/components/dashboard/Navbar.tsx
"use client";

import { motion } from "framer-motion";
import { useWalletStore } from "@/store/wallet-store";
import { WalletSwitcher } from "@/components/wallet/WalletSwitcher";
import { Zap, LogOut, Bell } from "lucide-react";

export function Navbar() {
  const { user, logout, walletMode } = useWalletStore();

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-30 bg-surface-0/80 backdrop-blur-xl border-b border-white/5"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-arc-gradient flex items-center justify-center shadow-arc-glow-sm">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-white font-display font-bold text-lg leading-none">
              ArcPay
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-arc-400 animate-pulse-slow" />
              <span className="text-[10px] text-arc-400/60 font-mono">
                Arc Testnet
              </span>
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Network badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-3 border border-white/8">
            <div className="w-1.5 h-1.5 rounded-full bg-arc-400" />
            <span className="text-xs font-mono text-white/50">5042002</span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all">
            <Bell className="w-4 h-4" />
          </button>

          {/* Wallet switcher */}
          <WalletSwitcher />

          {/* User / logout */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 border-l border-white/8 pl-3">
              <div className="w-8 h-8 rounded-full bg-arc-gradient flex items-center justify-center text-xs font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}