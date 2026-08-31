// ============================================================
// Hostinger VPS Docker Manager 操作助手（方式 A 发布链路）
//
// 环境变量：
//   HOSTINGER_TOKEN    必填，hPanel → Profile → API 生成的 API Token
//   HOSTINGER_VPS_ID   可选，默认 1369858
//
// 用法：
//   node scripts/hostinger-docker.mjs vm-state
//   node scripts/hostinger-docker.mjs list
//   node scripts/hostinger-docker.mjs deploy <project> <compose.yml> [marker] [timeoutSec]
//   node scripts/hostinger-docker.mjs logs <project> [tail]
//   node scripts/hostinger-docker.mjs rm <project>
//   node scripts/hostinger-docker.mjs restart
// ============================================================

const TOKEN = process.env.HOSTINGER_TOKEN;
if (!TOKEN) {
  console.error("缺少 HOSTINGER_TOKEN 环境变量");
  process.exit(2);
}
const VPS = process.env.HOSTINGER_VPS_ID ?? "1369858";
const API = "https://developers.hostinger.com/api/vps/v1";
const DOCKER = `${API}/virtual-machines/${VPS}/docker`;

const headers = () => ({
  Authorization: `Bearer ${TOKEN}`,
  accept: "application/json",
  "content-type": "application/json",
});

async function req(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: headers(),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  if (!res.ok) {
    console.error(`[HTTP ${res.status}]`, JSON.stringify(json).slice(0, 500));
  }
  return { ok: res.ok, json };
}

const [cmd, ...args] = process.argv.slice(2);

if (cmd === "vm-state") {
  const { json } = await req("GET", `${API}/virtual-machines/${VPS}`);
  if (json && typeof json === "object") {
    console.log(json.state ?? JSON.stringify(json).slice(0, 200));
  }
} else if (cmd === "list") {
  const { json } = await req("GET", `${DOCKER}/`);
  console.log(JSON.stringify(json, null, 2).slice(0, 4000));
} else if (cmd === "deploy") {
  const [project, file, marker = "READY", timeoutSec = "900"] = args;
  if (!project || !file) {
    console.error("用法: deploy <project> <compose.yml> [marker] [timeoutSec]");
    process.exit(2);
  }
  const content = await import("node:fs").then((fs) => fs.readFileSync(file, "utf8"));
  const { ok, json } = await req("POST", DOCKER, { project_name: project, content });
  if (!ok) process.exit(1);
  console.log("deploy submitted:", JSON.stringify(json).slice(0, 200));

  // 轮询日志直到出现 marker 或超时
  const deadline = Date.now() + Number(timeoutSec) * 1000;
  let shown = 0;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 8000));
    const { json: logs } = await req("GET", `${DOCKER}/${project}/logs`);
    const entries = Array.isArray(logs) ? logs : [];
    for (let i = shown; i < entries.length; i++) {
      const e = entries[i];
      const line = typeof e === "string" ? e : e.entry ?? JSON.stringify(e);
      console.log(`[log] ${line}`);
    }
    shown = entries.length;
    if (entries.some((e) => JSON.stringify(e).includes(marker))) {
      console.log(`MARKER "${marker}" FOUND`);
      process.exit(0);
    }
  }
  console.error("TIMEOUT waiting for marker");
  process.exit(1);
} else if (cmd === "logs") {
  const [project, tail = "40"] = args;
  const { json } = await req("GET", `${DOCKER}/${project}/logs`);
  const entries = Array.isArray(json) ? json : [];
  for (const e of entries.slice(-Number(tail))) {
    const line = typeof e === "string" ? e : e.entry ?? JSON.stringify(e);
    console.log(line);
  }
} else if (cmd === "rm") {
  const [project] = args;
  const { ok, json } = await req("DELETE", `${DOCKER}/${project}/down`);
  console.log(ok ? "removed" : "failed", JSON.stringify(json).slice(0, 200));
} else if (cmd === "restart") {
  const { ok, json } = await req("POST", `${API}/virtual-machines/${VPS}/restart`);
  console.log(ok ? "restart sent" : "restart failed", JSON.stringify(json).slice(0, 200));
} else {
  console.error("未知命令:", cmd);
  process.exit(2);
}
