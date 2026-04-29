import { NextRequest, NextResponse } from "next/server";

const profileStore = new Map<string, any>();

export async function GET(req: NextRequest) {
  const userId = new URL(req.url).searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  const profile = profileStore.get(userId) ?? { userId, displayName: "", bio: "", notificationsEnabled: true };
  return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, displayName, bio, notificationsEnabled } = body;
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    const existing = profileStore.get(userId) ?? {};
    const updated = { ...existing, userId, displayName: displayName ?? "", bio: bio ?? "", notificationsEnabled: notificationsEnabled ?? true, updatedAt: new Date().toISOString() };
    profileStore.set(userId, updated);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}