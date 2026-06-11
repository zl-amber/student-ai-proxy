import type { Env } from "./types";
import { addUserTokens, isStripeEventProcessed, markStripeEventProcessed } from "./db";

function getTokenPackAmount(env: Env): number {
  const amount = Number(env.TOKEN_PACK_AMOUNT ?? "50000");
  return Number.isFinite(amount) && amount > 0 ? amount : 50000;
}

export async function createCheckoutSession(
  env: Env,
  email: string,
  apiToken: string,
): Promise<string> {
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_PRICE_ID || !env.SITE_URL) {
    throw new Error("Stripe is not configured");
  }

  const siteUrl = env.SITE_URL.replace(/\/$/, "");
  const tokens = String(getTokenPackAmount(env));

  const body = new URLSearchParams({
    mode: "payment",
    customer_email: email,
    success_url: `${siteUrl}/tokens-added.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/dashboard.html`,
    "line_items[0][price]": env.STRIPE_PRICE_ID,
    "line_items[0][quantity]": "1",
    "metadata[api_token]": apiToken,
    "metadata[tokens]": tokens,
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = (await response.json()) as { url?: string; error?: { message?: string } };
  if (!response.ok || !data.url) {
    throw new Error(data.error?.message ?? "Failed to create checkout session");
  }

  return data.url;
}

async function verifyStripeSignature(
  payload: string,
  signatureHeader: string,
  secret: string,
): Promise<boolean> {
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    }),
  );

  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expected === signature;
}

export async function handleStripeWebhook(
  env: Env,
  request: Request,
): Promise<Response> {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature", { status: 400 });
  }

  const payload = await request.text();
  const valid = await verifyStripeSignature(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  if (!valid) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(payload) as {
    id: string;
    type: string;
    data: { object: { metadata?: Record<string, string> } };
  };

  if (await isStripeEventProcessed(env, event.id)) {
    return Response.json({ received: true, duplicate: true });
  }

  if (event.type === "checkout.session.completed") {
    const metadata = event.data.object.metadata ?? {};
    const apiToken = metadata.api_token;
    const tokens = Number(metadata.tokens ?? getTokenPackAmount(env));

    if (apiToken && tokens > 0) {
      await addUserTokens(env, apiToken, tokens);
    }
  }

  await markStripeEventProcessed(env, event.id);
  return Response.json({ received: true });
}
