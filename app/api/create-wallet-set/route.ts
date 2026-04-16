import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const apiKey = process.env.CIRCLE_API_KEY;
    const walletSetId = process.env.CIRCLE_WALLET_SET_ID;
    const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

    if (!apiKey || !walletSetId || !entitySecret) {
      // Mock mode
      const mockWallet = {
        id: `wallet_${Date.now()}`,
        address: `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
        blockchain: "EVM",
        state: "LIVE",
        createDate: new Date().toISOString(),
        updateDate: new Date().toISOString(),
      };
      return NextResponse.json(mockWallet);
    }

    // Generate ciphertext fresh each time using Web Crypto
    const pubKeyRes = await fetch("https://api.circle.com/v1/w3s/config/entity/publicKey", {
      headers: { "Authorization": `Bearer ${apiKey}` }
    });
    const pubKeyData = await pubKeyRes.json();
    const pemKey = pubKeyData?.data?.publicKey;

    if (!pemKey) throw new Error("Could not fetch Circle public key");

    // Import public key
    const pemContents = pemKey
      .replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\n/g, "");
    const binaryDer = Buffer.from(pemContents, "base64");
    const cryptoKey = await crypto.subtle.importKey(
      "spki",
      binaryDer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["encrypt"]
    );

    // Encrypt entity secret
    const secretBytes = Buffer.from(entitySecret, "hex");
    const encrypted = await crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      cryptoKey,
      secretBytes
    );
    const ciphertext = Buffer.from(encrypted).toString("base64");

    // Create wallet via Circle API
    const { randomUUID } = await import("crypto");
    const body = JSON.stringify({
      idempotencyKey: randomUUID(),
      entitySecretCiphertext: ciphertext,
      walletSetId,
      blockchains: ["EVM"],
      count: 1,
      metadata: [{ name: `ArcPay-${userId}`, refId: userId }],
    });

    const res = await fetch("https://api.circle.com/v1/w3s/developer/wallets", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body,
    });

    const data = await res.json();
    console.log("Circle response:", JSON.stringify(data));

    if (!res.ok) throw new Error(data?.message ?? "Circle API error");

    const wallet = data?.data?.wallets?.[0];
    if (!wallet) throw new Error("No wallet returned");

    return NextResponse.json({
      id: wallet.id,
      address: wallet.address,
      blockchain: wallet.blockchain,
      state: wallet.state,
      createDate: wallet.createDate,
      updateDate: wallet.updateDate,
    });

  } catch (err: any) {
    console.error("Wallet creation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}