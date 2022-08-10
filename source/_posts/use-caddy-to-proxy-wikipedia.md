---
title: 使用caddy反向代理维基百科中文站点
date: 2022-05-30 08:59:21
sticky:
tags:
- Caddy
---

反代的目的无非是两点

- 满足自己在无代理情况下访问无法访问的站点的需求
- 方便将站点分享给亲朋好友。

一直以来，我都想用 caddy 去反代一份维基百科来用，今天刚好就顺手解决了。

## 注意事项

- 用于反代的机子需要有对目标站点的访问能力
- 最好准备一个新的域名作为白手套，防止被污染
- 建议增加密码保护，一来使得小鸡流量不被滥用，二来防止防火墙检测到站点内容
- 本文使用的 caddy 开启了 `replace_response` 插件，可以使用 `xcaddy` 编译或直接前往 https://caddyserver.com/download 勾选相应插件后下载。安装时，建议先根据官方文档安装原版 caddy，再用启用了 `replace_response` 插件的 caddy 二进制文件覆盖掉原版 caddy，这样就不需要去手写 systemd 相关的文件了。

## Caddyfile

```nginx
{
        order replace after encode
}

https://zhwiki.example.com {

        reverse_proxy * https://zh.wikipedia.org {
                header_up Host {upstream_hostport}
                header_up X-Real-IP {http.request.remote.host}
                header_up X-Forwarded-For {http.request.remote.host}
                header_up X-Forwarded-Port {http.request.port}
                header_up X-Forwarded-Proto {http.request.scheme}
                header_up Accept-Encoding identity
                header_down location (https://zh.wikipedia.org/)(.*) https://zhwiki.example.com/$2
                header_down location (https://zh.m.wikipedia.org/)(.*) http://m.zhwiki.example.com/$2
        }

        replace {
                "upload.wikimedia.org" "up.zhwiki.example.com"
                "zh.wikipedia.org" "zhwiki.example.com"
                "zh.m.wikipedia.org" "m.zhwiki.example.com"
        }
}

https://m.zhwiki.example.com {

        reverse_proxy * https://zh.m.wikipedia.org {
                header_up Host {upstream_hostport}
                header_up X-Real-IP {http.request.remote.host}
                header_up X-Forwarded-For {http.request.remote.host}
                header_up X-Forwarded-Port {http.request.port}
                header_up X-Forwarded-Proto {http.request.scheme}
                header_up Accept-Encoding identity
                header_down location (https://zh.wikipedia.org/)(.*) https://zhwiki.example.com/$2
                header_down location (https://zh.m.wikipedia.org/)(.*) http://m.zhwiki.example.com/$2
        }

        replace {
                "upload.wikimedia.org" "up.zhwiki.example.com"
                "zh.wikipedia.org" "zhwiki.example.com"
                "zh.m.wikipedia.org" "m.zhwiki.example.com"
        }
}

https://up.zhwiki.example.com {
        reverse_proxy * https://upload.wikimedia.org {
                header_up Host {upstream_hostport}
                header_up X-Real-IP {http.request.remote.host}
                header_up X-Forwarded-For {http.request.remote.host}
                header_up X-Forwarded-Port {http.request.port}
                header_up X-Forwarded-Proto {http.request.scheme}
                header_up Accept-Encoding identity
        }
}

```

## 简单解释

第一大段是启用 `replace_response` 插件的部分，直接照抄即可。

第二和第三大段的思路是一致的，分别反向代理了 PC 端和移动段的网页。两行 ` header_down` 的写法是受到了知乎上那篇 Github 反代的启发，避免了源站发出 302 重定向时访客被带到源站去。replace 部分不用多说，就是将针对三个源站域名的请求改到反代站域名。

第四大段就是中规中举地反代了 `upload.wikimedia.org` 这个域名，上面存放的大多数是媒体文件，如果条件允许的话其实可以考虑使用多个服务器反代。

密码保护在我这份 Caddyfile 中没有启用，如果有需要的话可以参考我的[另一篇博客](/2021/10/21/picuploader-on-archlinux-with-caddy/#设置访问密码（可选）)。

## 参考资料

[Caddy 官方文档](https://caddyserver.com/docs/)
[The Road to Serfdom——如何为GitHub搭建反向代理](https://zhuanlan.zhihu.com/p/476390779)
[使用 Caddy 配置 Wikipedia 反向代理](https://ichon.me/post/1026.html)
[使用 Caddy 反代 ghcr.io](https://learningman.top/archives/365)

*所有参考资料除官方文档外均使用 web.archive.org 和 archive.ph 进行存档，如有无法访问的情况，请自行前往存档站获取历史存档。*

