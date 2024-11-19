---
title: 2024年，Firefox 是唯一还在坚持执行在线的 SSL 证书吊销状态检查的主流浏览器
date: 2024-11-19 17:58:14
sticky:
tags:
- Firefox
- SSL
- OpenSSL
---



## 小试一下？

在开始阅读后面的内容之前，或许你可以试试看你正在使用的浏览器能不能访问下面两个链接: 

- https://digicert-tls-ecc-p384-root-g5-revoked.chain-demos.digicert.com/
- https://revoked-isrgrootx1.letsencrypt.org/

这两个链接分别是由 digicert 和 Let's Encrypt 维护的，特意维持了一个**证书没过期，但被 CA 吊销**的状态。

在我的 Firefox for Linux 上，两个链接我都无法打开。

![](https://static.031130.xyz/uploads/2024/11/19/f7785db60b2c8.webp)

这是预期行为。Firefox 在与目标站点建立 https 链接之前，先向 CA 提供的 OCSP 服务器打了一个 http 请求来判断目标站点的 ssl 证书是否有效（是否没有被 CA 主动吊销）。

在 Firefox for Android 上，我无法打开第一个链接，但可以打开第二个，这是因为 Mozilla 给 Android 用户设置的策略为「只对 EV 证书进行 ocsp 校验，跳过 DV 证书和 OV 证书」，*似乎在竞争更加激烈的移动端，Firefox 为了加载速度做出了安全性上的妥协。*

<div><img src="https://static.031130.xyz/uploads/2024/11/19/b097e954f766f.webp" style="zoom:33%;" /><span style="width: 20%;"></span><img src="https://static.031130.xyz/uploads/2024/11/19/a5f58dbb50cfe.webp" style="zoom:33%;" /></div>

而在 Google Chrome / Microsoft Edge 上，OCSP 是不被支持的，chromium 团队在 2014 年就禁用了 OCSP 校验，且目前没有设置项允许用户手动开启，目前它只支持[本地的 CRLSets 规则集](https://www.chromium.org/Home/chromium-security/crlsets/)。在 Safari 上，OCSP 功能被默认禁用，可以由用户手动开启。

## SSL 证书被吊销是怎么回事？

在某些情况下（比如用户告知 CA 颁发给自己的证书私钥不慎被泄漏了，或者 [CA 的颁发程序出现漏洞被人滥用，需要吊销在此期间发出去的所有证书](https://www.trustasia.com/view-security-lets-encrypt/)），CA 需要吊销一些证书，并通过自己的渠道将被吊销的证书尽快告知所有用户——需要被吊销的证书和正常的证书在外观上没有任何区别，用户的浏览器必须依赖 CA 的外部消息通知才能知道哪些证书是被吊销的。

## Firefox 是如何接收来自 CA 的吊销信息的？

Firefox 通过提供了两种方案，以便用户从 CA 处得知目标站点的证书是否被吊销。

### OCSP

正如我前文所说的，Firefox 的 PC 端在与目标站点建立 https 连接之前，会先通过 http 协议向 CA 的 OCSP 服务器打一个 POST 请求来确认证书是否被吊销。

我们可以通过 openssl 拿到目标站点的 ssl 公钥，查看 CA 指定的 OCSP Server

```bash
openssl s_client -connect example.com:443 -servername example.com | openssl x509 -text -noout

```

![](https://static.031130.xyz/uploads/2024/11/19/32579fb56b77b.webp)

![访问第二个链接时的抓包结果](https://static.031130.xyz/uploads/2024/11/19/244704705924f.webp)

#### 软失败

这个请求一共有三种结果:

1. 请求结果正常，证书没有被吊销：Firefox 继续和目标站点建立 https 连接
2. 请求结果正常，证书被吊销：Firefox 拒绝和目标站点建立 https 连接，如同我在博客开头贴的图
3. 请求结果异常（请求超时）：Firefox 继续和目标站点建立 https 连接

透过在第三种情况，我们可以发现，Firefox 对 OCSP 检查的结果是软失败 (soft fail) 态度——即如果在 OCSP 过程中发生异常，Firefox 将不得不放弃 OCSP 检查并放行。根据 Mozilla Blog 的说法，如今有 9.9% 的 OCSP 检查都是超时的。

![https://blog.mozilla.org/security/files/2020/01/figure4-ocsp_results.png](https://static.031130.xyz/uploads/2024/11/19/4a6c899a41128.webp)

#### Firefox 中的相关配置项

在 Firefox 的 `about:config` 配置中搜索，我们可以看到一些关于 OCSP 的配置项

- `security.OCSP.enabled`: 是否开启 OCSP 检查，默认为 1

  - 0: 关闭 OCSP 检查
  - 1: 开启 OCSP 检查
  - 2: 只对 EV 证书进行 OCSP 检查

- `security.OCSP.required`: 是否一定要通过 OCSP 才允许建立连接（即是否不允许“软失败”），默认为 false
  - false: 允许软失败
  - true: 不允许软失败

- `security.OCSP.timeoutMilliseconds.hard`: 针对 EV 证书，OCSP 检查的超时时间，默认为 10000 (10 秒)
- `security.OCSP.timeoutMilliseconds.soft`: 针对 DV 和 OV 证书，OCSP 检查的超时时间，默认为 2000（2 秒），移动端为 1 秒。

*EV 证书相比 DV 和 OV 有更严苛的申请条件，区别可以参考[DV、OV和EV SSL证书之间有什么区别？](https://www.digicert.com/cn/difference-between-dv-ov-and-ev-ssl-certificates)*

#### 弊端

- ocsp 不能在不增加用户负担的情况下使用硬失败(hard fail)，对于无响应或者超时的 ocsp 验证只能直接放行，这意味着攻击者可以直接屏蔽浏览器和 CA 之间的连接，拖到 ocsp 超时，并不能有效保障用户免受攻击。
- 在 ocsp server 响应或者连接超时前，与目标站点的 https 连接会被阻塞，这带来了更大的访问延迟。有时还会出现[用户与 ocsp server 无法连接的情况](https://blog.wolfogre.com/posts/letsencrypt-ocsp-breakdown/)。
- ocsp 是由用户浏览器主动向 CA 发起 http 请求，可能会导致用户隐私泄漏（IP 地址、位置、用户的部分浏览历史记录等）。即使 CA 故意不保留这些信息，地区法律也可能强制 CA 收集这些信息。

#### OCSP 装订 (OCSP stapling)

这是一种新的方式，由目标站点的服务器主动向 CA 的 ocsp 服务器缓存 ocsp 信息（有效期最长为 7 天），并将其在用户访问时将相关信息一起提供给用户，避免用户直接向 CA 的服务器发起查询请求，能够规避部分弊端（避免 CA 收集用户信息，规避用户与 CA OCSP 服务器连接性不好等问题）。

目前，caddy 是默认开启 OCSP 装订的，而 nginx 可以在配置后手动开启。

可以采用 openssl 来查询目标站点是否开启了 OCSP 装订：

```bash
openssl s_client -connect example.com:443 -status
```

如果开启了 OCSP 装订，那么返回的数据中会有 OCSP Response Data 相关的描述

![](https://static.031130.xyz/uploads/2024/11/19/71f252c97e96e.webp)

### CRLite (WIP)

[CRLite](https://obj.umiacs.umd.edu/papers_for_stories/crlite_oakland17.pdf) 是 [2017 年 IEEE 安全和隐私研讨会](https://www.ieee-security.org/TC/SP2017/)上一组研究人员提出的一项技术，该技术可以有效地压缩吊销信息，使 300 兆字节的吊销数据可以变成 1 兆字节。CRLite 数据由 Mozilla 收集处理后推送给浏览器实现证书状态的本地查找，*这项技术仍然处于开发阶段。*

当浏览器使用 CRLite 查询对应站点的 ssl 证书的有效状态时，一般会有 5 种查询结果

1. Certificate Valid，表示 CRLite 权威返回证书有效。
2. Certificate Revoked，表示 CRLite 权威返回证书已被吊销。
3. Issuer Not Enrolled, 这意味着正在评估的证书未包含在 CRLite 筛选器集中，可能是因为颁发证书的证书颁发机构 （CA） 未发布 CRL。
4. Certificate Too New，表示正在评估的证书比 CRLite 筛选器新。
5. Filter Not Available，这意味着 CRLite 过滤器要么尚未从 Remote Settings 下载，要么已经过时以至于停止服务。

Mozilla 计划每天发布 4 次 CRLite 的更新，以减少第 4 种情况。

#### 速度优势

CRLite 的本地数据查询相比起 OCSP 的在线查询拥有天然的优势，99% 的情况下，CRLite 会比 OCSP 快，其中 56% 的情况下，CRLite 会比 OCSP 快 100 毫秒以上。

![https://blog.mozilla.org/security/files/2020/01/figure3-speedup_vs_ocsp.png](https://static.031130.xyz/uploads/2024/11/19/bfba9ba3515ca.webp)

此外，当 CRLite 不可用时，Firefox 仍然可以回退到传统的 OCSP 检测机制。

## 其他

Let's Encrypt 在 2024 年 7 月[发布博客](https://letsencrypt.org/2024/07/23/replacing-ocsp-with-crls/)，CA/Browser Forum在上一年 8 月通过了一向投票允许 Let's Encrypt 等公开信任的 CA 将设立 OCSP server 作为可选选项。他们计划在未来 6~12 月内宣布关闭 OCSP 服务的时间表。

## 参见

- [CA/Revocation Checking in Firefox - MozillaWiki](https://wiki.mozilla.org/CA/Revocation_Checking_in_Firefox)
- [Firefox OCSP policy - Firefox Development - Mozilla Discourse](https://discourse.mozilla.org/t/firefox-ocsp-policy/83150)
- [In which browsers is OCSP (Online Certificates Status Protocol) supported in?](https://knowledge.digicert.com/nl/nl/quovadis/ssl-certificates/ssl-general-topics/in-which-browsers-is-ocsp-online-certificates-status-protocol-supported-in)
- [Introducing CRLite: All of the Web PKI’s revocations, compressed - Mozilla Security Blog](https://blog.mozilla.org/security/2020/01/09/crlite-part-1-all-web-pki-revocations-compressed/)
- [CRLite: Speeding Up Secure Browsing - Mozilla Security Blog](https://blog.mozilla.org/security/2020/01/21/crlite-part-3-speeding-up-secure-browsing/)
- [1429800 - (crlite) [meta] Implement a CRLite based revocation mechanism](https://bugzilla.mozilla.org/show_bug.cgi?id=1429800)
- [1761109 - Make check-revocations mode the default CRLite mode](https://bugzilla.mozilla.org/show_bug.cgi?id=1761109)
- [Firefox - The only browser doing certificate revocation checks right : r/browsers](https://www.reddit.com/r/browsers/comments/1bb81y8/firefox_the_only_browser_doing_certificate/)
- [Intent to End OCSP Service - Let's Encrypt](https://letsencrypt.org/2024/07/23/replacing-ocsp-with-crls/)
- [Revocation checking for EV server certificates in Chrome - Google Groups](https://groups.google.com/a/mozilla.org/g/dev-security-policy/c/S6A14e_X-T0/m/T4WxWgajAAAJ)
- [CRLSets - The Chromium Projects](https://www.chromium.org/Home/chromium-security/crlsets/)
- [由于Bug，Let's Encrypt决定吊销300多万张证书！](https://www.trustasia.com/view-security-lets-encrypt/)
- [Let’s Encrypt OCSP 域名被封](https://blog.wolfogre.com/posts/letsencrypt-ocsp-breakdown/)
- [DV、OV和EV SSL证书之间有什么区别？](https://www.digicert.com/cn/difference-between-dv-ov-and-ev-ssl-certificates)
