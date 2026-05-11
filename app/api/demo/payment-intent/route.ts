import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  // If no real Stripe key configured, return a demo response
  if (!stripeKey || stripeKey === "sk_test_placeholder") {
    return NextResponse.json({
      clientSecret: "pi_demo_secret_demo",
      demo: true,
    });
  }

  try {
    const { amount, currency = "usd", items } = await request.json();

    // Dynamic import Stripe (server-side only)
    const Stripe = (await import("stripe")).default;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stripe = new Stripe(stripeKey, { apiVersion: "2026-04-22.dahlia" as any });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency,
      metadata: {
        source: "zholy-demo",
        items: JSON.stringify(items?.slice(0, 3) || []),
      },
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "payment error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
