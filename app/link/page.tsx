"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useWalletStore } from "../../store/wallet-store";
import { Zap, Shield, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function LinkPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const discordUsername = searchParams.get("discord");

  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [message, setMessage] = useState("");
  const { circleWallet, user, isAuthenticated } = useWalletStore();

  const handleLink = async () => {
    if (!code || !circleWallet) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/discord/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          walletId: circleWallet.walletId,
          walletAddress: circleWallet.address,
          email: user?.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Link failed");

      setStatus("success");
      setMessage("Your Discord account is now linked to your ArcPay wallet!");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c10] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(20,184,151,0.15),transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#14b897] to-[#0d9479] mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Link Discord</h1>
          <p className="text-[#14b897] text-sm mt-1">Connect your Discord to ArcPay</p>
        </div>

        <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6">
          {status === "success" ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-16 h-16 text-[#14b897] mx-auto mb-4" />
              <h2 className="text-white font-bold text-xl mb-2">Linked Successfully!</h2>
              <p className="text-white/50 text-sm mb-4">{message}</p>
              <p className="text-white/30 text-xs">Check your Discord DMs for confirmation. You can close this page.</p>
            </div>
          ) : status === "error" ? (
            <div className="text-center py-4">
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-white font-bold text-xl mb-2">Link Failed</h2>
              <p className="text-red-400 text-sm mb-4">{message}</p>
              <p className="text-white/30 text-xs">Run /link again in Discord to get a new code.</p>
            </div>
          ) : (
            <>
              {/* Code display */}
              <div className="bg-[#0d1117] border border-[#14b897]/20 rounded-xl p-4 mb-6 text-center">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Link Code</p>
                <p className="text-[#14b897] font-mono text-3xl font-bold">{code}</p>
                {discordUsername && (
                  <p className="text-white/30 text-xs mt-2">for @{discordUsername}</p>
                )}
              </div>

              {!isAuthenticated ? (
                <div className="text-center">
                  <p className="text-white/50 text-sm mb-4">
                    You need to sign in to ArcPay first to link your Discord.
                  </p>
                  <a href="/" className="block w-full bg-gradient-to-r from-[#14b897] to-[#0d9479] text-white font-bold py-3 rounded-xl text-center">
                    Sign In to ArcPay
                  </a>
                </div>
              ) : !circleWallet ? (
                <div className="text-center">
                  <p className="text-white/50 text-sm mb-4">
                    You need a Circle wallet to link Discord. Sign up first!
                  </p>
                  <a href="/" className="block w-full bg-gradient-to-r from-[#14b897] to-[#0d9479] text-white font-bold py-3 rounded-xl text-center">
                    Create Wallet
                  </a>
                </div>
              ) : (
                <>
                  <div className="bg-[#14b897]/5 border border-[#14b897]/20 rounded-xl p-3 mb-4">
                    <p className="text-xs text-white/50 mb-1">Linking wallet:</p>
                    <p className="text-xs font-mono text-[#14b897] truncate">{circleWallet.address}</p>
                  </div>

                  <button
                    onClick={handleLink}
                    disabled={status === "loading"}
                    className="w-full bg-gradient-to-r from-[#14b897] to-[#0d9479] hover:opacity-90 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {status === "loading" ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Linking...</>
                    ) : (
                      <><Shield className="w-5 h-5" /> Confirm Link</>
                    )}
                  </button>

                  <p className="text-white/20 text-xs text-center mt-3">
                    This connects @{discordUsername ?? "your Discord"} to your ArcPay wallet
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}