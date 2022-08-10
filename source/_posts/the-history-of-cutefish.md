---
title: Cutefish的前世今生
date: 2021-12-12 00:10:34
sticky:
tags:
- OpenSource Project
---

> CutefishOS是由我们国内的开发者主导（目前也主要是他们在开发）的桌面环境。不过似乎对于他的前世今生，似乎很多人都有误解。尤其是很多人认为他是一个Archlinux-based发行版；部分用户分不清他到底是基于Debian还是基于Ubuntu；还有人把它和 JingOS 弄混了。

先把这些问题的回答写在最前面: 

CutefishOS 是一个基于Debian的发行版，他的前身 CyberOS 是一个基于 Archlinux 的发行版。但要注意: Cutefish （不加OS）可以单独指代 CutefishOS 所使用的桌面环境，为了避免混淆，本文中我将使用CutefishDE来指代他的桌面环境。

CutefishOS 和 JingOS 目前只是官网互加友链的关系，并不是相同的东西。Cutefish的开发方向是基于qt重写一套UI，而JingOS则更像是在开发一套KDE的主题。

***

## Cutefish的历史

### CyberOS的故事

第一次体验到这个UI其实是在21年的3月，在Archlinux的QQ群里，群主向我们推荐了 CyberOS ，这是一个基于 Archlinux 的发行版。

![QQ群公告](https://npm.elemecdn.com/superbadguy-bed@0.0.4/2.png)

由于基于 Archlinux，我直接就添加了CyberOS的源作为第三方源安装上了CyberDE，~~那会儿还顺手水了篇博客，由于后来事情发展太快，这篇博客早就不适用了，就干脆删了，现在在我的Github还能找到那会儿的[存档](https://github.com/zhullyb/blog/blob/20210430/_posts/2021-03-21-install-cyber-desktop-on-your-archlinux.md)。~~

### 更名CutefishOS

后来根据 CutefishOS 的QQ群的群主所说，是因为当时没注重海外平台的宣发，导致 CyberOS 的用户名在 Twitter 被抢注，因此决定改名 CutefishOS 。由于时间较为久远，QQ群的聊天记录已经几乎找不到了，我无法放出。

关于CutefishOS的创始时间我已经记不清了，但是可以推测是在21年的4~5月份左右。[^1][^2][^3]

### 官网上线

21年5月12日，[cutefishos.com](https://cutefishos.com) 上线，暂时不提供安装镜像。

### 进军Arch系

5月26日，CutefishDE进入 [Archlinux官方源](https://archlinux.org/groups/x86_64/cutefish/)。

同日，Github 组织 manjaro-cutefish 放出了使用 CutefishDE 的 [manjaro安装镜像](https://github.com/manjaro-cutefish/download/releases)。这个组织和官方的 github.com/cutefishos 没有共同维护者，因此可以基本断定是第三方打包的。

### Ubuntu第三方打包版的跟进

大约在7月中旬左右[^4]，Github出现了一位名为 cutefish-ubuntu 的用户，开始在 Ubutnu 上编译 CutefishDE ，并通过 [GithubPages](https://cutefish-ubuntu.github.io/) 发布安装镜像，依然是第三方打包的安装镜像。

### 官方版本释出

21年国庆长假期间，cutefishos.com 释出由 Cutefish官方发布的[基于Debian的CutefishOS镜像](https://cutefishos.com/download)，搭载的DE是 0.5 版本的，英文版网页提供 Google Drive 和 Mega 的下载链接，中文版本网页非常贴心地添加了使用飞书下载的方式方便国内用户下载。

### RPM系的跟进

#### COPR

copr上分别有三名用户打包了CutefishDE/CyberDE，我以表格形式简单罗列一下

| 用户名        | 打包的DE | 第一次打包日期 |
| ------------- | -------- | -------------- |
| rmnscnce      | cutefish | 2021.8.19      |
| cappyishihara | cyber    | 2021.11.17     |
| jesonlay      | cutefish | 2021.12.06     |

#### 论坛用户

21年12月2日，一为名为[gesangtome](https://bbs.cutefishos.com/u/gesangtome)的网友在CutefishOS的论坛上[发布了自己编译的CutefishDE](https://bbs.cutefishos.com/d/331-fedoracutefish)。

***

[^1]: 通过whois查询得知`cutefishos.com` 这个域名注册时间为21年3月31日
[^2]: [Cutefish进入Archlinux官方源](https://github.com/archlinux/svntogit-community/commit/b92bb9ae8fd35178cdfebb6f56b55f20722aa7dd)是在5月26日
[^3]: [CyberOS的Github仓库](https://github.com/cyberos)最后一次内容变更是在21年的5月23日
[^4]: 这里参考的是 cutefish-ubuntu/cutefish-ubuntu.github.io 仓库的[第一个commit](https://github.com/cutefish-ubuntu/cutefish-ubuntu.github.io/commit/237a480992a74d8c75c1f4ec51511550ce97c64b)的时间
