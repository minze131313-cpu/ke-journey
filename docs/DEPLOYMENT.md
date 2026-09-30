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

**compose 已入库：[`docs/ke-journey-compose.yml`](ke-journey-compose.yml)**，用仓库自带助手发布：

```bash
HOSTINGER_TOKEN=$(cat ~/.hostinger_token) \
  node scripts/hostinger-docker.mjs deploy contentful-demo docs/ke-journey-compose.yml STATIC_RELEASE_READY 900
```

> 坑：`contentful-demo` 项目会**保留历史日志**，日志轮询若只匹配 `STATIC_RELEASE_READY`
> 前缀，会命中上一次发布的旧 marker 而误判成功。传入带日期的 marker
> （如 `STATIC_RELEASE_READY_20260930`）或核对 `git rev-parse HEAD` 输出的 commit 是否为本次要发布的提交。
>
> `next build` 默认会跑 TS 类型检查；仓库历史上有与本功能无关的类型错误，
> 因此 compose 里沿用历史上线时的 `typescript.ignoreBuildErrors` + `eslint.ignoreDuringBuilds`
> （日志表现为 `Skipping validation of types`）。

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

## Travel Story 独立部署（原域名 /travel-story/ 目录）

`travel-story` 分支的 `travel-story/` 子目录是 Travel Story 旅行影片工具
（Next.js 15 带服务端 API）。与静态主站不同，它需要 Node 常驻进程，但对外
仍走**同一个二级域名下的独立目录**：`https://ke-journey.bordy.cn/travel-story/`。

- 应用通过 `NEXT_PUBLIC_BASE_PATH=/travel-story` 同时驱动 next.config 的
  `basePath` 与客户端 API 前缀（`travel-story/lib/base.ts`），构建与运行时
  都必须带这个变量（写在 `/opt/travel-story/.env.local` 中）。
- 进程：Hostinger API 方式 A 起 Docker 项目 `ke-journey-travel-story`
  （compose 见仓库 `docs/travel-story-compose.yml`），`network_mode: host`、
  监听 `127.0.0.1:3001`，`apk add ffmpeg` 提供成片能力；日志出现
  `TRAVEL_STORY_READY` 即完成。代码在 `/opt/travel-story-src/repo`，
  数据（行程/素材/录像）在 `/opt/travel-story-src/repo/travel-story/data/`，
  升级前备份；重新触发该 Docker 项目会自动拉取分支最新提交并重建。
- nginx：在 `ke-journey.bordy.cn.conf` 追加（置于静态 location 之前，`^~` 保证
  前缀优先于 `.css/.js` 的 regex 缓存规则；**前缀不带尾斜杠**——Next 会把
  `/travel-story/` 308 到 `/travel-story`，带斜杠的 location 接不住）：
  ```nginx
  location ^~ /travel-story {
      proxy_pass http://127.0.0.1:3001;
      proxy_http_version 1.1;
      proxy_set_header Host $host;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
      proxy_read_timeout 600s;
      client_max_body_size 600m;   # 素材与录像上传
  }
  ```
  修改后 `nginx -t` 校验并重启 VPS；2026-08-31 起实测可用
  SSH（22 端口已恢复）直接 `systemctl reload nginx` 优雅热载，无需重启整机。
- 互链：主站 `NEXT_PUBLIC_TRAVEL_STORY_URL=https://ke-journey.bordy.cn/travel-story/`
  （已为默认值），工具 `NEXT_PUBLIC_KEJOURNEY_URL=https://ke-journey.bordy.cn/`。
- 上线验证：`curl https://ke-journey.bordy.cn/travel-story` 200；
  `curl https://ke-journey.bordy.cn/travel-story/api/trips` 200；
  首页 HTML 含 `/travel-story/_next/` 资源引用。
- 安全：上游业务 API 无登录校验，只监听内网并由可信反代暴露。

## 上线验证清单

```bash
curl -s https://ke-journey.bordy.cn/robots.txt | head        # 纯文本 robots
curl -s https://ke-journey.bordy.cn/sitemap.xml | grep -c '<loc>'  # 89 条 URL（2 条旅程）
curl -s -o /dev/null -w "%{http_code}" https://ke-journey.bordy.cn/nonexistent  # 404
curl -s -o /dev/null -w "%{http_code} %{redirect_url}" https://ke-journey.bordy.cn/poi/mogao  # 301
curl -s https://ke-journey.bordy.cn/ | grep -c '国庆广西'          # ≥1（首页新旅程卡片）
curl -s https://ke-journey.bordy.cn/qinggan-loop/ | grep -c '高德交互地图'  # ≥1（既有旅程未回归）
curl -s https://ke-journey.bordy.cn/guangxi-hk/ | grep -c '完整行程总览'    # ≥1（线性行程文案）
curl -s https://ke-journey.bordy.cn/guangxi-hk/poi/asiaworld-expo/ | grep -c 'detail-expo'  # ≥1（展会分类样式）
curl -s -o /dev/null -w "%{http_code}" https://ke-journey.bordy.cn/detail/opt/qinghai.1080.webp  # 200
```

> 注意：`/guangxi-hk/` 是地图页，页面本身**没有 `<img>`**（底图与图钉由高德 Canvas 渲染），
> 因此不能拿它检查 `type="image/webp"`；WebP `<picture>` 只出现在首页卡片与图文详情页。

## 故障处置：全站打不开（nginx 未运行）

**2026-09-30 实际发生过一次**，处置流程已固化为两个一次性容器。

### 症状与判定

浏览器 `ERR_CONNECTION_RESET`，`bordy.cn` 与 `ke-journey.bordy.cn` **同时**打不开，
但 `ping 187.77.25.70` 通、22 端口通 → **不是网络问题，是服务器上的 nginx 停了**：

```bash
nc -z -G 6 187.77.25.70 80    # 不通
nc -z -G 6 187.77.25.70 443   # 不通
nc -z -G 6 187.77.25.70 22    # 通 —— 机器活着
```

注意 3001（Travel Story）与 8787（途牛桥接）**本来就不对外**（监听 127.0.0.1），
它们不通不代表异常。

### 本次根因（journalctl）

```
nginx[200460]: [emerg] host not found in upstream
  "1439498936-460a7b6oqn.ap-guangzhou.tencentscf.com" in
  /etc/nginx/sites-enabled/ke-journey.bordy.cn.conf:25
systemd[1]: nginx.service: Failed with result 'exit-code'.
```

`/api/` 那段 `proxy_pass` 用的是**外部域名**，nginx 在**加载配置时**就要解析它。
06:47:49 那次（重）启动赶上 DNS 抖动 → `nginx -t` 失败 → 服务起不来 → 全站 500/连接重置。
机器本身没问题：uptime 29 天、磁盘 9%、无 OOM、`nginx.service` 本来就是 `enabled`。

### 处置步骤

```bash
cd <repo>
# 1) 只读探针：nginx 进程 / 监听 / 磁盘 / 内存 / 当前 release
HOSTINGER_TOKEN=$(cat ~/.hostinger_token) \
  node scripts/hostinger-docker.mjs deploy kej-probe docs/probe-compose.yml PROBE_DONE 300
HOSTINGER_TOKEN=$(cat ~/.hostinger_token) \
  node scripts/hostinger-docker.mjs logs kej-probe 80

# 2) 抢修：nsenter 进宿主 → nginx -t → systemctl start nginx → 本地自测
HOSTINGER_TOKEN=$(cat ~/.hostinger_token) \
  node scripts/hostinger-docker.mjs deploy kej-repair docs/repair-compose.yml REPAIR_DONE 300
HOSTINGER_TOKEN=$(cat ~/.hostinger_token) \
  node scripts/hostinger-docker.mjs logs kej-repair 60

# 3) 用完注销（异步，约 10 秒后从列表消失）
for p in kej-probe kej-repair; do
  curl -s -X DELETE -H "Authorization: Bearer $(cat ~/.hostinger_token)" \
    "https://developers.hostinger.com/api/vps/v1/virtual-machines/1369858/docker/$p/down"
done

# 4) 外部复测
for p in / /guangxi-hk/ /qinggan-loop/ /sitemap.xml; do
  curl -s -o /dev/null -w "$p %{http_code}\n" "https://ke-journey.bordy.cn$p"
done
```

> 两个 compose 里所有 shell 变量都写成 `$$VAR`：写成 `$VAR` 会被 Docker Compose
> 插值成空字符串，`$$NS systemctl ...` 会退化成在容器里跑 `systemctl` → `not found`，
> 看起来像"宿主机没有 systemctl"，实际是变量被吃掉了（本项目已踩过一次）。

### 尚未修掉的隐患（建议尽快处理）

`ke-journey.bordy.cn.conf` 的 `/api/` 块在**配置加载期**解析外部域名，
DNS 一抖动 nginx 就起不来。彻底修法是改成**运行时解析**：

```nginx
location /api/ {
    resolver 127.0.0.53 valid=30s;          # 用宿主 systemd-resolved
    set $rollinggo https://1439498936-460a7b6oqn.ap-guangzhou.tencentscf.com;
    proxy_pass $rollinggo;                   # 变量形式 → 请求时才解析
    ...
}
```

**改动该文件需要用户明确同意**（内含业务 token，且是主站唯一入口）。

## 凭证与安全

- 高德 Key 与安全密钥：VPS `/opt/contentful-demo/.env.local`（构建时注入）、
  本地 `.env.local`、Codex 环境变量，三处需保持一致。
- Hostinger API Token 具备 VPS 管理权限，泄露后立即在
  hPanel → Profile → API 重置。
- SSH：22 端口 TCP 可连，但本机未授权密钥（`Permission denied (publickey,password)`），
  日常维护走 API + 一次性容器（见上）；2026-08-31 曾短暂可用过。
