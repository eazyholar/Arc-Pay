"use client";
import { useState } from "react";
import { useWalletStore } from "../../store/wallet-store";
import { Zap, Mail, Lock, User, ArrowRight, Loader2, Shield } from "lucide-react";

type AuthMode = "login" | "signup";

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, setCircleWallet, setWalletMode } = useWalletStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      const userId = `user_${Date.now()}`;
      const mockUser = {
        id: userId,
        email,
        name: mode === "signup" ? name : email.split("@")[0],
        createdAt: new Date().toISOString(),
      };
      if (mode === "signup") {
        const res = await fetch("/api/circle/create-wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        if (!res.ok) throw new Error("Failed to create wallet");
        const wallet = await res.json();
        login(mockUser);
        setCircleWallet({ walletId: wallet.id, address: wallet.address, blockchain: wallet.blockchain });
        setWalletMode("inbuilt");
      } else {
        login(mockUser);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c10] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(20,184,151,0.15),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `linear-gradient(rgba(20,184,151,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,151,0.5) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#14b897] to-[#0d9479] mb-4 shadow-[0_0_40px_rgba(20,184,151,0.3)]">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">ArcPay</h1>
          <p className="text-[#14b897] text-sm mt-1 font-mono">Powered by Arc Blockchain · Circle</p>
        </div>

        <div className="bg-[#161b22] border border-white/5 rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <div className="flex border-b border-white/5">
            {(["login", "signup"] as AuthMode[]).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-4 text-sm font-semibold capitalize transition-all ${mode === m ? "text-[#14b897] border-b-2 border-[#14b897] bg-[#14b897]/5" : "text-white/40 hover:text-white/60"}`}>
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Satoshi Nakamoto" required={mode === "signup"}
                    className="w-full bg-[#1c2128] border border-white/8 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#14b897]/50 text-sm" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="w-full bg-[#1c2128] border border-white/8 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#14b897]/50 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full bg-[#1c2128] border border-white/8 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#14b897]/50 text-sm" />
              </div>
            </div>
            {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</div>}
            <button type="submit" disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#14b897] to-[#0d9479] hover:opacity-90 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-base">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>{mode === "signup" ? "Create Account & Wallet" : "Sign In"}</span><ArrowRight className="w-4 h-4" /></>}
            </button>
            {mode === "signup" && (
              <div className="flex items-start gap-2 bg-[#14b897]/5 border border-[#14b897]/20 rounded-xl p-3">
                <Shield className="w-4 h-4 text-[#14b897] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-white/50">A <span className="text-[#14b897] font-semibold">Circle Developer Wallet</span> will be automatically created for you.</p>
              </div>
            )}
          </form>
        </div>
        <p className="text-center text-white/20 text-xs mt-6">Arc Testnet · Chain ID 5042002 · Gas paid in USDC</p>
      </div>
    </div>
  );
}