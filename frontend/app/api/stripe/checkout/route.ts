import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { isPaidPlanId, PLANS } from "../../../lib/plans";
import { createSupabaseAdminClient } from "../../../lib/server/supabase";
import { getAppUrl, getStripe } from "../../../lib/server/stripe";
import { getCurrentUser } from "../../../lib/server/usage";

export const runtime = "nodejs";

const activeStatuses = ["active", "trialing"];
const blockingSubscriptionStatuses = ["active", "trialing", "past_due", "unpaid", "incomplete"];

function planFromPriceId(priceId: string | null | undefined) {
  const entries = [
    ["light", process.env.STRIPE_PRICE_LIGHT],
    ["standard", process.env.STRIPE_PRICE_STANDARD],
    ["pro", process.env.STRIPE_PRICE_PRO],
    ["business", process.env.STRIPE_PRICE_BUSINESS]
  ] as const;

  return entries.find(([, envPriceId]) => envPriceId && envPriceId === priceId)?.[0] ?? "free";
}

async function createPortalSession(stripe: Stripe, customerId: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${getAppUrl()}/account`
  });
}

async function findBlockingSubscription(stripe: Stripe, customerId: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 100
  });

  return subscriptions.data.find((subscription) => {
    const priceId = subscription.items.data[0]?.price.id;
    return blockingSubscriptionStatuses.includes(subscription.status) && isPaidPlanId(planFromPriceId(priceId));
  });
}

async function expireOpenCheckoutSessions(stripe: Stripe, customerId: string) {
  const sessions = await stripe.checkout.sessions.list({
    customer: customerId,
    status: "open",
    limit: 100
  });

  await Promise.allSettled(
    sessions.data
      .filter((session) => session.mode === "subscription")
      .map((session) => stripe.checkout.sessions.expire(session.id))
  );
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const admin = createSupabaseAdminClient();
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ detail: "Login required" }, { status: 401 });
  }

  const payload = (await request.json()) as { planId?: string };
  if (!isPaidPlanId(payload.planId)) {
    return NextResponse.json({ detail: "Invalid plan" }, { status: 400 });
  }

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
    .select("plan_id,status,stripe_customer_id,stripe_subscription_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let customerId = existing?.stripe_customer_id ?? null;
  if (customerId && existing?.stripe_subscription_id && activeStatuses.includes(existing.status) && isPaidPlanId(existing.plan_id)) {
    const portal = await createPortalSession(stripe, customerId);
    return NextResponse.json({ url: portal.url });
  }

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

  const blockingSubscription = await findBlockingSubscription(stripe, customerId);
  if (blockingSubscription) {
    const currentPeriodEnd = (blockingSubscription as Stripe.Subscription & { current_period_end?: number }).current_period_end;
    await admin.from("route_snap_subscriptions").upsert({
      user_id: user.id,
      plan_id: planFromPriceId(blockingSubscription.items.data[0]?.price.id),
      status: blockingSubscription.status,
      stripe_customer_id: customerId,
      stripe_subscription_id: blockingSubscription.id,
      current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
      updated_at: new Date().toISOString()
    });

    const portal = await createPortalSession(stripe, customerId);
    return NextResponse.json({ url: portal.url });
  }

  await expireOpenCheckoutSessions(stripe, customerId);

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
