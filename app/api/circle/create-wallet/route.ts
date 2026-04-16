import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    console.log("=== CREATE WALLET CALLED ===", userId);

    const mockWallet = {
      id: `wallet_${Date.now()}`,
      address: `0x${Array.from({length: 40}, () => 
        Math.floor(Math.random() * 16).toString(16)).join("")}`,
      blockchain: "EVM",
      state: "LIVE",
      createDate: new Date().toISOString(),
      updateDate: new Date().toISOString(),
    };
    
    return NextResponse.json(mockWallet);

  } catch (err: any) {
    console.error("Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}