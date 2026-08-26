// 途牛机票桥接服务（零依赖 Node HTTP 服务）
// 用途：把 tuniu CLI（需要 TUNIU_API_KEY，仅存服务端）包装成同机 HTTP 接口，
// 供 VPS nginx 的 /api/flight/ 反向代理转发给浏览器。
//
// 运行：TUNIU_API_KEY=... node scripts/travel-bridge/server.mjs
// 监听：127.0.0.1:8787
// 接口：POST /flight  {"departureCityName","arrivalCityName","departureDate"}
//       GET  /health
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// 自包含环境加载：优先读取同目录 .env（compose 的 env_file 在部分宿主上不生效）
function loadDotEnv(path) {
  try {
    if (!existsSync(path)) return;
    for (const line of readFileSync(path, "utf-8").split("\n")) {
      const match = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line.trim());
      if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2];
    }
  } catch {
    // 环境文件不可读时沿用现有环境变量
  }
}
const bridgeDir = dirname(fileURLToPath(import.meta.url));
loadDotEnv(join(bridgeDir, ".env"));

const PORT = Number(process.env.BRIDGE_PORT ?? 8787);
const localTuniu = join(bridgeDir, "node_modules", ".bin", "tuniu");
const TUNIU_BIN = process.env.TUNIU_BIN ?? (existsSync(localTuniu) ? localTuniu : "tuniu");
const TUNIU_TIMEOUT_MS = Number(process.env.TUNIU_TIMEOUT_MS ?? 45000);

function runTuniu(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(TUNIU_BIN, args, {
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("途牛查询超时，请稍后再试"));
    }, TUNIU_TIMEOUT_MS);
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", (error) => reject(new Error(`无法启动途牛服务: ${error.message}`)));
    child.on("close", (code) => {
      clearTimeout(timer);
      // 途牛 CLI 对业务失败（如无航班）会以非零码退出，但 stdout 仍是合法 JSON：
      // 优先解析 stdout，能解析就把业务结果原样上抛，由调用方判断。
      try {
        resolve(JSON.parse(stdout));
        return;
      } catch {
        // 继续走错误分支
      }
      const message = (stderr || stdout || "").trim().slice(0, 300) || `途牛服务退出码 ${code}`;
      reject(new Error(message));
    });
  });
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) reject(new Error("请求体过大"));
    });
    req.on("end", () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new Error("请求体不是合法 JSON")); }
    });
    req.on("error", reject);
  });
}

function send(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(payload));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const pathname = url.pathname.replace(/\/+$/, "") || "/";
  if (req.method === "GET" && pathname === "/health") {
    send(res, 200, { ok: true, service: "tuniu-flight-bridge" });
    return;
  }
  if (req.method === "OPTIONS") {
    send(res, 204, {});
    return;
  }
  if (req.method === "POST" && (pathname === "/flight" || pathname === "/")) {
    try {
      const body = await readJson(req);
      const departureCityName = String(body.departureCityName ?? "").trim();
      const arrivalCityName = String(body.arrivalCityName ?? "").trim();
      const departureDate = String(body.departureDate ?? "").trim();
      if (!departureCityName || !arrivalCityName || !departureDate) {
        send(res, 400, { success: false, error: { code: 103, message: "缺少出发城市、到达城市或出发日期" } });
        return;
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(departureDate)) {
        send(res, 400, { success: false, error: { code: 103, message: "日期格式应为 YYYY-MM-DD" } });
        return;
      }
      const raw = await runTuniu([
        "call", "flight", "searchLowestPriceFlight",
        "-a", JSON.stringify({ departureCityName, arrivalCityName, departureDate }),
      ]);
      if (raw && raw.success === true) {
        // 解析途牛 MCP 的 content[0].text 内层 JSON
        let flights = [];
        try {
          const content = raw.result?.content ?? [];
          for (const block of content) {
            if (block?.type === "text" && typeof block.text === "string") {
              const inner = JSON.parse(block.text);
              if (Array.isArray(inner?.data)) flights = inner.data;
              break;
            }
          }
        } catch {
          flights = [];
        }
        send(res, 200, { success: true, data: flights });
        return;
      }
      // 途牛对无航班航线常见返回 "terminated"：按空结果处理，而不是报错
      const rawErrorMessage = String(raw?.error?.message ?? "");
      if (/terminated|no flight|no result|empty/i.test(rawErrorMessage)) {
        send(res, 200, { success: true, data: [], hint: "该航线暂无航班数据" });
        return;
      }
      const error = raw?.error ?? {};
      send(res, 502, { success: false, error: { code: error.code ?? 199, message: error.message ?? "途牛查询失败" } });
    } catch (error) {
      send(res, 502, { success: false, error: { code: 199, message: error instanceof Error ? error.message : "查询失败" } });
    }
    return;
  }
  send(res, 404, { success: false, error: { code: 404, message: "未知接口" } });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`tuniu-flight-bridge listening on 127.0.0.1:${PORT}`);
});
