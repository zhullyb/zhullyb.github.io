---
title: 后 OCSP 时代，浏览器如何应对证书吊销新挑战
date: 2025-10-16 15:38:50
tags:
- SSL
- Firefox
- Web PKI
- OCSP
- CRLSets
- CRLite
---

2023 年 8 月，CA/Browser Forum 通过了一项投票——不再强制要求 Let’s Encrypt 等公开信任的 CA 设立 OCSP Server

2024 年 7 月，Let's Encrypt 发布[博客](https://letsencrypt.org/2024/07/23/replacing-ocsp-with-crls)，披露其计划关闭 OCSP Server

同年 12 月，Let's Encrypt 发布[其关闭 OCSP Server 的时间计划表](https://letsencrypt.org/2024/12/05/ending-ocsp)，大致情况如下：

- 2025 年 1 月 30 日 - Let’s Encrypt 不再接受新的包含 OCSP Must-Staple 扩展的证书签发请求，除非你的账号先前申请过此类证书
- 2025 年 5 月 7 日 - Let's Encrypt 新签发的证书将加入 CRL URLs，不再包含 OCSP URLs，并且所有新的包含 OCSP Must-Staple 扩展的证书签发请求都将被拒绝
- 2025 年 8 月 6 日 - Let's Encrypt 关闭 OCSP 服务器

**Let's Encrypt 是全世界最大的免费 SSL 证书颁发机构，而这一举动标志着我们已逐渐步入后 OCSP 时代。**

## OCSP 的困境：性能与隐私的权衡

Let's Encrypt 这一举动的背后，是人们对 OCSP（在线证书状态协议）长久以来累积的不满。OCSP 作为一种实时查询证书有效性的方式，最初的设想很美好：当浏览器访问一个网站时，它可以向 **CA（证书颁发机构）** 的 OCSP 服务器发送一个简短的请求，询问该证书是否仍然有效。这似乎比下载一个巨大的 **CRL（证书吊销列表）** 要高效得多。

然而，OCSP 在实际应用中暴露出众多缺陷：

首先是**性能问题**。尽管单个请求很小，但当数百万用户同时访问网站时，OCSP 服务器需要处理海量的实时查询。这不仅给 CA 带来了巨大的服务器压力，也增加了用户访问网站的延迟。如果 OCSP 服务器响应缓慢甚至宕机，浏览器可能会因为无法确认证书状态而中断连接，或者为了用户体验而不得不“睁一只眼闭一只眼”，这都削弱了 OCSP 的安全性。

更严重的是**隐私问题**。每一次 OCSP 查询，都相当于向 CA 报告了用户的访问行为。这意味着 CA 能够知道某个用户在何时访问了哪个网站。虽然 OCSP 查询本身不包含个人身份信息，但将这些信息与 IP 地址等数据结合起来，CA 完全可以建立起用户的浏览习惯画像。对于重视隐私的用户和开发者来说，这种“无声的监视”是不可接受的。**即使 CA 故意不保留这些信息，地区法律也可能强制 CA 收集这些信息。**

再者，OCSP  还存在设计上的**安全缺陷**。由于担心连接超时影响用户体验，浏览器通常默认采用 soft-fail 机制：一旦无法连接 OCSP  服务器，便会选择放行而非阻断连接。攻击者恰恰可以利用这一点，通过阻断客户端与 OCSP  服务器之间的通信，使查询始终超时，从而轻松绕过证书状态验证。

### OCSP 装订 (OCSP stapling)

基于上面这些缺陷，我们有了 OCSP 装订 (OCSP stapling) 方案，这[在我去年的博客里讲过，欢迎回顾](/2024/11/19/firefox-is-the-only-mainstream-brower-doing-online-certificate-revocation-checks/#OCSP-装订-OCSP-stapling)。

### 强制 OCSP 装订 (OCSP Must-Staple)

OCSP Must-Staple 是一个在 ssl 证书申请时的拓展项，该扩展会告知浏览器：若在证书中识别到此扩展，则不得向证书颁发机构发送查询请求，而应在握手阶段获取装订式副本。若未能获得有效副本，浏览器应拒绝连接。

这项功能赋予了浏览器开发者 hard-fail 的勇气，但在 OCSP 淡出历史之前，Let's Encrypt 似乎是唯一支持这一拓展的主流 CA，并且这项功能并没有得到广泛使用。

~~本来不想介绍这项功能的（因为根本没人用），但考虑到这东西快入土了，还是给它在中文互联网中立个碑，~~更多信息参考 [Let's Encrypt 的博客](https://letsencrypt.org/2024/12/05/ending-ocsp#must-staple)。

## Chromium 的方案：弱水三千只取一瓢

OCSP 的隐私和性能问题并非秘密，浏览器厂商们早就开始了各自的探索。2012 年，Chrome 默认禁用了 CRLs、OCSP 检查，转向自行设计的证书校验机制。

众所周知，吊销列表可以非常庞大。如果浏览器需要下载和解析一个完整的全球吊销列表，那将是一场性能灾难（Mozilla 团队在[今年的博客](https://hacks.mozilla.org/2025/08/crlite-fast-private-and-comprehensive-certificate-revocation-checking-in-firefox/)中提到，从 3000 个活跃的 CRL 下载的文件大小将达到 300MB）。Chromium 团队通过分析历史数据发现，大多数被吊销的证书属于少数高风险类别，例如证书颁发机构（CA）本身被攻破、或者某些大型网站的证书被吊销。基于此洞察，CRLSets 采取了以下策略：

1. **分层吊销**：Chromium 不会下载所有被吊销的证书信息，而是由 Google 团队维护一个精简的、包含“最重要”吊销信息的列表。这个列表会定期更新并通过 Chrome 浏览器更新推送给用户。
2. **精简高效**：这个列表体积非常小，目前大概只有 600KB。它包含了那些一旦被滥用就会造成大规模安全事故的证书，例如 CA 的中间证书、或者一些知名网站（如 Google、Facebook）的证书。
3. **牺牲部分安全性**：这种方案的缺点也很明显——它无法覆盖所有的证书吊销情况。对于一个普通网站的证书被吊销，CRLSets 大概率无法检测到。根据 Mozilla 今年的博客所说，CRLSets 只包含了 1%~2% 的未过期的被吊销证书信息。

虽然 CRLSets 是一种“不完美”的解决方案，但它在性能和可用性之间找到了一个平衡点。它确保了用户在访问主流网站时的基础安全，同时避免了 OCSP 带来的性能和隐私开销。对于 Chromium 而言，与其追求一个在现实中难以完美实现的 OCSP 方案，不如集中精力解决最紧迫的安全威胁。

## Firefox 的方案：从 CRLs 到 CRLite

与 Chromium 的“只取一瓢”策略不同，Firefox 的开发者们一直在寻找一种既能保证全面性，又能解决性能问题的方案。

为了解决这个问题，Mozilla 提出了一个创新的方案：**CRLite**。CRLite 的设计理念是通过**哈希函数和布隆过滤器**等数据结构，将庞大的证书吊销列表压缩成一个**小巧、可下载且易于本地验证的格式**。

CRLite 的工作原理可以简单概括为：

1. **数据压缩**：CA 定期生成其全部吊销证书的列表。
2. **服务器处理**：Mozilla 的服务器会收集这些列表，并使用加密哈希函数和布隆过滤器等技术，将所有吊销证书的信息**编码**成一个非常紧凑的数据结构。
3. **客户端验证**：浏览器下载这个压缩文件，当访问网站时，只需本地对证书进行哈希计算，然后查询这个本地文件，就能快速判断该证书是否已被吊销。

与 CRLSets 相比，CRLite 的优势在于它能够实现**对所有吊销证书的全面覆盖**，同时保持**极小的体积**。更重要的是，它**完全在本地完成验证**，这意味着浏览器**无需向任何第三方服务器发送请求**，从而彻底解决了 OCSP 的隐私问题。

Firefox 当前的策略为每 12 小时对 CRLite 数据进行一次增量更新，每日的下载数据大约为 300KB；每 45 天进行一次全量的快照同步，下载数据约为 4MB。

Mozilla 开放了他们的数据看板，你可以在这里找到近期的 CRLite 数据大小：https://yardstick.mozilla.org/dashboard/snapshot/c1WZrxGkNxdm9oZp7xVvGUEFJCELfApN

自 2025 年 4 月 1 日发布的 Firefox Desktop 137 版本起，Firefox 开始逐步以 CRLite 替换 OCSP 校验；同年 8 月 19 日，Firefox Desktop 142 针对 DV 证书正式弃用 OCSP 检验。

CRLite 已经成为 Firefox 未来证书吊销验证的核心方案，它代表了对性能、隐私和安全性的全面追求。

## 后 OCSP 时代的展望

随着 Let's Encrypt 等主要 CA 关闭 OCSP 服务，OCSP 的时代正在加速落幕。我们可以看到，浏览器厂商们已经开始各自探索更高效、更安全的替代方案。

- **Chromium** 凭借其 CRLSets 方案，在**性能和关键安全保障**之间取得了务实的平衡。
- **Firefox** 则通过 **CRLite** 这一技术创新，试图在**全面性、隐私和性能**三者之间找到最佳的解决方案。

这些方案的共同点是：**将证书吊销验证从实时在线查询（OCSP）转变为本地化验证**，从而规避了 OCSP 固有的性能瓶颈和隐私风险。

未来，证书吊销的生态系统将不再依赖单一的、中心化的 OCSP 服务器。取而代之的是，一个更加多元、分布式和智能化的新时代正在到来。**OCSP 这一技术可能逐渐被淘汰，但它所试图解决的“证书吊销”这一核心安全问题，将永远是浏览器和网络安全社区关注的重点。**

## 参见

- [CRLite: Fast, private, and comprehensive certificate revocation checking in Firefox - Mozilla Hacks - the Web developer blog](https://hacks.mozilla.org/2025/08/crlite-fast-private-and-comprehensive-certificate-revocation-checking-in-firefox/)
- [The Slow Death of OCSP | Feisty Duck](https://www.feistyduck.com/newsletter/issue_121_the_slow_death_of_ocsp)
- [mozilla/crlite: Compact certificate revocation lists for the WebPKI](https://github.com/mozilla/crlite)
- [OCSP Service Has Reached End of Life - Let's Encrypt](https://letsencrypt.org/2025/08/06/ocsp-service-has-reached-end-of-life)
- [Ending OCSP Support in 2025 - Let's Encrypt](https://letsencrypt.org/2024/12/05/ending-ocsp)
- [Intent to End OCSP Service - Let's Encrypt](https://letsencrypt.org/2024/07/23/replacing-ocsp-with-crls)
- [CRLSets - The Chromium Projects](https://www.chromium.org/Home/chromium-security/crlsets/)
- [Google Chrome Will No Longer Check for Revoked SSL Certificates Online | PCWorld](https://www.pcworld.com/article/474296/google_chrome_will_no_longer_check_for_revoked_ssl_certificates_online-2.html)
- [Chrome does certificate revocation better | ZDNET](https://www.zdnet.com/article/chrome-does-certificate-revocation-better/)
- [主流客户端/浏览器证书吊销验证机制技术对与分析 | 帽之岛, Hat's Land](https://www.hats-land.com/WIP/2025-technical-and-analysis-of-mainstream-clientbrowser-certificate-revocation-verification-mechanism.html)
- [OCSP 的淡出… – Gea-Suan Lin's BLOG](https://blog.gslin.org/archives/2025/02/02/12239/ocsp-%E7%9A%84%E6%B7%A1%E5%87%BA/)
