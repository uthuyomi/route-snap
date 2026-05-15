import { NextRequest, NextResponse } from "next/server";
import { checkQuota, recordUsage } from "../../lib/server/usage";

export const runtime = "nodejs";
export const maxDuration = 60;

const backendApiBaseUrl = process.env.BACKEND_API_BASE_URL ?? "http://127.0.0.1:8000";
const routeSnapApiToken = process.env.ROUTE_SNAP_API_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const quota = await checkQuota("routeRuns", 1);
    if (!quota.allowed || !quota.subject || !quota.periodKey) {
      return NextResponse.json({ detail: quota.detail }, { status: quota.status });
    }

    const body = await request.text();
    const headers = new Headers({
      "content-type": request.headers.get("content-type") ?? "application/json"
    });

    if (routeSnapApiToken) {
      headers.set("X-Route-Snap-Token", routeSnapApiToken);
    }

    const response = await fetch(`${backendApiBaseUrl}/api/optimize-route`, {
      method: "POST",
      body,
      headers
    });

    const contentType = response.headers.get("content-type") ?? "application/json";
    const responseBody = await response.text();

    if (response.ok && !quota.unlimited) {
      await recordUsage(quota.subject, "routeRuns", 1, quota.periodKey);
    }

    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        "content-type": contentType
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Backend request failed";
    return NextResponse.json({ detail: message }, { status: 502 });
  }
}
