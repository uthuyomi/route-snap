import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const backendApiBaseUrl = process.env.BACKEND_API_BASE_URL ?? "http://127.0.0.1:8080";
const routeSnapApiToken = process.env.ROUTE_SNAP_API_TOKEN;

export async function POST(request: NextRequest) {
  try {
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
