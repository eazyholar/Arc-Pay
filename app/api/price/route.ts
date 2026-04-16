import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true",
      { next: { revalidate: 60 } }
    );
    const data = await res.json();
    const usdc = data["usd-coin"];
    return NextResponse.json({
      usd: usdc?.usd ?? 1.0,
      usd_24h_change: usdc?.usd_24h_change ?? 0,
      last_updated_at: usdc?.last_updated_at ?? Date.now(),
    });
  } catch {
    return NextResponse.json({
      usd: 1.0,
      usd_24h_change: 0,
      last_updated_at: Date.now(),
    });
  }
}