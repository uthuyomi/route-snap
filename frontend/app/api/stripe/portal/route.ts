import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../lib/server/supabase";
import { getAppUrl, getStripe } from "../../../lib/server/stripe";
import { getCurrentUser } from "../../../lib/server/usage";

export const runtime = "nodejs";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ detail: "Login required" }, { status: 401 });
  }

  const stripe = getStripe();
  const admin = createSupabaseAdminClient();
  if (!stripe || !admin) {
    return NextResponse.json({ detail: "Stripe or Supabase is not configured" }, { status: 503 });
  }

  const { data } = await admin
    .from("route_snap_subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data?.stripe_customer_id) {
    return NextResponse.json({ detail: "No billing customer found" }, { status: 404 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: data.stripe_customer_id,
    return_url: `${getAppUrl()}/account`
  });

  return NextResponse.json({ url: session.url });
}

