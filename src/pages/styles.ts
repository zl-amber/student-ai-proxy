export const STYLES_CSS = `
* { box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #f5f7fb;
  color: #1f2937;
  margin: 0;
  min-height: 100vh;
}
.container {
  max-width: 480px;
  margin: 64px auto;
  padding: 32px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.08);
}
.logo {
  width: 140px;
  height: 40px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  border-radius: 8px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin-bottom: 24px;
}
h1 { margin: 0 0 8px; font-size: 1.5rem; }
p { color: #6b7280; line-height: 1.6; }
input, button {
  width: 100%;
  padding: 12px 14px;
  margin: 8px 0;
  border-radius: 10px;
  font-size: 1rem;
}
input { border: 1px solid #d1d5db; }
button {
  border: none;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
  font-weight: 600;
}
button:hover { background: #1d4ed8; }
button.secondary { background: #111827; }
.message {
  margin-top: 16px;
  padding: 12px;
  background: #ecfdf5;
  color: #065f46;
  border-radius: 8px;
}
.card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px;
  margin: 12px 0;
  word-break: break-all;
  font-family: monospace;
  font-size: 0.85rem;
}
a { color: #2563eb; text-decoration: none; }
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  min-height: 100vh;
  overflow: hidden;
}
.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  padding-top: max(12px, env(safe-area-inset-top));
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}
.chat-back { font-size: 1.4rem; line-height: 1; padding: 8px; color: #2563eb; }
.chat-header-info { flex: 1; min-width: 0; }
.chat-title { font-weight: 700; font-size: 1rem; }
.chat-balance { font-size: 0.75rem; color: #6b7280; margin-top: 2px; }
.chat-clear {
  width: auto; margin: 0; padding: 8px 12px; font-size: 0.85rem;
  background: #f3f4f6; color: #374151;
}
.chat-clear:hover { background: #e5e7eb; }
.chat-messages {
  flex: 1; overflow-y: auto; padding: 16px; padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
}
.chat-welcome { text-align: center; color: #6b7280; font-size: 0.9rem; margin-top: 24px; }
.chat-welcome p { margin: 8px 0; }
.chat-bubble { max-width: 85%; margin-bottom: 12px; animation: fadeIn 0.2s ease; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.chat-bubble-user { margin-left: auto; }
.chat-bubble-assistant { margin-right: auto; }
.chat-bubble-label { font-size: 0.7rem; color: #9ca3af; margin-bottom: 4px; padding: 0 4px; }
.chat-bubble-user .chat-bubble-label { text-align: right; }
.chat-bubble-content {
  padding: 10px 14px; border-radius: 14px; line-height: 1.5;
  font-size: 0.95rem; white-space: pre-wrap; word-break: break-word;
}
.chat-bubble-user .chat-bubble-content {
  background: #2563eb; color: #fff; border-bottom-right-radius: 4px;
}
.chat-bubble-assistant .chat-bubble-content {
  background: #fff; color: #1f2937; border: 1px solid #e5e7eb; border-bottom-left-radius: 4px;
}
.chat-input-bar {
  flex-shrink: 0; padding: 12px 16px;
  padding-bottom: max(12px, env(safe-area-inset-bottom));
  background: #fff; border-top: 1px solid #e5e7eb;
}
.chat-form { display: flex; gap: 8px; align-items: flex-end; }
.chat-form textarea {
  flex: 1; margin: 0; width: auto; min-height: 44px; max-height: 120px;
  resize: none; border: 1px solid #d1d5db; border-radius: 12px;
  padding: 10px 14px; font-size: 16px; font-family: inherit; line-height: 1.4;
}
.chat-form button {
  width: auto; margin: 0; min-width: 64px; min-height: 44px;
  padding: 10px 16px; border-radius: 12px; flex-shrink: 0;
}
.chat-form button:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-link {
  display: block; width: 100%; margin: 8px 0; padding: 12px 14px;
  border-radius: 10px; font-size: 1rem; font-weight: 600; text-align: center;
  background: #2563eb; color: #fff !important; border: none; cursor: pointer;
}
.btn-link:hover { background: #1d4ed8; }
`.trim();
