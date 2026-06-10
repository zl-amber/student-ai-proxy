export interface Env {
  DEEPSEEK_API_KEY: string;
}

// const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const DEEPSEEK_CHAT_URL = 'https://api.deepseek.com/v1/chat/completions';

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
            message: "Student AI Proxy is running. Send POST requests to this URL.",
            endpoint: DEEPSEEK_CHAT_URL,
          }),
          { headers: { "Content-Type": "application/json" } },
        ),
      );
    }

    if (request.method !== "POST") {
      return jsonError("Method not allowed. Use POST for chat completions.", 405);
    }

    if (!env.DEEPSEEK_API_KEY) {
      return jsonError("DEEPSEEK_API_KEY is not configured", 500);
    }

    try {
      const deepseekResponse = await fetch(DEEPSEEK_CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
        },
        body: request.body,
      });

      return withCors(deepseekResponse);
    } catch {
      return jsonError("Failed to proxy request to DeepSeek", 502);
    }
  },
};
