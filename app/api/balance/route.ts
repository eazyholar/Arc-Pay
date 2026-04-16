import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ balance: 0 });
  }

  try {
    const rpcUrl = "https://5042002.rpc.thirdweb.com";
    const usdcContract = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
    
    // Call balanceOf on USDC contract
    const data = "0x70a08231" + address.slice(2).padStart(64, "0");
    
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1, method: "eth_call",
        params: [{ to: usdcContract, data }, "latest"]
      })
    });

    const json = await res.json();
    const raw = BigInt(json.result ?? "0x0");
    const balance = Number(raw) / 1e6;

    return NextResponse.json({ balance, address });
  } catch (err: any) {
    return NextResponse.json({ balance: 0, error: err.message });
  }
}