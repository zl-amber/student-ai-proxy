import { getUserByApiToken, isValidEmail, registerUser } from "./db";
import { serveStatic } from "./pages";
import { getHealthInfo, handleChatCompletion } from "./proxy";
import { createCheckoutSession, handleStripeWebhook } from "./stripe";
import type { Env } from "./types";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function json(data: unknown, status = 200): Response {
  return withCors(
    new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

function jsonError(message: string, status: number): Response {
  return json({ error: message }, status);
}

function getBearerToken(request: Request): string | null {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return null;
  }
  return auth.slice(7).trim();
}

async function handleRegister(request: Request, env: Env): Promise<Response> {
  let payload: { email?: string };
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const email = payload.email?.trim();
  if (!email || !isValidEmail(email)) {
    return jsonError("Invalid email address", 400);
  }

  try {
    const user = await registerUser(env, email);
    return json({
      ok: true,
      message: "注册成功",
      api_token: user.api_token,
      email: user.email,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    return jsonError(message, 500);
  }
}

async function handleMe(request: Request, env: Env): Promise<Response> {
  const apiToken =
    getBearerToken(request) ?? new URL(request.url).searchParams.get("api_token");

  if (!apiToken) {
    return jsonError("Missing api_token", 401);
  }

  const user = await getUserByApiToken(env, apiToken);
  if (!user) {
    return jsonError("Invalid api_token", 401);
  }

  return json({
    email: user.email,
    verified: true,
    token_balance: user.token_balance,
    api_token: user.api_token,
  });
}

async function handleCreateCheckout(request: Request, env: Env): Promise<Response> {
  let payload: { api_token?: string };
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const apiToken = payload.api_token ?? getBearerToken(request);
  if (!apiToken) {
    return jsonError("Missing api_token", 401);
  }

  const user = await getUserByApiToken(env, apiToken);
  if (!user) {
    return jsonError("Invalid api_token", 401);
  }

  try {
    const url = await createCheckoutSession(env, user.email, user.api_token);
    return json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return jsonError(message, 500);
  }
}

async function handleChat(request: Request, env: Env): Promise<Response> {
  const apiToken = getBearerToken(request);
  if (!apiToken) {
    return jsonError("Missing Authorization Bearer token", 401);
  }

  const user = await getUserByApiToken(env, apiToken);
  if (!user) {
    return jsonError("Invalid api_token", 401);
  }

  const body = await request.text();
  if (!body.trim()) {
    return jsonError("Request body is empty", 400);
  }

  try {
    JSON.parse(body);
  } catch {
    return jsonError("Request body must be valid JSON", 400);
  }

  try {
    const response = await handleChatCompletion(env, user, body);
    return withCors(response);
  } catch {
    return jsonError("Failed to proxy request", 502);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    try {
      if (pathname === "/api/register" && request.method === "POST") {
        return handleRegister(request, env);
      }

      if (pathname === "/api/me" && request.method === "GET") {
        return handleMe(request, env);
      }

      if (pathname === "/api/create-checkout" && request.method === "POST") {
        return handleCreateCheckout(request, env);
      }

      if (pathname === "/api/stripe-webhook" && request.method === "POST") {
        return handleStripeWebhook(env, request);
      }

      if (pathname === "/api/health" && request.method === "GET") {
        return json(getHealthInfo(env));
      }

      const isChatPath =
        (pathname === "/v1/chat/completions" || pathname === "/chat/completions") &&
        request.method === "POST";

      if (isChatPath) {
        return handleChat(request, env);
      }

      if (request.method === "GET") {
        const page = serveStatic(pathname);
        if (page) {
          return page;
        }
      }

      return jsonError("Not found", 404);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Internal server error";
      return jsonError(message, 500);
    }
  },
};
