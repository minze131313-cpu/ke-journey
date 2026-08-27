#!/usr/bin/env node
// 微信开发者工具 CLI 封装（路线二）
// 用法：npm run mp:<命令> -- [额外参数]
//   mp:open       打开 IDE 并加载 miniprogram/ 项目
//   mp:preview    生成预览二维码（默认 --qr-format terminal）
//   mp:upload     上传开发版本（需 -v <版本号> -d <描述>，且 project.config.json 已填真实 AppID）
//   mp:build-npm  构建 npm 依赖
//   mp:islogin    查询登录状态
//   mp:login      拉起 IDE 登录
//   mp:close      关闭项目
// 前置：开发者工具「设置 → 安全设置」开启服务端口；如设置了访问令牌，
//       用环境变量 WECHAT_DEVTOOLS_CLI_TOKEN 传入。

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projectPath = path.join(root, "miniprogram");

const CLI_CANDIDATES = [
  process.env.WECHAT_DEVTOOLS_CLI,
  "/Applications/wechatwebdevtools.app/Contents/MacOS/cli",
  "/Applications/微信开发者工具.app/Contents/MacOS/cli",
  "C:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat",
  "C:\\Program Files\\Tencent\\微信web开发者工具\\cli.bat",
].filter(Boolean);

const cli = CLI_CANDIDATES.find((p) => existsSync(p));

if (!cli) {
  console.error(
    "未找到微信开发者工具 CLI。请设置环境变量 WECHAT_DEVTOOLS_CLI 指向 cli 可执行文件。",
  );
  process.exit(1);
}

const cmd = process.argv[2];
const rest = process.argv.slice(3);

const COMMANDS = ["open", "preview", "auto-preview", "upload", "build-npm", "islogin", "login", "close", "quit", "cache", "auto", "auto-replay", "cloud"];
const NEEDS_PROJECT = new Set(["open", "preview", "auto-preview", "upload", "build-npm", "close", "auto", "cloud"]);

if (!cmd || !COMMANDS.includes(cmd)) {
  console.error(`用法：node scripts/devtools-cli.mjs <${COMMANDS.join("|")}> [参数]`);
  console.error("对应 npm 脚本：npm run mp:open / mp:preview / mp:upload / mp:build-npm / mp:islogin / mp:login / mp:close");
  process.exit(1);
}

const args = [cmd];
if (NEEDS_PROJECT.has(cmd) && !rest.some((a) => a === "--project")) {
  args.push("--project", projectPath);
}
args.push(...rest);

console.log(`$ ${cli} ${args.join(" ")}`);
const result = spawnSync(cli, args, { stdio: "inherit" });
process.exit(result.status ?? 1);
