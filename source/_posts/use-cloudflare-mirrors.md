---
title: 我是来吹CloudflareMirrors的
date: 2021-11-21 01:48:49
sticky:
index_img: https://bu.dusays.com/2022/08/10/62f3c9a9448a4.webp
tags:
- Cloudflare
---

Cloudflare也开始提供[Linux开源镜像站](https://cloudflaremirrors.com/)了。

虽然在中国大陆地区，Cloudflare速度日常抽风，不适合作为我们本机镜像源，但完全可以用于境外VPS。平常我们对国内的镜像站比较熟悉，也知道自己的网络环境使用哪个镜像站会稍微快一些，但一旦出了国，这些经验就没有用了。

作为一家老牌的CDN网站加速服务提供商，Cloudflare提供的网络服务在全球范围内都非常快（~~嗯，对，全球范围不包含中国大陆~~）

无论你的vps是在美国日本，还是香港新加坡，cloudflare都能提供非常稳定高速的服务，只需要记住cloudflare镜像站的域名，便可以抛弃挑选镜像站的烦恼。

![](https://bu.dusays.com/2022/08/10/62f3c9a9448a4.webp)

根据网页上所说，cloudflare会以「反代就近的镜像站」+「缓存」的形式来提供服务，~~既然都要通过cloudflare网络，那中国大陆地区就可以彻底别想了~~，能够给几乎所有地区提供不错的服务。目前说是只提供了「[Archlinux](https://cloudflaremirrors.com/archlinux/)」和「[Debian](https://cloudflaremirrors.com/debian/)」的服务，但是根据我考证下来，其实「[Ubuntu](https://cloudflaremirrors.com/ubuntu/)」和「[CentOS](https://cloudflaremirrors.com/centos/)」也有，只不过没写在页面上罢了。那么废话不多说，我们上境外的vps测一下下载速度如何。

[cloudflaremirrors](https://cloudflaremirrors.com/) 在我这台位于美国达拉斯机房的1Gbps机器上可以跑到80MB/s+的速度，虽然没有跑满理论速率，但也算是相当喜人的成绩了。

![](https://bu.dusays.com/2022/08/10/62f3ccc8d7c82.webp)

小结: 

CloudflareMirrors非常适合境外的vps使用，免去了用户自行给一个个镜像站测速的麻烦。
