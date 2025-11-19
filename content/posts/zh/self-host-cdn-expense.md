---
title: 自建图床小记五——费用
date: 2024-08-21 00:05:15
sticky:
tags:
- Image Hosting
- CDN
---

自建的图床自 8 月 13 日正式启用以来，已经过去一周多了，具体的费用是多少呢？原先设计的 0 额外投入有没有实现呢？

![博客访问统计](https://static.031130.xyz/uploads/2024/08/21/74605f0ef84a9.webp)

这是我的博客访问统计，在这一周多的时间内，一共有 1.27k 次页面访问，被 671 个访客访问了 769 次，平均下来每天也有一百多次的页面访问。

Cloudflare Workers 和 Cloudflare R2 的免费额度全部够用，用量全部小于免费额度的 1%。

![R2 的免费额度](https://static.031130.xyz/uploads/2024/08/21/96ec475817b8f.webp)

![R2 的用量](https://static.031130.xyz/uploads/2024/08/21/7a26d392e6c90.webp)

![Cloudflare Workers 过去 24 小时内的请求次数](https://static.031130.xyz/uploads/2024/08/21/31a7f3c316b47.webp)

又拍云联盟每年可以领取 67 元的代金券，平均每天控制在 0.18 元内即可实现白嫖。

![又拍云账单](https://static.031130.xyz/uploads/2024/08/21/1c4eeac63a2fb.webp)

**可以看到，这一套图床在我博客当前和可见的未来的访客情况下，在不被人恶意刷流量的情况下，是不需要投入除域名续费以外的其他成本的。**
