import {
  CHAT_PAGE,
  DASHBOARD_PAGE,
  REGISTER_PAGE,
  TOKENS_ADDED_PAGE,
} from "./content";
import { STYLES_CSS } from "./styles";

const PAGE_ROUTES: Record<string, string> = {
  "/": REGISTER_PAGE,
  "/index.html": REGISTER_PAGE,
  "/chat.html": CHAT_PAGE,
  "/dashboard.html": DASHBOARD_PAGE,
  "/tokens-added.html": TOKENS_ADDED_PAGE,
};

export function serveStatic(pathname: string): Response | null {
  if (pathname === "/style.css") {
    return new Response(STYLES_CSS, {
      headers: {
        "Content-Type": "text/css; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const html = PAGE_ROUTES[pathname];
  if (!html) {
    return null;
  }

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
