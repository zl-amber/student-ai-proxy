export const CHAT_PAGE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#2563eb" />
  <title>StudentAI - 对话</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body class="chat-page">
  <header class="chat-header">
    <a href="/dashboard.html" class="chat-back" aria-label="返回控制台">&larr;</a>
    <div class="chat-header-info">
      <div class="chat-title">StudentAI</div>
      <div class="chat-balance" id="balance">余额加载中...</div>
    </div>
    <button type="button" class="chat-clear" id="clearBtn" title="清空对话">清空</button>
  </header>
  <main class="chat-messages" id="messages">
    <div class="chat-welcome">
      <p>你好！我是 StudentAI 助手。</p>
      <p>输入问题即可开始对话，支持手机浏览器使用。</p>
    </div>
  </main>
  <footer class="chat-input-bar">
    <form id="chatForm" class="chat-form">
      <textarea id="input" rows="1" placeholder="输入消息..." autocomplete="off" required></textarea>
      <button type="submit" id="sendBtn" aria-label="发送">发送</button>
    </form>
  </footer>
  <script src="/chat.js"></script>
</body>
</html>`;
