"use client";
import { useSearchParams } from "next/navigation";
import { Zap, AlertCircle } from "lucide-react";
import Link from "next/link";

const errors: Record<string, string> = {
  Configuration: "Server configuration error. Check your OAuth credentials.",
  AccessDenied: "Access denied. You cancelled the sign-in.",
  Verification: "The sign-in link expired. Please try again.",
  Default: "An error occurred during sign-in.",
};

export default function AuthError() {
  const params = useSearchParams();
  const error = params.get("error") ?? "Default";
  const message = errors[error] ?? errors.Default;

  return (
    <div className="min-h-screen bg-[#080c10] flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#14b897] to-[#0d9479] mb-6">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <div className="bg-[#161b22] border border-white/5 rounded-2xl p-8">
          <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Sign In Error</h1>
          <p className="text-white/50 text-sm mb-2">{message}</p>
          {error === "Configuration" && (
            <p className="text-amber-400/70 text-xs mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
              OAuth credentials missing. Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, DISCORD_CLIENT_ID_OAUTH, DISCORD_CLIENT_SECRET to .env.local
            </p>
          )}
          <Link href="/auth/signin"
            className="block w-full py-3 bg-gradient-to-r from-[#14b897] to-[#0d9479] text-white font-bold rounded-xl hover:opacity-90 transition-all">
            Try Again
          </Link>
          <Link href="/" className="block mt-3 text-white/30 text-sm hover:text-white/60 transition-colors">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}