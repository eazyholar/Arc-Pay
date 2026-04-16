// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatUnits, parseUnits } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function formatUsdc(raw: bigint): string {
  return parseFloat(formatUnits(raw, 6)).toLocaleString("en-US", {
    minimumFractionDigits: 2, maximumFractionDigits: 6,
  });
}
export function parseUsdc(amount: string): bigint {
  return parseUnits(amount.replace(/,/g, ""), 6);
}
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec/60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec/3600)}h ago`;
  return `${Math.floor(diffSec/86400)}d ago`;
}
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
export function formatUsd(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
export function getExplorerTxUrl(txHash: string): string {
  return `https://5042002.testnet.circlescan.io/tx/${txHash}`;
}
export function getExplorerAddressUrl(address: string): string {
  return `https://5042002.testnet.circlescan.io/address/${address}`;
}