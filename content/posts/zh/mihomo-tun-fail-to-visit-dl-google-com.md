---
title: 我没法访问 dl.google.com —— 记一次 TUN 下的网络 debug
date: 2026-01-31
sticky:
tags:
- Network
- DNS
---

如果大家对目前中国大陆境内的网络环境足够了解，应该就会知道 `dl.google.com` 在很多情况下是**可以直连访问**的。比如，你可以通过 [google.cn/chrome/?standalone=1](https://google.cn/chrome/?standalone=1) 这个 URL 直接在境内的网络环境下下载 Chrome 的离线安装包，最终的下载域名就是 `dl.google.com`。

我平常的使用习惯是 24 小时开启代理工具的 TUN，让所有流量先经过一张虚拟网卡，再根据分流规则自动判断要不要走代理。这个习惯大部分时候都挺省心的——直到最近我用 `yay` 滚 Arch 的时候，突然遇到了 `dl.google.com` 的 SSL 连接建立失败。

![yay 更新失败](https://static.031130.xyz/uploads/2026/01/31/df5e547511070.webp)

而且不止是 `yay`，我的浏览器也返回了相同的结果：

![Firefox 访问失败](https://static.031130.xyz/uploads/2026/01/31/8ada158510aba.webp)

当时我的第一反应是：是不是我那套分流规则又抽风了？（毕竟不是我自己写的，出事先甩锅很合理。）

## 规则确实是直连，这锅甩不掉

我特意去查了分流规则，针对 SNI 为 `dl.google.com` 的流量是直连访问的。

![Mihomo的分流规则](https://static.031130.xyz/uploads/2026/01/31/96d27a20f2bf3.webp)

这就很奇怪了。按理说：

- `dl.google.com` 本身在国内网络环境里经常是能直连的
- 规则也明确写了 DIRECT

说实话，这个问题我之前也遇到过，但那时手上有优先级更高的事，就直接关掉代理工具绕过了它完成更新。好在我现在刚处理完手头事情，正处于无事可做的状态，于是决定认真把这个坑填了。

## 解析到海外 IP 了

我先把代理工具的 `fake-ip` 关掉，换成真实 IP 解析（避免再引入额外变量），然后用 `curl -vv` 去访问 `dl.google.com` 的下载链接，看看它到底要连到哪里去。

![curl -vv 的访问结果](https://static.031130.xyz/uploads/2026/01/31/d3dbfc513de9f.webp)

现在回头看我能很笃定地说：这里解析出来的这个 IP 来自 Google 的海外 CDN，而不是国内机房/国内可达的那一类。

![image-20260131070318960](https://static.031130.xyz/uploads/2026/01/31/7ba8a0b8a2579.webp)

如果大家不清楚的话：`dl.google.com` 针对国内访客的 DNS 解析结果，很多时候会返回国内可达的 IP（否则你也没法在境内直连下载）。而这里返回的这个海外 IP 在我这条网络上是不可达的；再加上我在喵喵工具里给 `dl.google.com` 配的是直连，于是就变成了：

> DNS 给了一个「海外 IP」  
>
> + 规则要求 DIRECT
>   = 直连到一个我连不上的地方
>   = TLS 握手失败

所以这并不是「直连规则没生效」，而更像是：**规则生效得非常彻底，但 DNS 把我带沟里了。**

## 谁在负责回答 dl.google.com？

Mihomo 内核目前的 DNS 配置项主要是下面四个：

1. `nameserver`: 默认解析服务器（大部分域名都走这里）
2. `direct-nameserver`: 直连域名的解析服务器（较新版本才有）
3. `proxy-server-nameserver`: 节点域名解析（跟这次没啥关系）
4. `default-nameserver`: 用来解析 DNS 配置里「域名形式」的 nameserver（也先不展开）

`dl.google.com` 被规则指定为直连域名，所以 Mihomo 理论上应该优先参考 `direct-nameserver`；如果没设置，就回落到 `nameserver`。

而我当时的 `nameserver` 配置是：

- `https://dns.alidns.com/dns-query`

我当时的直觉很简单：既然解析结果像是从海外 CDN 池里出来的，那就先验证一下是不是这条阿里 DNS（DoH）返回的就是海外 IP。

## 直接查阿里 DoH，确实回了海外池

阿里 DoH 提供了一个 JSON 查询接口，所以我直接用 curl 去请求：

```bash
curl -s 'https://dns.alidns.com/resolve?name=dl.google.com&type=A'
```

![DoH 解析结果](https://static.031130.xyz/uploads/2026/01/31/b457af9299330.webp)

返回的 IP 就是我之前遇到的那个海外 IP。到这一步我基本可以确认：**至少在我当前这条网络出口下，阿里 DNS 对 `dl.google.com` 的解析结果就是“那一类”我访问不到的 IP。**

### 这个问题需要两个条件同时成立（缺一不可）

写到这里必须强调一下：这事并不是「阿里 DNS 永远解析错」这么简单，我后来做了一圈对照，发现它其实很“苛刻”：

> **只有在「移动宽带」+「阿里 DNS（包括 223.5.5.5 或 alidns 的 DoH）」这两个条件同时成立时，问题才可能稳定复现。**两个条件缺一不可。

更具体一点就是：

- **换成电信/联通的宽带**：用同样的阿里 DNS，`dl.google.com` 的解析结果通常就正常
- **还是移动宽带，但不用阿里 DNS**：解析结果也通常正常
- **移动宽带 + 阿里 DNS**：高概率拿到海外池，然后直连就炸

我也用 itdog 做了下全国解析测试，移动网络下的复现比例确实更高。

![itdog 测试结果](https://static.031130.xyz/uploads/2026/01/31/d93222096f005.webp)

为什么会这样？老实说我没有能力给一个“全网唯一真相”的解释，我只能说现象非常一致，而且足够让我下结论：**问题不是 TUN 本身，而是 TUN 下我的 DNS 选择把 `dl.google.com` 导向了一个在移动网络里不可达的地址池。**

## 我最后怎么解决的？

既然问题出在「移动宽带 + 阿里 DNS」这个组合上，那解决方式也就很朴素了：**别让 `dl.google.com` 继续走阿里 DNS 解析。**

可以配置 direct-nameserver 或者 nameserver-policy，可以配置 119.29.29.29 等其他公共 DNS，或者干脆把 DNS 解析交给家里的路由器。

```yaml
direct-nameserver:
  - 192.168.8.1

nameserver-policy:
  "dl.google.com": [119.29.29.29]
```

这么搞完之后，`yay` 更新恢复正常，浏览器也能直连访问 `dl.google.com`。

## 参见

- [mihomo 内核极简防 DNS 泄漏配置（2025 年） - 开发调优 - LINUX DO](https://linux.do/t/topic/1061825)
