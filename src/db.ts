import type { Env, User } from "./types";

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
}

export async function generateToken(): Promise<string> {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function getUserByEmail(env: Env, email: string): Promise<User | null> {
  return env.DB.prepare("SELECT * FROM users WHERE email = ?")
    .bind(email.trim().toLowerCase())
    .first<User>();
}

export async function getUserByApiToken(env: Env, apiToken: string): Promise<User | null> {
  return env.DB.prepare("SELECT * FROM users WHERE api_token = ?")
    .bind(apiToken)
    .first<User>();
}

export async function registerUser(env: Env, email: string): Promise<User> {
  const normalized = email.trim().toLowerCase();
  const existing = await getUserByEmail(env, normalized);

  if (existing) {
    if (existing.verified !== 1) {
      await env.DB.prepare("UPDATE users SET verified = 1 WHERE email = ?")
        .bind(normalized)
        .run();
      return { ...existing, verified: 1 };
    }
    return existing;
  }

  const apiToken = await generateToken();
  await env.DB.prepare(
    "INSERT INTO users (email, api_token, verified, token_balance) VALUES (?, ?, 1, 0)",
  )
    .bind(normalized, apiToken)
    .run();

  const user = await getUserByEmail(env, normalized);
  if (!user) {
    throw new Error("Failed to create user");
  }
  return user;
}

export async function deductUserTokens(
  env: Env,
  userId: number,
  amount: number,
): Promise<boolean> {
  const result = await env.DB.prepare(
    "UPDATE users SET token_balance = token_balance - ? WHERE id = ? AND token_balance >= ?",
  )
    .bind(amount, userId, amount)
    .run();

  return (result.meta.changes ?? 0) > 0;
}

export async function addUserTokens(
  env: Env,
  apiToken: string,
  amount: number,
): Promise<boolean> {
  const result = await env.DB.prepare(
    "UPDATE users SET token_balance = token_balance + ? WHERE api_token = ?",
  )
    .bind(amount, apiToken)
    .run();

  return (result.meta.changes ?? 0) > 0;
}

export async function isStripeEventProcessed(env: Env, eventId: string): Promise<boolean> {
  const row = await env.DB.prepare("SELECT id FROM stripe_events WHERE id = ?")
    .bind(eventId)
    .first();
  return !!row;
}

export async function markStripeEventProcessed(env: Env, eventId: string): Promise<void> {
  await env.DB.prepare("INSERT INTO stripe_events (id) VALUES (?)")
    .bind(eventId)
    .run();
}
