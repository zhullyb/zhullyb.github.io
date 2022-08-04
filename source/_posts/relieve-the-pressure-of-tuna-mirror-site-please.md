---
title: 请给清华镜像站减压
date: 2021-05-27 21:25:48
tags:
- Linux
- 镜像站
---

不知道从什么时候开始，我总觉得tuna的镜像站提供的下载速度越来越慢，直到我前几天翻开tuna镜像站的「[服务器状态](https://mirrors.tuna.tsinghua.edu.cn/status/#server-status)」，我被眼前的景象给震惊到了。

![本图截于2021年5月27日晚](https://npm.elemecdn.com/superbadguy-bed@0.0.5/1.png)

 我在这里大致观察了一下这张图：服务器流量主要是由四个部分组成，「http-ipv4」、「https-ipv4」、「http-ipv6」和「https-ipv6」。光是从过去24小时的平均出站流量来计算的话，大约就是2.4Gb/s，如果观察图中的流量高峰期的话，大概是4Gb/s的一个速率。这个流量大小是什么概念呢？根据我个人浅薄的建站经验来讲，这个流量可以让大部分供应商把你的网站判断为正在遭受攻击，你将被强制进入黑洞模式。然而对于tuna的镜像站而言，这个流量速率确是日常。换句话说，tuna的服务器都相当于每时每刻都在被来自全国的开发者“攻击”。

因此，我们也就不难理解为什么tuna近些年来经常出现断流等一系列问题了。tuna的压力确实不小，考虑到国内其实有不少镜像站其实是把tuna作为上游的，我们应该给tuna减压，尽可能使用其他国内镜像站。国内的开源镜像站我大多都已经收集到[这一篇博客中](/2020/07/11/china-mainland-mirrorlist/)了，以下几个镜像站是我重点推荐的。

### [bfsu](https://mirrors.bfsu.edu.cn/)

tuna的姊妹站，通俗来讲就是tuna派人维护，北京外国语大学出钱。人少、稳定、涵盖项目较广。

### [sjtug](https://mirrors.sjtug.sjtu.edu.cn/)

上海交大的站点，也有不少项目，据说sjtug上的manjaro镜像是国内几个开源镜像站中同步最勤快的，用的人也不多。

### [ustc](http://mirrors.ustc.edu.cn/)

中科大的站点，项目也不少，不过我自己体验下来似乎速度不如上面那俩，今年体验似乎略有改善，用的人和tuna一样也挺多的。

### [opentuna](https://opentuna.cn/)

tuna那边用国内aws服务器搭的站点，速度超快，不过比较可惜的是现在同步的项目不多，同步频率低，大概是一天一次的样子。

### [pku](https://mirrors.pku.edu.cn/Mirrors)

是不是没想到北大也有镜像站？没记错的话是今年三四月左右刚开的，和opentuna情况差不多，用的人少、速度快、同步的项目不多。

### [hit](https://mirrors.hit.edu.cn/)

哈尔滨工业大学的镜像站，速度我跑下来感觉一般，不是特别亮眼，不过同步频率高。