---
title: 小记 —— Caddy 在 Layer 4 上的流量代理实践
date: 2025-12-10
sticky:
tags:
- Caddy
- Network
---

## 背景

在我的一台优化线路 vps 上，我的 443 端口要承担两个职责

1. 作为我博客对中国大陆境内访客的服务提供者，同时承担 https 流量加解密和 static server 的职责
2. 把某些特殊用途的流量特征通过一些手段伪装成某些知名、常见、且被广泛允许的站点的 https 流量 <span class="heimu">（没错，是 Reality）</span>

因此，我需要一个能够在同一台服务器的同一端口上同时处理这两种职责的方案。

## 方案选择

其实我很早就知道 Nginx 的 stream 关键词可以实现 Layer 4 （即 TCP 字节流原样转发）下基于 SNI 识别实现的分流功能，但我其实一直是 Caddy 的忠实用户，写了不少 [Caddy 相关的博文](/tags/Caddy/)。因此，尽管 Nginx 在不久前已经支持了 ACME v2，但 Caddyfile 的简洁和易用性依然让我更倾向于使用 Caddy 来实现这个功能。

经过一番查阅，Caddy 最新版本（v2.10）并不支持 Layer 4 的流量代理功能，但有一个名为 [caddy-l4](https://github.com/mholt/caddy-l4) 的社区模块可以实现这个功能，在 Github 上有 1.5k stars，且最近也有更新维护，于是我决定尝试使用这个模块来实现我的需求。

## 安装

尽管 Caddy 官方提供的 APT 源中的 Caddy 版本并不包含 caddy-l4 模块，但我仍然建议先通过 APT 安装 Caddy 的基础版本，然后再通过 Caddy 官方提供的[在线构建](https://caddyserver.com/download)页面选择需要的模块来生成自定义的 Caddy 二进制文件，下载后替换掉系统中的 Caddy 可执行文件。这样做的好处是可以方便地完成 systemd 服务的配置。但注意关闭 Caddy 的 APT 源，以免后续自动更新覆盖掉自定义编译的版本。

后续更新可以通过

```bash
caddy upgrade
```

命令来完成，caddy 会自动列出当前二进制文件所包含的模块，并自动触发官网的在线构建来生成新的二进制文件并进行替换，只需手动重启 systemd 服务即可完成更新。

如果 Caddy 官方提供的在线构建失败（最近挺不稳定的），可以[参考文档](https://caddyserver.com/docs/build#xcaddy)使用 xcaddy 在本地编译 Caddy：

```bash
xcaddy build --with github.com/mholt/caddy-l4
```

## 配置

这是我先前博客站点的 Caddyfile 配置：

```
zhul.in {
    root * /var/www/zhul.in

    encode zstd gzip
    file_server

    handle_errors {
            rewrite * /404.html
            file_server
    }
}

www.zhul.in {
    redir https://zhul.in{uri}
}
```

zhul.in 和 www.zhul.in 都占用了 80 和 443 端口，因此需要把这两个站点的 443 端口的监听改到其他端口，把 443 端口交给 caddy-l4 来处理。

修改后的 Caddyfile 如下：

```
http://zhul.in:80, https://zhul.in:8443 {
    root * /var/www/zhul.in

    encode zstd gzip
    file_server

    handle_errors {
            rewrite * /404.html
            file_server
    }
}

http://www.zhul.in:80, https://www.zhul.in:8443 {
    redir https://zhul.in{uri}
}
```

随后，添加 caddy-l4 的配置：

```
{
    layer4 {
        :443 {
            @zhulin tls sni zhul.in www.zhul.in
            route @zhulin {
                proxy 127.0.0.1:8443
            }

            @proxy tls sni osxapps.itunes.apple.com
            route @proxy {
                proxy 127.0.0.1:20443
            }
        }
    }
}
```

这里的写法还挺简单的，首先在 `layer4` 块中监听 443 端口，然后通过 `@name tls sni domain` 的方式定义基于 SNI 的匹配规则，随后通过 `route @name` 定义匹配到该规则时的处理方式，这里使用 `proxy ip:port` 来实现流量的转发。

由于我的妙妙流量伪装成了 Apple 的 itunes 流量，因此在上面的配置中的 SNI 特征是 `osxapps.itunes.apple.com`，这些流量会被转发到本地的 20443 端口，由另一个奇妙服务来处理。

caddy-l4 还提供了一些其他的匹配方式和处理方式，具体可以参考他们在 Github 中给到的 [examples](https://github.com/mholt/caddy-l4/tree/master/docs/examples)。

完成配置后，重启 Caddy 服务：

```bash
sudo systemctl restart caddy
```

## 参见
- [mholt/caddy-l4: Layer 4 (TCP/UDP) app for Caddy](https://github.com/mholt/caddy-l4)
- [Build from source — Caddy Documentation](https://caddyserver.com/docs/build)
