// lib/wagmi.ts
import { createConfig, http } from "wagmi";
import { getDefaultConfig } from "connectkit";
import { defineChain } from "viem";

export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USD Coin", symbol: "USDC", decimals: 6 },
  rpcUrls: {
    default: { http: ["https://5042002.rpc.thirdweb.com"] },
    public: { http: ["https://5042002.rpc.thirdweb.com"] },
  },
  blockExplorers: {
    default: { name: "CircleScan", url: "https://5042002.testnet.circlescan.io" },
  },
  testnet: true,
});

export const wagmiConfig = createConfig(
  getDefaultConfig({
    chains: [arcTestnet],
    transports: { [arcTestnet.id]: http("https://5042002.rpc.thirdweb.com") },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo",
    appName: "ArcPay",
    appDescription: "USDC payments on Arc",
    appUrl: "http://localhost:3000",
  })
);