import dotenv from "dotenv";
dotenv.config();
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

const client = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET,
});

async function run() {
  const res = await client.createWalletSet({
    name: "ArcPay Wallet Set",
  });

  console.log(res.data.walletSet);
}

run();