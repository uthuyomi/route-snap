import { NextRequest, NextResponse } from "next/server";
import { checkQuota, recordUsage } from "../../../lib/server/usage";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as { count?: number };
    const count = Math.max(0, Math.min(10000, Math.floor(Number(payload.count ?? 0))));

    if (!count) {
      return NextResponse.json({ ok: true });
    }

    const quota = await checkQuota("fileStops", count);
    if (!quota.allowed || !quota.subject || !quota.periodKey) {
      return NextResponse.json({ detail: quota.detail }, { status: quota.status });
    }

    if (!quota.unlimited) {
      await recordUsage(quota.subject, "fileStops", count, quota.periodKey);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Usage request failed";
    return NextResponse.json({ detail: message }, { status: 400 });
  }
}
