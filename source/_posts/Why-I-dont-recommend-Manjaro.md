---
title:      为什么我不推荐Manjaro
date:       2021-01-01
tags:       Linux
---

说起Linux发行版，很多人都会去推荐Manjaro给新手使用，原因很简单——安装简单、有庞大的AUR和ArchlinuxCN提供软件、有丰富的ArchWiki以供新手查阅。那么，为什么大多数Archlinux用户（包括我）始终不推荐Manjaro作为自己使用的发行版呢。

***

### 首先来了解一下两款Linux发行版

**Archlinux**

Archlinux是一款滚动发行版，所有的软件全部都基于上游最新的源代码进行编译，源内也仅仅保留最新版本，是最为激进的发行版之一，甚至或许没有之一。

**Manjaro**

Manjaro是一款基于Archlinux的滚动发行版，部分软件同样基于上游源代码编译，同时也有部分软件包直接从Archlinux源内直接拿二进制包。与Archlinux不同的是，Manjaro大部分软件更新相比Archlinux会滞后一个星期，一些比较重要的软件甚至会滞后两个星期以上（比如Python3.9就滞后了19天）以保证稳定性。（虽然我目前观察下来这个稳定性就是出现Bug和修复Bug都比Archlinux慢一个礼拜）

***

### 接下来就是正文

#### Archlinux 和 Manjaro 都不适合Linux小白

Archlinux和Manjaro都是激进的滚动发行版，作为一个滚动发行版都会有滚坏的风险，这就要求用户有一定的Linux使用基础，能够多关注更新动态，在系统罢工后有修复系统的能力，因此我不会给小白推荐Archlinux/Manjaro这样的发行版（虽说能够用纯cli界面安装Archlinux的用户其实已经有一定的水平了）。

#### ArchWiki 不是 ManjaroWiki

Manjaro官方为了最大限度地降低用户的使用门槛，为用户打造了一套开箱即用的环境，这听起来很好。

但是Manjaro官方为了降低用户使用门槛，不得不替用户去做一些选择，写上一些默认配置，在必要的地方对系统进行魔改。因此，ArchWiki上面的解决方案并非在Manjaro上能够100%适用，因此不要指望在系统使用过程中ArchWiki能够解决你所有的问题，有相当一部分问题你需要去查阅纯英文版的ManjaroWiki。

#### AUR(Archlinux User Repository)&ArchlinuxCN 并不是为 Manjaro 准备的

AUR和ArchlinuxCN源都是Archlinux用户为Archlinux打包的常用软件，因此所有的软件都是选择Archlinux最新的软件作为依赖来编译/打包的。上文中我们提到过，Manjaro源内的软件会滞后更新。因此AUR和ArchlinuxCN内一些对于依赖版本要求比较苛刻的软件会在Manjaro这个更新比较落后的发行版上不工作。

![我们甚至还有一张表情包来调侃这种情况的](https://npm.elemecdn.com/superbadguy-bed@0.0.6/1.png)

我知道这听起来会有些荒唐，不过我可以举出一个就发生在不久之前的生动的例子。

Archlinux在2020年10月17日将grpc从1.30更新到了1.32，qv2ray开发者反应迅速，在几个小时内直接更新了基于grpc-1.32的qv2ray，接着是仍然在使用grpc-1.30的Manjaro用户的一片哀嚎。。。

解决方法有很多，比如临时使用Archlinux源把grpc更新到1.32、通过AppImage安装qv2ray等等，但是如你所见，Manjaro用户使用AUR&ArchlinuxCN确实容易出现问题。

> 附：AUR上需要下载源码的自己编译的包不会碰到依赖的版本问题，但是仍然有部分情况下PKGBUILD会直接因为依赖版本号被写死而编译出错。而ArchlinuxCN清一色是编译好的二进制包，所以Manjaro用户使用ArchlinuxCN相比AUR出问题的几率更加大一点。

#### Manjaro 没有 Archive 源

Archlinux拥有一个[archive源](https://archive.archlinux.org/)，通过Archive源，你可以将你的系统滚到任何一天的状态，比如在你不知道更新了什么滚炸了以后，你可以用Archive源回滚到三天前的状态，等bug修复完以后再用回正常的Archlinux源。况且，这个Archive源在国内拥有[tuna](https://arch-archive.tuna.tsinghua.edu.cn/)和[bfsu](https://mirrors.bfsu.edu.cn/archlinux-archive/)两个镜像源（虽然这两个镜像源并不是完整的镜像，而是每隔7天镜像一次），不会存在访问速度过慢的状况。有名的downgrade软件也是基于Archive源使用的。而Manjaro？很遗憾，没有。

### 写在最后

如果你有一定的Linux基础，阅读了我上面的科普以后仍然要去使用Manjaro也没有关系，但是记得**遵守以下几点以确保你在Arch社区不会被打死**。

- 谨慎使用AUR和ArchlinuxCN
- 使用AUR和ArchlinuxCN时遇到问题请不要反馈
- 在Arch社区提问时请**提前**说明自己在使用Manjaro
- 不要根据Manjaro的使用经验随意编辑ArchWiki