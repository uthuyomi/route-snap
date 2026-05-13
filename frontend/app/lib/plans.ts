export type PlanId = "free" | "light" | "standard" | "pro" | "business";
export type MeterKey = "imageOcr" | "fileStops" | "routeRuns";

export type Plan = {
  id: PlanId;
  price: number;
  imageOcr: number;
  fileStops: number;
  routeRuns: number;
  stripePriceEnv?: string;
};

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    price: 0,
    imageOcr: 5,
    fileStops: 30,
    routeRuns: 3
  },
  light: {
    id: "light",
    price: 680,
    imageOcr: 30,
    fileStops: 300,
    routeRuns: 30,
    stripePriceEnv: "STRIPE_PRICE_LIGHT"
  },
  standard: {
    id: "standard",
    price: 1480,
    imageOcr: 120,
    fileStops: 1500,
    routeRuns: 150,
    stripePriceEnv: "STRIPE_PRICE_STANDARD"
  },
  pro: {
    id: "pro",
    price: 2980,
    imageOcr: 400,
    fileStops: 5000,
    routeRuns: 500,
    stripePriceEnv: "STRIPE_PRICE_PRO"
  },
  business: {
    id: "business",
    price: 9800,
    imageOcr: 1500,
    fileStops: 20000,
    routeRuns: 2000,
    stripePriceEnv: "STRIPE_PRICE_BUSINESS"
  }
};

export const PAID_PLAN_IDS = ["light", "standard", "pro", "business"] as const satisfies readonly PlanId[];

export function isPlanId(value: string | null | undefined): value is PlanId {
  return value === "free" || value === "light" || value === "standard" || value === "pro" || value === "business";
}

export function isPaidPlanId(value: string | null | undefined): value is (typeof PAID_PLAN_IDS)[number] {
  return value === "light" || value === "standard" || value === "pro" || value === "business";
}

export function getPlanLimit(planId: PlanId, meter: MeterKey) {
  return PLANS[planId][meter];
}
