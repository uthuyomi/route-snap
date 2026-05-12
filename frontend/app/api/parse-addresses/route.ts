import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const backendApiBaseUrl = process.env.BACKEND_API_BASE_URL ?? "http://127.0.0.1:8080";
const routeSnapApiToken = process.env.ROUTE_SNAP_API_TOKEN;

export async function POST(request: NextRequest) {
  try {
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
