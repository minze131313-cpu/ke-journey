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

## 上线验证清单

```bash
curl -s https://ke-journey.bordy.cn/robots.txt | head        # 纯文本 robots
curl -s https://ke-journey.bordy.cn/sitemap.xml | head       # XML，39+ 条 URL
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
