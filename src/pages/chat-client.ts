export const CHAT_CLIENT_JS = `
const userKey = new URLSearchParams(location.search).get("api_token")
  || localStorage.getItem("api_token");
if (!userKey) { location.href = "/"; }
else { localStorage.setItem("api_token", userKey); }

const messagesEl = document.getElementById("messages");
const balanceEl = document.getElementById("balance");
const form = document.getElementById("chatForm");
const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const history = [];
let isSending = false;

async function loadBalance() {
  try {
    const res = await fetch("/api/me?api_token=" + encodeURIComponent(userKey));
    const data = await res.json();
    balanceEl.textContent = res.ok
      ? "Token 余额: " + data.token_balance.toLocaleString()
      : "余额未知";
  } catch { balanceEl.textContent = "余额未知"; }
}

function createBubble(role, text) {
  const wrap = document.createElement("div");
  wrap.className = "chat-bubble chat-bubble-" + role;
  const label = document.createElement("div");
  label.className = "chat-bubble-label";
  label.textContent = role === "user" ? "你" : "AI";
  const content = document.createElement("div");
  content.className = "chat-bubble-content";
  content.textContent = text;
  wrap.appendChild(label);
  wrap.appendChild(content);
  return { wrap, content };
}

function removeWelcome() {
  const welcome = messagesEl.querySelector(".chat-welcome");
  if (welcome) welcome.remove();
}

function scrollToBottom() { messagesEl.scrollTop = messagesEl.scrollHeight; }

function setLoading(show) {
  isSending = show;
  sendBtn.disabled = show;
  input.disabled = show;
  sendBtn.textContent = show ? "..." : "发送";
}

function parseError(data, status) {
  if (typeof data === "string") return data;
  if (data && data.error) {
    return typeof data.error === "string" ? data.error : data.error.message || JSON.stringify(data.error);
  }
  return "请求失败 (" + status + ")";
}

function authHeader(key) {
  const name = "Author" + "ization";
  const prefix = "Be" + "arer ";
  return { [name]: prefix + key };
}

async function sendMessage(text) {
  history.push({ role: "user", content: text });
  const userBubble = createBubble("user", text);
  removeWelcome();
  messagesEl.appendChild(userBubble.wrap);
  scrollToBottom();
  const assistantBubble = createBubble("assistant", "");
  messagesEl.appendChild(assistantBubble.wrap);
  const contentEl = assistantBubble.content;
  setLoading(true);
  try {
    const headers = Object.assign(
      { "Content-Type": "application/json" },
      authHeader(userKey),
    );
    const res = await fetch("/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({ model: "deepseek-chat", messages: history, stream: true }),
    });
    if (!res.ok) {
      let errData;
      try { errData = await res.json(); } catch { errData = await res.text(); }
      contentEl.textContent = "错误: " + parseError(errData, res.status);
      history.pop();
      return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      buffer += decoder.decode(chunk.value, { stream: true });
      const lines = buffer.split("\\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") continue;
        try {
          const json = JSON.parse(payload);
          const delta = json.choices && json.choices[0] && json.choices[0].delta
            ? json.choices[0].delta.content : null;
          if (delta) {
            fullText += delta;
            contentEl.textContent = fullText;
            scrollToBottom();
          }
        } catch {}
      }
    }
    if (!fullText) contentEl.textContent = "（无回复内容）";
    else history.push({ role: "assistant", content: fullText });
    loadBalance();
  } catch (err) {
    contentEl.textContent = "网络错误: " + err.message;
    history.pop();
  } finally {
    setLoading(false);
    input.focus();
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (isSending) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  input.style.height = "auto";
  await sendMessage(text);
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 120) + "px";
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    form.requestSubmit();
  }
});

clearBtn.addEventListener("click", () => {
  if (isSending) return;
  history.length = 0;
  messagesEl.innerHTML = '<div class="chat-welcome"><p>对话已清空，继续提问吧。</p></div>';
});

loadBalance();
input.focus();
`.trim();
