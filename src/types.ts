export interface Env {
  DB: D1Database;
  DEEPSEEK_API_KEYS?: string;
  DEEPSEEK_API_KEY?: string;
  OPENAI_API_KEY?: string;
  API_BASE?: string;
  OPENAI_API_BASE?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_ID?: string;
  SITE_URL?: string;
  TOKEN_PACK_AMOUNT?: string;
}

export interface User {
  id: number;
  email: string;
  api_token: string;
  verified: number;
  token_balance: number;
  created_at: string;
}
