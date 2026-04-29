import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, walletId, walletAddress, email } = body;

    if (!code || !walletId || !walletAddress) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const botUrl = process.env.DISCORD_BOT_API_URL ?? "http://localhost:3001";

    const res = await fetch(`${botUrl}/api/verify-link-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.toUpperCase(), walletId, walletAddress, email }),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.error }, { status: res.status });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}