---
title: 在 vps 上配合 caddy 部署 siteproxy
date: 2023-02-01 22:33:53
description: 本文将详细介绍如何在 VPS 上使用 Caddy 部署 SiteProxy 开源反代工具，替代官方推荐的 Nginx 方案。内容涵盖从安装 Node.js、下载并精简 SiteProxy 核心文件、配置 Caddy 反向代理，到修改默认首页、设置 Systemd 自启动服务，以及可选的安全加固步骤，如添加访问密码和限制端口公网访问。适合希望在 Arch Linux 环境下快速搭建私有反代服务，并追求轻量、可控部署方案的用户阅读。
sticky:
tags:
- OpenSource Project
- siteproxy
- Archlinux
- nodejs
- Caddy
---

之前趁着春节活动的时候在某 vps 服务商买了 1 年的 vps，线路不算太好，但勉强够用，于是打算在上面部署一些反代程序。在群友的推荐下，发现了这款名为 [siteproxy](https://github.com/netptop/siteproxy) 的开源项目。

siteproxy 相较于我在 `r.zhullyb.top` 部署的那个反代，其特点是可以运行在 vps 上，且将会替换被反代页面上的所有 url，因此遇到使用相对路径的网页也可以从容应对。

在项目的 README 中介绍了一种部署方案，但我仍有以下几点不太满意

- README 中的方案仅支持 nginx 部署，但我希望使用 caddy
- README 中的方案使用 npm 安装了 `forever` 来达到保活的目的，甚至为此安装了 nvm，但我一不希望使用 npm 在系统上安装软件、二不希望安装 nvm 与 forever
- 原项目把根目录页做成了一个导航，指向了一些比较敏感的站点，而我希望换掉这个网页。

因此这篇博客也就应运而生。

## 反代 8011 端口

根据项目 README 的描述，我们应当使用 nginx 去反代 `127.0.0.1:8011` 端口，但我是 caddy 用户，此前也[有过使用 caddy 反代](/2022/05/30/use-caddy-to-proxy-wikipedia/)的经验，所以很容易写出一段使得程序可以正确运行的 `Caddyfile`。

```nginx
example.com {
        reverse_proxy   127.0.0.1:8011 {
                header_up Host {upstream_hostport}
                header_up X-Real-IP {http.request.remote.host}
                header_up X-Forwarded-For {http.request.remote.host}
                header_up X-Forwarded-Port {http.request.port}
                header_up X-Forwarded-Proto {http.request.scheme}
                header_up Accept-Encoding identity
        }
}
```

将 `example.com` 的 A 记录解析到 vps 主机的 ip，并使用 `systemctl` 重新启动 caddy，这一步就算完成了。

## 安装 nodejs

我在 vps 上安装的发行版是 Archlinux，所以直接 `pacman -S nodejs` 安装完就是了，别的发行版应该也可以直接调用系统默认的包管理器安装 `node` 或者 `nodejs` 完成这一步。

## 下载程序

首先，我们需要一个地方来存放我们下载的程序，我使用的是 `/opt` 路径。

我们可以直接根据 README 所说的，直接 clone 整个项目，但我本人并不想这么做，项目里似乎有太多对于 vps 用户没有用的东西了。此外，整个项目首页我也不想要，首页的导航指向了一些比较敏感的网站，而我的反代就想安安心心的一个人用。

综合以上需求，我所需要的文件一共就五个: 

```bash
├── config.js
├── index.js
├── logger.js
├── package.json
└── Proxy.js
```

```bash
mkdir -p /opt/siteproxy
cd /opt/siteproxy
wget https://raw.githubusercontent.com/netptop/siteproxy/master/{config.js,index.js,logger.js,package.json,Proxy.js}
```

然后补上一个 `index.html`

我这边选择直接使用 JavaScript 将对于 / 的访问直接重定向到我的博客。

```javascript
<html><head><meta http-equiv="refresh" content="0; url=https://zhul.in/" /></head><body>Redirect to <a href="">https://zhul.in/</a></body></html>
```

### 安装依赖

在 `/opt/siteproxy` 目录下执行

```bash
npm install
```

npm 将会根据 `package.json` 的内容自动安装所需的依赖。

## 修改配置文件

```bash
$EDITOR /opt/siteproxy/config.js
```

按照 README 所说，修改 `serverName` 字段

![需要修改的 serverName 字段](https://static.031130.xyz/uploads/2024/08/12/63da866e26712.webp)

## 设置开机自启动

这里我选择使用 systemd 帮助我实现 siteproxy 程序的开机自启动，service 文件是我直接根据 frp 程序提供的 service 改的。

```
cat /usr/lib/systemd/system/siteproxy.service 
-----
[Unit]
Description=SiteProxy
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=nobody
Restart=on-failure
RestartSec=5s
Environment="NODE_PATH=/opt/siteproxy/"
ExecStart=node --tls-min-v1.0 /opt/siteproxy/index.js 

[Install]
WantedBy=multi-user.target
```

随后使用 `systemctl enable siteproxy --now` 启动即可访问。

## 为反代站点添加访问密码（可选）

参考[我的另一篇博客](/2021/10/21/picuploader-on-archlinux-with-caddy/#%E8%AE%BE%E7%BD%AE%E8%AE%BF%E9%97%AE%E5%AF%86%E7%A0%81%EF%BC%88%E5%8F%AF%E9%80%89%EF%BC%89)。

## 使用防火墙程序禁止 8011 的公网访问（可选）
