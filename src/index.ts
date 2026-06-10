export interface Env {
  /** DeepSeek API Key（推荐） */
  DEEPSEEK_API_KEY?: string;
  /** 兼容旧配置，等同于 DEEPSEEK_API_KEY */
  OPENAI_API_KEY?: string;
  /** 可选：覆盖默认 API 地址 */
  API_BASE?: string;
  OPENAI_API_BASE?: string;
}

const DEFAULT_API_BASE = "https://api.deepseek.com/v1";
const DEFAULT_MODEL = "deepseek-chat";

function getApiKey(env: Env): string | undefined {
  return env.DEEPSEEK_API_KEY ?? env.OPENAI_API_KEY;
}

function getApiBase(env: Env): string {
  return (env.API_BASE ?? env.OPENAI_API_BASE ?? DEFAULT_API_BASE).replace(/\/$/, "");
}

function getChatUrl(env: Env): string {
  return `${getApiBase(env)}/chat/completions`;
}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

function jsonError(message: string, status: number): Response {
  return withCors(
    new Response(JSON.stringify({ error: message }), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method === "GET") {
      return withCors(
        new Response(
          JSON.stringify({
            status: "ok",
            provider: "DeepSeek",
            message: "Student AI Proxy is running. Send POST requests to this URL.",
            endpoint: getChatUrl(env),
            defaultModel: DEFAULT_MODEL,
          }),
          { headers: { "Content-Type": "application/json" } },
        ),
      );
    }

    if (request.method !== "POST") {
      return jsonError("Method not allowed. Use POST for chat completions.", 405);
    }

    const apiKey = getApiKey(env);
    if (!apiKey) {
      return jsonError("DEEPSEEK_API_KEY is not configured", 500);
    }

    try {
      const upstreamResponse = await fetch(getChatUrl(env), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: request.body,
      });

      return withCors(upstreamResponse);
    } catch {
      return jsonError("Failed to proxy request to DeepSeek", 502);
    }
  },
};
