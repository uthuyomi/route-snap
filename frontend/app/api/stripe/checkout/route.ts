import { NextRequest, NextResponse } from "next/server";
import { isPaidPlanId, PLANS } from "../../../lib/plans";
import { createSupabaseAdminClient } from "../../../lib/server/supabase";
import { getAppUrl, getStripe } from "../../../lib/server/stripe";
import { getCurrentUser } from "../../../lib/server/usage";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ detail: "Login required" }, { status: 401 });
  }

  const payload = (await request.json()) as { planId?: string };
  if (!isPaidPlanId(payload.planId)) {
    return NextResponse.json({ detail: "Invalid plan" }, { status: 400 });
  }

  const stripe = getStripe();
  const admin = createSupabaseAdminClient();
  if (!stripe || !admin) {
    return NextResponse.json({ detail: "Stripe or Supabase is not configured" }, { status: 503 });
  }

  const plan = PLANS[payload.planId];
  const priceId = plan.stripePriceEnv ? process.env[plan.stripePriceEnv] : null;
  if (!priceId) {
    return NextResponse.json({ detail: `${plan.stripePriceEnv} is not configured` }, { status: 503 });
  }

  const { data: existing } = await admin
    .from("route_snap_subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let customerId = existing?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: {
        user_id: user.id
      }
    });
    customerId = customer.id;

    await admin.from("route_snap_subscriptions").upsert({
      user_id: user.id,
      plan_id: "free",
      status: "inactive",
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString()
    });
  }

  const appUrl = getAppUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${appUrl}/account?checkout=success`,
    cancel_url: `${appUrl}/pricing?checkout=cancelled`,
    client_reference_id: user.id,
    metadata: {
      user_id: user.id,
      plan_id: payload.planId
    },
    subscription_data: {
      metadata: {
        user_id: user.id,
        plan_id: payload.planId
      }
    }
  });

  return NextResponse.json({ url: session.url });
}
