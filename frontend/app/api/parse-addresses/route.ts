import { NextRequest, NextResponse } from "next/server";
import { checkQuota, recordUsage } from "../../lib/server/usage";

export const runtime = "nodejs";
export const maxDuration = 60;

const backendApiBaseUrl = process.env.BACKEND_API_BASE_URL ?? "http://127.0.0.1:8000";
const routeSnapApiToken = process.env.ROUTE_SNAP_API_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const quota = await checkQuota("imageOcr", 1);
    if (!quota.allowed || !quota.subject || !quota.periodKey) {
      return NextResponse.json({ detail: quota.detail }, { status: quota.status });
    }

    const formData = await request.formData();
    const headers = new Headers();

    if (routeSnapApiToken) {
      headers.set("X-Route-Snap-Token", routeSnapApiToken);
    }

    const response = await fetch(`${backendApiBaseUrl}/api/parse-addresses`, {
      method: "POST",
      body: formData,
      headers
    });

    const responseContentType = response.headers.get("content-type") ?? "application/json";
    const body = await response.text();

    if (response.ok) {
      await recordUsage(quota.subject, "imageOcr", 1, quota.periodKey);
    }

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "content-type": responseContentType
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Backend request failed";
    return NextResponse.json({ detail: message }, { status: 502 });
  }
}
