---
title: 自建图床小记一——图床架构与 DNS 解析
date: 2024-08-12 17:07:11
sticky:
execrpt:
tags:
- CDN
- 图床
- Network
- Cloudflare
---

> 一直以来，我使用的都是使用付费的第三方图床，可惜最近几年为了节省成本，境内的稳定性出现了一些问题。过去一年中光是我本人遇到的无法访问的情况就有三四次，其中两次持续时间超过 2 小时，甚至有网友特意来 at 我告知我博客使用的图床出问题了，还有两次是在我作品验收前 24 小时内出现，幸亏我及时切换了资源链接。此外，境外 CDN 也从原先的 Cloudflare 换掉了，目前海外的解析结果似乎只有一个在美国的节点，其余地区（尤其是日本香港新加坡等常用的落地地区）的访问质量不佳，Google 的 page speed test 甚至提示我的图片拖慢了网站加载速度。

基于上述种种原因，我开始选择自建图床，前前后后折腾了快一周后，新图床终于投入使用，目前我的博客已经完成了所有图片资源的切换。

## 架构设计

![图床架构设计图](https://cdn.zhullyb.top/uploads/2024/08/12/80402e4da4ef7.webp)

这一套架构使用 Dnspod 免费版实现在境内外的解析分流，将境内的流量导向又拍云 CDN 为境内的访客提供服务，在境外使用量大管饱的 Cloudflare CDN 节省成本，为全球提供加速访问。

## 为什么是又拍云

如你所见，我的博客底部挂了又拍云的 logo。[又拍云联盟](https://www.upyun.com/league)为个人开发者提供了每个月 10GB 存储和 15GB 的免费 CDN 流量，在每年通过申请后会以 67 元无门槛代金券的形式发放到账号，也不用担心某个月超了一点点而付出额外的费用。

## 为什么是 Cloudflare R2

作为自己的图床，必须要保证稳定性，境内访问的稳定性可以先放到一边，最重要的就是保证源文件的稳定性。不同于在自己的 VPS 上存储图片的方案，使用 Cloudflare R2 作为储存不需要关注 VPS 到期以后的图片迁移问题。使用 Cloudflare R2 作为储存，免费用量对于个人站点来说绰绰有余，在 10GB 存储容量超出之前不用考虑别的问题，也不用担心资金支持不下去导致的麻烦。而不使用又拍云提供的 10GB 存储也可以节省这部分的代金券金额，让代金券尽可能多的抵扣境内 CDN 流量带来的费用。

## 需要的东西

- 两个或两个以上的域名（其中一个需要备案）
- Cloudflare 所支持的境外支付方式（PayPal 账号 / Visa Card / Master Card），用于开通 Cloudflare R2 和 Cloudflare SaaS 接入
- ~~很多很多钱~~（其实没有很多，又拍云联盟每年的 67 元抵用券在我这里看来完全是够用的）
- 聪明的大脑，能够快速敲击键盘的双手，~~能够支持你熬夜的心脏~~

*\* 在这一套架构中引入了香港 VPS 进行反向代理，一来是防止国内 CDN 与 Cloudflare 的网络连接质量过差导致的回源失败，二来也是方便我在没有国际联网的情况下进行图片的上传，但如果没有条件其实是可以去掉的。*

## DNS 解析

![DNS 解析方案 1](https://cdn.zhullyb.top/uploads/2024/08/13/03d8243b67593.webp)

如上图，将图床域名 NS 接入 DnsPod，工具人域名 NS 接入 Cloudflare 即可实现境内外分流的效果。

1. 图床访问域名在境外 CNAME 解析到工具人域名
2. 图床访问域名在境内 CNAME 解析到境内 CDN 服务商
3. 工具人域名在 Cloudflare 上解析到任何站点都行，只需点亮解析时 Cloudflare CDN 代理按钮即可生效。

![代理按钮](https://cdn.zhullyb.top/uploads/2024/08/13/a0387d2919850.webp)

但如果你的备案域名已经通过 NS 接入了 Cloudflare，可以采用下面这套架构。

![DNS 解析方案 2](https://cdn.zhullyb.top/uploads/2024/08/13/d03d7b3155514.webp)

*\* 解析方案 2 中的图床访问域名和工具人域名可以是同属于同一二级域名的不同子域名*

这种方案要多一步，把图床访问域名 CNAME 解析到用于分流的工具人域名。

## Cloudflare SaaS 接入

![SaaS 接入](https://cdn.zhullyb.top/uploads/2024/08/13/eb7186205b380.webp)

SaaS 接入大概就是如图所示，此外还要配置 Cloudflare Workers 的域名访问

![Cloudflare Workers 域名访问](https://cdn.zhullyb.top/uploads/2024/08/13/782a665cabe05.webp)

这样就能保证在境外访问图床域名时将请求打到 Cloudflare Workers 上了，关于使用 Cloudflare Workers 构建图床 Restful API 相关的内容我放在[下一篇博客](/2024/08/13/build-restful-api-for-cloudflare-r2-with-cloudflare-workers/)讲。

## 参见

- [图床 CDN CNAME 接入 Cloudflare SaaS 实现分流](https://www.eallion.com/cdn-cname-cloudflare/)
