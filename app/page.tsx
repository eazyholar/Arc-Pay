"use client";
import { useWalletStore } from "../store/wallet-store";
import { AuthScreen } from "../components/wallet/AuthScreen";
import { Dashboard } from "../components/dashboard/Dashboard";

export default function Home() {
  const { isAuthenticated } = useWalletStore();
  return isAuthenticated ? <Dashboard /> : <AuthScreen />;
}