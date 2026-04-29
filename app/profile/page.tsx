// app/profile/page.tsx
// User profile management — tabbed layout for Profile + Wallet Security

"use client";

import { useState, useEffect } from "react";
import { useWalletStore } from "../../store/wallet-store";
import { useAccount, useDisconnect } from "wagmi";
import {
  User, Shield, Save, Loader2, CheckCircle2,
  Wallet, ExternalLink, Copy, Check, LogOut,
  Bell, Eye, EyeOff, Zap, ArrowLeft,
} from "lucide-react";
import Link from "next/link";

type Tab = "profile" | "security";

interface ProfileData {
  displayName: string;
  bio: string;
  notificationsEnabled: boolean;
}

function truncate(addr: string) {
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<ProfileData>({
    displayName: "",
    bio: "",
    notificationsEnabled: true,
  });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const { user, logout, circleWallet, walletMode } = useWalletStore();
  const { address: externalAddress, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const activeAddress = walletMode === "inbuilt" ? circleWallet?.address : externalAddress;

  // Load profile on mount
  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/profile?userId=${user.id}`)
      .then(r => r.json())
      .then(data => {
        setProfile({
          displayName: data.displayName ?? user.name ?? "",
          bio: data.bio ?? "",
          notificationsEnabled: data.notificationsEnabled ?? true,
        });
      })
      .catch(() => {
        setProfile(p => ({ ...p, displayName: user.name ?? "" }));
      });
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaveStatus("saving");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ...profile }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleCopy = () => {
    if (!activeAddress) return;
    navigator.clipboard.writeText(activeAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDisconnectAll = () => {
    disconnect();
    logout();
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile Settings", icon: <User className="w-4 h-4" /> },
    { id: "security", label: "Wallet Security", icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#080c10] text-white">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(20,184,151,0.06),transparent_60%)] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#080c10]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#14b897] to-[#0d9479] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">ArcPay</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex items-start gap-5 mb-8">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#14b897] to-[#0d9479] flex items-center justify-center flex-shrink-0 text-2xl font-bold text-white shadow-[0_0_30px_rgba(20,184,151,0.3)]">
            {(profile.displayName || user?.name || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {profile.displayName || user?.name || "Your Profile"}
            </h1>
            <p className="text-white/40 text-sm mt-0.5">{user?.email}</p>
            {activeAddress && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#14b897]" />
                <span className="text-xs font-mono text-[#14b897]/70">{truncate(activeAddress)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-[#0d1117] p-1.5 rounded-2xl border border-white/5 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-[#14b897] text-white shadow-[0_0_20px_rgba(20,184,151,0.2)]"
                  : "text-white/40 hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ──────────────────────────────────────── */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main form */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-6">
                <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-5">Personal Info</h2>

                <div className="space-y-4">
                  {/* Display Name */}
                  <div>
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={profile.displayName}
                      onChange={(e) => setProfile(p => ({ ...p, displayName: e.target.value }))}
                      placeholder="Your name"
                      className="w-full bg-[#161b22] border-2 border-white/8 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none focus:border-[#14b897]/50 transition-all cursor-text"
                    />
                  </div>

                  {/* Email (read-only from auth) */}
                  <div>
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                      Email <span className="normal-case font-normal text-white/25">(from your auth provider)</span>
                    </label>
                    <input
                      type="email"
                      value={user?.email ?? ""}
                      readOnly
                      className="w-full bg-[#161b22]/50 border-2 border-white/5 rounded-xl px-4 py-3 text-white/40 text-sm cursor-not-allowed"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                      Bio <span className="normal-case font-normal text-white/25">(optional)</span>
                    </label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      maxLength={200}
                      className="w-full bg-[#161b22] border-2 border-white/8 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none focus:border-[#14b897]/50 transition-all resize-none cursor-text"
                    />
                    <p className="text-white/20 text-xs mt-1 text-right">{profile.bio.length}/200</p>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-6">
                <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">Notifications</h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-[#14b897]" />
                    <div>
                      <p className="text-sm font-semibold text-white">Payment Notifications</p>
                      <p className="text-xs text-white/40">Get notified when you receive USDC</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setProfile(p => ({ ...p, notificationsEnabled: !p.notificationsEnabled }))}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 ${profile.notificationsEnabled ? "bg-[#14b897]" : "bg-white/10"}`}
                    role="switch"
                    aria-checked={profile.notificationsEnabled}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${profile.notificationsEnabled ? "left-7" : "left-1"}`} />
                  </button>
                </div>
              </div>

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={saveStatus === "saving"}
                className={`w-full py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
                  saveStatus === "saved"
                    ? "bg-green-500/20 border border-green-500/30 text-green-400"
                    : saveStatus === "error"
                    ? "bg-red-500/20 border border-red-500/30 text-red-400"
                    : "bg-gradient-to-r from-[#14b897] to-[#0d9479] text-white hover:opacity-90"
                }`}
              >
                {saveStatus === "saving" ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                ) : saveStatus === "saved" ? (
                  <><CheckCircle2 className="w-5 h-5" /> Saved!</>
                ) : saveStatus === "error" ? (
                  "Failed to save — try again"
                ) : (
                  <><Save className="w-5 h-5" /> Save Changes</>
                )}
              </button>
            </div>

            {/* Side stats */}
            <div className="space-y-4">
              <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-5">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Account Info</h3>
                <div className="space-y-3">
                  {[
                    { label: "Member since", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Today" },
                    { label: "Auth Provider", value: "Email / OAuth" },
                    { label: "Network", value: "Arc Testnet" },
                    { label: "Chain ID", value: "5042002" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-xs text-white/40">{item.label}</span>
                      <span className="text-xs font-semibold text-white/70">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#14b897]/5 border border-[#14b897]/15 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-[#14b897]" />
                  <p className="text-xs font-bold text-[#14b897]">Gas in USDC</p>
                </div>
                <p className="text-xs text-white/40 leading-relaxed">
                  On Arc Testnet, gas fees are paid in USDC. No ETH needed!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── SECURITY TAB ──────────────────────────────────────── */}
        {activeTab === "security" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              {/* Circle Wallet */}
              {circleWallet && (
                <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#14b897] to-[#0d9479] flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-white">ArcPay Wallet</h2>
                      <p className="text-xs text-[#14b897]">Circle Developer-Controlled · No Seed Phrase</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-white/40 mb-1.5 uppercase tracking-wider font-semibold">Wallet Address</p>
                      <div className="flex items-center gap-2 bg-[#161b22] border border-white/5 rounded-xl px-4 py-3">
                        <span className="flex-1 font-mono text-xs text-white/60 truncate">{circleWallet.address}</span>
                        <button onClick={handleCopy} className="text-white/40 hover:text-[#14b897] transition-colors flex-shrink-0">
                          {copied ? <Check className="w-4 h-4 text-[#14b897]" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <a href={`https://5042002.testnet.circlescan.io/address/${circleWallet.address}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-white/40 hover:text-[#14b897] transition-colors flex-shrink-0">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-white/40 mb-1.5 uppercase tracking-wider font-semibold">Wallet ID</p>
                      <div className="flex items-center gap-2 bg-[#161b22] border border-white/5 rounded-xl px-4 py-3">
                        <span className="flex-1 font-mono text-xs text-white/40 truncate">
                          {showSecret ? circleWallet.walletId : "••••••••••••••••••••"}
                        </span>
                        <button onClick={() => setShowSecret(!showSecret)}
                          className="text-white/40 hover:text-white/60 transition-colors flex-shrink-0">
                          {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-[#14b897]/5 border border-[#14b897]/15 rounded-xl">
                    <p className="text-xs text-[#14b897]/80">
                      🔒 Your wallet is secured by Circle's infrastructure. No seed phrase means no risk of losing it.
                    </p>
                  </div>
                </div>
              )}

              {/* External wallet */}
              <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white">External Wallet</h2>
                    <p className="text-xs text-blue-400">MetaMask / Rabby</p>
                  </div>
                </div>

                {isConnected && externalAddress ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 bg-[#161b22] border border-white/5 rounded-xl px-4 py-3">
                      <span className="flex-1 font-mono text-xs text-white/60 truncate">{externalAddress}</span>
                      <a href={`https://5042002.testnet.circlescan.io/address/${externalAddress}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-white/40 hover:text-blue-400 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <button onClick={() => disconnect()}
                      className="w-full py-3 rounded-xl border border-red-500/20 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 text-sm font-semibold transition-all flex items-center justify-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Disconnect Wallet
                    </button>
                  </div>
                ) : (
                  <p className="text-white/30 text-sm">No external wallet connected.</p>
                )}
              </div>

              {/* Danger zone */}
              <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-6">
                <h2 className="text-sm font-bold text-red-400 mb-4">Danger Zone</h2>
                <button
                  onClick={handleDisconnectAll}
                  className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out & Disconnect Everything
                </button>
                <p className="text-xs text-red-400/40 text-center mt-2">
                  This will disconnect all wallets and sign you out
                </p>
              </div>
            </div>

            {/* Security tips */}
            <div className="space-y-4">
              <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-5">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Security Tips</h3>
                <div className="space-y-4">
                  {[
                    { icon: "🔐", tip: "Never share your wallet ID or session tokens" },
                    { icon: "⚡", tip: "Gas is paid in USDC on Arc — no ETH needed" },
                    { icon: "🌐", tip: "Always verify you're on Arc Testnet (5042002)" },
                    { icon: "🚨", tip: "ArcPay will never ask for your seed phrase" },
                  ].map((item) => (
                    <div key={item.tip} className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0">{item.icon}</span>
                      <p className="text-xs text-white/50 leading-relaxed">{item.tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
