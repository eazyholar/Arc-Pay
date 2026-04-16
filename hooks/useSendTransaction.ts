"use client";
import { useState, useCallback } from "react";
import { useWriteContract, useAccount, useSwitchChain } from "wagmi";
import { parseUnits } from "viem";
import { useWalletStore } from "@/store/wallet-store";

const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as `0x${string}`;
const ERC20_ABI = [
  { name: "transfer", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }] },
] as const;

export type SendStatus = "idle" | "validating" | "pending" | "submitted" | "confirmed" | "failed";

export function useSendTransaction() {
  const [status, setStatus] = useState<SendStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ txHash?: string; circleId?: string } | null>(null);

  const { walletMode, circleWallet, addTransaction } = useWalletStore();
  const { address: externalAddress, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const send = useCallback(async (params: { to: string; amount: string; note?: string }) => {
    setError(null);
    setResult(null);
    setStatus("validating");

    if (!params.to || !/^0x[a-fA-F0-9]{40}$/.test(params.to)) {
      setError("Invalid recipient address"); setStatus("failed"); return;
    }
    if (!parseFloat(params.amount) || parseFloat(params.amount) <= 0) {
      setError("Invalid amount"); setStatus("failed"); return;
    }

    setStatus("pending");

    try {
      let txResult: { txHash?: string; circleId?: string } = {};
      const fromAddress = walletMode === "external" ? externalAddress ?? "" : circleWallet?.address ?? "";

      if (walletMode === "external") {
        if (chain?.id !== 5042002) {
          await switchChainAsync({ chainId: 5042002 });
        }
        const txHash = await writeContractAsync({
          address: USDC_ADDRESS, abi: ERC20_ABI, functionName: "transfer",
          args: [params.to as `0x${string}`, parseUnits(params.amount, 6)],
        });
        txResult = { txHash };
      } else if (walletMode === "inbuilt" && circleWallet) {
        const res = await fetch("/api/circle/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletId: circleWallet.walletId, to: params.to, amount: params.amount }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Circle transaction failed");
        txResult = { circleId: data.id, txHash: data.txHash };
      } else {
        throw new Error("No wallet connected");
      }

      setStatus("submitted");
      setResult(txResult);

      const txRecord = {
        id: txResult.txHash ?? txResult.circleId ?? crypto.randomUUID(),
        hash: txResult.txHash,
        from: fromAddress,
        to: params.to,
        amount: params.amount,
        state: "PENDING" as const,
        timestamp: new Date().toISOString(),
        source: (walletMode ?? "external") as "inbuilt" | "external",
      };
      addTransaction(txRecord);

      setTimeout(() => {
        useWalletStore.getState().updateTransaction(txRecord.id, { state: "CONFIRMED" });
      }, 10_000);

      return txResult;
    } catch (err: any) {
      const message = err?.shortMessage ?? err?.message ?? "Transaction failed";
      setError(message);
      setStatus("failed");
      throw err;
    }
  }, [walletMode, circleWallet, externalAddress, chain, switchChainAsync, writeContractAsync, addTransaction]);

  const reset = useCallback(() => {
    setStatus("idle"); setError(null); setResult(null);
  }, []);

  return { send, status, error, result, reset };
}