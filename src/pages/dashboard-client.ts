export const DASHBOARD_CLIENT_JS = `
const K = "api_" + "token";
const userKey = new URLSearchParams(location.search).get(K) || localStorage.getItem(K);
if (!userKey) { location.href = "/"; }
else { localStorage.setItem(K, userKey); }

async function loadProfile() {
  const res = await fetch("/api/me?" + K + "=" + encodeURIComponent(userKey));
  const data = await res.json();
  if (!res.ok) {
    document.getElementById("status").textContent = data.error || "加载失败";
    return;
  }
  document.getElementById("status").textContent = "注册成功，可以购买并使用服务。";
  document.getElementById("emailCard").hidden = false;
  document.getElementById("emailCard").textContent = "邮箱: " + data.email;
  document.getElementById("balanceCard").hidden = false;
  document.getElementById("balanceCard").textContent = "Token 余额: " + data.token_balance;
  document.getElementById("tokenCard").hidden = false;
  document.getElementById("tokenCard").textContent = "访问密钥: " + data[K];
  document.getElementById("chatBtn").hidden = false;
  document.getElementById("buyBtn").hidden = false;
  document.getElementById("buyBtn").onclick = async () => {
    const body = {};
    body[K] = data[K];
    const checkoutRes = await fetch("/api/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const checkoutData = await checkoutRes.json();
    if (!checkoutRes.ok) { alert(checkoutData.error || "创建支付失败"); return; }
    location.href = checkoutData.url;
  };
}
loadProfile();
`.trim();
