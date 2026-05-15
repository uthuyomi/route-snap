import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { isPaidPlanId } from "../../../lib/plans";
import { createSupabaseAdminClient } from "../../../lib/server/supabase";
import { getStripe } from "../../../lib/server/stripe";

export const runtime = "nodejs";

const activeStatuses = ["active", "trialing"];

function planFromPriceId(priceId: string | null | undefined) {
  const entries = [
    ["light", process.env.STRIPE_PRICE_LIGHT],
    ["standard", process.env.STRIPE_PRICE_STANDARD],
    ["pro", process.env.STRIPE_PRICE_PRO],
    ["business", process.env.STRIPE_PRICE_BUSINESS]
  ] as const;

  return entries.find(([, envPriceId]) => envPriceId && envPriceId === priceId)?.[0] ?? "free";
}

async function findUserId(customerId: string, metadataUserId?: string | null) {
  if (metadataUserId) return metadataUserId;

  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const { data } = await admin
    .from("route_snap_subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  return data?.user_id ?? null;
}

async function upsertSubscription(subscription: Stripe.Subscription) {
  const admin = createSupabaseAdminClient();
  if (!admin) return;

  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const item = subscription.items.data[0];
  const planId = planFromPriceId(item?.price.id);
  const activePlanId = isPaidPlanId(planId) && ["active", "trialing"].includes(subscription.status) ? planId : "free";
  const userId = await findUserId(customerId, subscription.metadata.user_id);
  const currentPeriodEnd = (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end;

  if (!userId) return;

  await admin.from("route_snap_subscriptions").upsert({
    user_id: userId,
    plan_id: activePlanId,
    status: subscription.status,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
    updated_at: new Date().toISOString()
  });
}

async function findActivePaidSubscription(stripe: Stripe, customerId: string, ignoredSubscriptionId?: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 100
  });

  return subscriptions.data.find((subscription) => {
    if (subscription.id === ignoredSubscriptionId) return false;
    const item = subscription.items.data[0];
    const planId = planFromPriceId(item?.price.id);
    return activeStatuses.includes(subscription.status) && isPaidPlanId(planId);
  });
}

async function upsertSubscriptionWithCustomerCheck(stripe: Stripe, subscription: Stripe.Subscription) {
  if (subscription.status === "canceled") {
    const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
    const remainingSubscription = await findActivePaidSubscription(stripe, customerId, subscription.id);
    if (remainingSubscription) {
      await upsertSubscription(remainingSubscription);
      return;
    }
  }

  await upsertSubscription(subscription);
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ detail: "Stripe webhook is not configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ detail: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ detail: "Invalid Stripe signature" }, { status: 400 });
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    await upsertSubscriptionWithCustomerCheck(stripe, event.data.object as Stripe.Subscription);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (typeof session.subscription === "string") {
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      await upsertSubscriptionWithCustomerCheck(stripe, subscription);
    }
  }

  return NextResponse.json({ received: true });
}
