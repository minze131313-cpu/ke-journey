# 部署架构（Hostinger VPS）

> 线上地址：https://ke-journey.bordy.cn
> 本文档记录 2026-08-26 实测确认的部署链路。改动部署方式时请同步更新。

## 拓扑

```
GitHub (minze131313-cpu/ke-journey)
        │  git clone（部署容器内）
        ▼
Hostinger VPS (KVM 2 · Ubuntu 24.04 · IP 187.77.25.70)
  ├─ /opt/contentful-demo/           ← 历史工作副本（无 .git，含 .env.local）
  ├─ /opt/ke-journey-src/repo/       ← 每次部署的干净浅克隆
  ├─ Docker 项目 contentful-demo     ← 一次性构建容器（node:22-alpine）
  │     构建：npx next build（output:"export" + trailingSlash）
  └─ /var/www/ke-journey.bordy.cn/
        ├─ releases/<时间戳>/         ← 不可变发布目录
        └─ current → releases/<ts>    ← nginx 根目录软链
        │
nginx (host, 1.24.0) → /var/www/ke-journey.bordy.cn/current
  ├─ 静态文件 7 天缓存
  ├─ 未知路径 → 404 + /404.html（中文品牌 404）
  └─ 旧链接 /route/:day、/poi/:id → 301 到 /qinggan-loop/...
```

- 域名 DNS 在**阿里云**（dns29/dns30.hichina.com），A 记录直指 VPS IP。
- HTTPS 为 Let's Encrypt（Certbot 自动续期，nginx 配置中 `# managed by Certbot` 段不可动）。
- VPS 上还有 spark-toys、v0-first、v0-latest 等其他站点，**只允许修改 `ke-journey.bordy.cn.conf`**。

## 发布方式

### 方式 A：Hostinger API 一键发布（AI/脚本用）

无需 SSH。通过 [Hostinger API](https://developers.hostinger.com) 的 Docker Manager
把构建容器跑起来即可，流程即本文档顶部的拓扑：

1. `POST /api/vps/v1/virtual-machines/{vpsId}/docker`
   `{project_name: "contentful-demo", content: <docker-compose.yml>}` —— compose 内容为：
   - 挂载 `/opt/contentful-demo:/app`（读 `.env.local`）、`/var/www/ke-journey.bordy.cn:/site`、`/opt/ke-journey-src:/src`
   - 命令：浅克隆本仓库 → 复制 `.env.local` → 写入静态导出 next.config.mjs →
     `npm ci` → `npx next build` → 拷贝到 `releases/<ts>/` → 切换 `current` 软链
2. 轮询 `GET .../docker/contentful-demo/logs` 直到出现 `STATIC_RELEASE_READY_<ts>`。
3. 上线验证（见下文清单）。

发布命令模板（Python）：

```python
payload = {"project_name": "contentful-demo", "content": COMPOSE_YAML}
# COMPOSE_YAML 要点：
#   image: node:22-alpine, working_dir 固定 /src
#   git clone --depth 1 https://github.com/minze131313-cpu/ke-journey.git /src/repo
#   cp /app/.env.local /src/repo/.env.local
#   写入 next.config.mjs（output:"export", trailingSlash:true, images.unoptimized）
#   npm ci && npx next build && cp -a out/. /site/releases/<ts>/ && ln -sfn releases/<ts> /site/current
```

### 方式 B：Codex 网页发布（用户手动）

在 Codex 网页项目（`.openai/hosting.json` 中 appgpr_6a8c…）点发布，
Codex 通过 Hostinger API 执行同样的 docker compose 构建。
注意：Codex 会整体重写 compose 内容，不影响 `/etc/nginx` 配置。

## nginx 关键配置（sites-available/ke-journey.bordy.cn.conf）

```nginx
root /var/www/ke-journey.bordy.cn/current;

location ~ ^/route/([0-9]+)/?$ { return 301 /qinggan-loop/route/$1/; }
location ~ ^/poi/([a-z0-9-]+)/?$ { return 301 /qinggan-loop/poi/$1/; }

location / { try_files $uri $uri/ $uri.html =404; }
error_page 404 /404.html;

location ~* \.(?:css|js|jpg|jpeg|png|gif|webp|svg|ico|woff2?)$ {
  expires 7d;
  add_header Cache-Control "public, max-age=604800";
}
```

修改后必须让 nginx 重载。容器内无法向宿主 nginx 发信号，
当前做法：改配置 → `nginx -t`（nginx:1.24 容器校验）→ API 重启 VPS。
配置文件旁保留 `.bak-<时间戳>` 备份。

## 出行服务 API 反向代理（/api/ 与 /api/flight/）

酒店/民宿实时数据经同源 `/api/` 转发到 RollingGo 代理
（腾讯云函数 `https://1439498936-460a7b6oqn.ap-guangzhou.tencentscf.com`）；
航班数据走 `/api/flight/` 转发到本机**途牛桥接容器**（RollingGo 机票上游
自 2026-07-27 起暂停，途牛为现行机票数据源）。

### 途牛桥接（ke-journey-api 容器）

- 目录 `/opt/ke-journey-bridge/`：`server.mjs`（`scripts/travel-bridge/server.mjs`）
  + `node_modules`（tuniu-cli 1.0.9）+ `.env`（600 权限，含 `TUNIU_API_KEY` 与
  `TUNIU_BIN`）。桥接脚本自行加载 `.env`，不依赖 compose 注入。
- Docker 项目 `ke-journey-api`：`node:22-alpine` + `network_mode: host` +
  `restart: always`，监听 `127.0.0.1:8787`；重启 VPS 后自动恢复。
- nginx：`location /api/flight/ { proxy_pass http://127.0.0.1:8787/; }`
  （proxy_pass 带 `/` 会把路径重写为根，桥接同时接受 `/` 与 `/flight`）。
- 更新桥接：同步新 `server.mjs` 到 `/opt/ke-journey-bridge/` 后
  `docker/ke-journey-api/restart`。
- 途牛对无航班航线以非零码返回 `terminated`，桥接已归一化为空结果 + hint。

### RollingGo 酒店代理



```nginx
location /api/ {
    proxy_pass https://1439498936-460a7b6oqn.ap-guangzhou.tencentscf.com/;
    proxy_ssl_server_name on;
    proxy_set_header Host 1439498936-460a7b6oqn.ap-guangzhou.tencentscf.com;
    proxy_set_header X-Proxy-Token tp_8k2mX9vQ4z;   # 上游代理 token，仅存于 VPS nginx 配置
    proxy_set_header Content-Type application/json;
    if ($request_method = OPTIONS) { return 204; }
}
```

- 浏览器只访问同源 `/api/`，上游 token 不出现在前端代码与仓库中。
- 本地开发由 vite `server.proxy` 承担，token 从 `.env.local` 的
  `ROLLINGGO_PROXY_TOKEN` 读取（`vite.config.ts` 已配置）。
- 前端封装见 `app/lib/travel-api.ts`；上游接口类型：`hotel_search`、
  `hotel_detail`、`hotel_search_tags`（可用）与 `flight`、`flight_airport`
  （上游自 2026-07-27 起暂停升级，返回 SERVICE_UNAVAILABLE，恢复后无需改动）。
- 若上游代理地址/token 变更，同时更新：VPS nginx 配置、本地 `.env.local`、
  `app/lib/travel-api.ts` 注释与本文档。

## Travel Story 独立部署（travel-story/ 分支）

仓库 `travel-story` 分支含 `travel-story/` 子目录（Travel Story 旅行影片工具，
Next.js 15 带服务端 API），与静态主站不同：它需要 Node 进程常驻，**独立目录部署**：

```
VPS 独立目录 /opt/travel-story/
  ├─ repo/          ← 本仓库 travel-story 分支的 travel-story/ 子目录
  ├─ .env.local     ← GAODE_KEY / LOCATIONIQ_KEY / NEXT_PUBLIC_KEJOURNEY_URL
  └─ data/          ← 行程、素材、录像（升级前备份）
```

- 进程：`npm ci && npm run build` 后 `npm start -- -H 127.0.0.1 -p 3001`
  （用 systemd 常驻），不需要 ffmpeg 也能用规划与预览，成片需宿主机 ffmpeg。
- 域名：`travel-story.bordy.cn` 独立 server 块，nginx 反代 `127.0.0.1:3001`，
  `client_max_body_size 600m`（素材/录像上传）；主站 `NEXT_PUBLIC_TRAVEL_STORY_URL`
  与工具 `NEXT_PUBLIC_KEJOURNEY_URL` 互指。
- 数据同步：主站青甘环线行程是唯一数据源，改主站数据后跑
  `npm run sync:travel-story` 再构建发布（详见 travel-story/KEJOURNEY.md）。
- 安全：上游业务 API 无登录校验，只监听内网并由可信反代暴露。

## 上线验证清单

```bash
curl -s https://ke-journey.bordy.cn/robots.txt | head        # 纯文本 robots
curl -s https://ke-journey.bordy.cn/sitemap.xml | head       # XML，41 条 URL
curl -s -o /dev/null -w "%{http_code}" https://ke-journey.bordy.cn/nonexistent  # 404
curl -s -o /dev/null -w "%{http_code} %{redirect_url}" https://ke-journey.bordy.cn/poi/mogao  # 301
curl -s https://ke-journey.bordy.cn/qinggan-loop/ | grep -c 'type="image/webp"'  # ≥1
curl -s -o /dev/null -w "%{http_code}" https://ke-journey.bordy.cn/detail/opt/qinghai.1080.webp  # 200
```

## 凭证与安全

- 高德 Key 与安全密钥：VPS `/opt/contentful-demo/.env.local`（构建时注入）、
  本地 `.env.local`、Codex 环境变量，三处需保持一致。
- Hostinger API Token 具备 VPS 管理权限，泄露后立即在
  hPanel → Profile → API 重置。
- VPS 的 SSH 目前实测不可用（22 端口握手即断），日常维护走 API 或 hPanel。
