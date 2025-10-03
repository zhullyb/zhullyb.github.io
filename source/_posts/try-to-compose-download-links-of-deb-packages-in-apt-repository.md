---
title: 小记 - 尝试拼凑出 apt 仓库中的 deb 包下载地址
date: 2024-03-13 21:55:04
sticky:
tags:
- Linux
- Apt
- deepin
---

大概一周前，有一个来源不明的 Linux 微信，从包的结构来看是基于 qt 实现的图形化界面，deb 包中的 control 信息表明是腾讯团队官方出品的。今天听人说 UOS 的商店上架了最新的微信，便尝试从 UOS 的官方仓库提取下载链接，帮助 AUR Maintainer 获取到新的地址。

在我的[《deepin-elf-verify究竟是何物？》](https://zhul.in/2021/11/20/what-is-deepin-elf-verify/)这篇文章中，我成功从 uos.deepin.cn 下载到了来自 UOS 中的软件包。可惜，当我采用同样的方法搜索 weixin 或者 wechat 字样时，没有得到任何结果。

UOS 上的软件来源起码来自两个仓库，一个是与系统有关的软件，比如 Linux Kernel，GCC 一类开源软件，应该就是来自我之前下载到 deepin-elf-verify 的那个源。除此之外，还有一个 appstore 源，里面存放的都是应用商店中上架的软件（大部分可能是闭源的）。

在 chinauos.com 下载到最新的 ISO 安装镜像后，直接在虚拟机中走完正常的安装流畅，然后直捣黄龙。

![源地址](https://static.031130.xyz/uploads/2024/08/12/65f1b344e5581.webp)

可以看出，`/etc/apt/sources.list.d/appstore.list` 文件中列出的源很有可能就是我们要找的新版微信的所在源。

可惜直接访问的时候，源地址给出了 403。他们似乎不愿意公开源地址的 filelist index。

不过没关系，既然 UOS Desktop 目前仍然依赖 APT 实现软件安装，那它的源应该仍然符合 Debian 的 APT Repository 目录结构。

根据 [DebianWiki 中的描述](https://wiki.debian.org/DebianRepository/Format)

> gives an example: 
>
> ```
> deb https://deb.debian.org/debian stable main contrib non-free
> ```

> An archive can have either source packages or binary packages or both but they have to be specified separately to apt. 
>
> The uri, in this case *`https://deb.debian.org/debian`* specifies the root of the archive. Often Debian archives are in the *debian/* directory on the server but can be anywhere else (many mirrors for example have it in a *pub/linux/debian* directory, for example). 
>
> The distribution part (*stable* in this case) specifies a subdirectory in **$ARCHIVE_ROOT/dists**. It can contain additional slashes to specify subdirectories nested deeper, eg. *stable/updates*. distribution typically corresponds to **Suite** or **Codename** specified in the **Release** files. ***FIXME is this enforced anyhow?*** 
>
> To download packages from a repository apt would download an **InRelease** or **Release** file from the **$ARCHIVE_ROOT/dists/$DISTRIBUTION** directory. 

我尝试了访问 `https://pro-store-packages.uniontech.com/appstore/dists/eagle-pro/Release`，获得了一系列索引文件的索引。

![索引的索引（很拗口）](https://static.031130.xyz/uploads/2024/08/12/65f1b5166810a.webp)

第一段中就能看到熟悉的 `Packages` 文件。根据我 deepin-elf-verify 相关博客中记载，这个文件中会保存 deb 文件的相对路径。我们先拼出 amd64 架构的 Packages 文件下载链接: https://pro-store-packages.uniontech.com/appstore/dists/eagle-pro/appstore/binary-amd64/Packages

![deb 包详细信息](https://static.031130.xyz/uploads/2024/08/12/65f1b5faccc86.webp)

这里可以看到源中每一个 deb 包的信息。图中红色方框框出的便是其中一个 deb 包在源中的相对路径。

我们可以使用 grep 命令去检索 weixin 或者 wechat 关键词

```bash
curl -sL https://pro-store-packages.uniontech.com/appstore/dists/eagle-pro/appstore/binary-amd64/Packages | grep -E "weixin|wechat"
```

![获取到我们想要的 deb 包的相对路径](https://static.031130.xyz/uploads/2024/08/12/65f1b6a4c3239.webp)

在这个路径前加上之前 `appstore.list` 文件中给出的 url 前缀，即可拼凑出 deb 包的完整下载地址: https://pro-store-packages.uniontech.com/appstore/pool/appstore/c/com.tencent.wechat/com.tencent.wechat_1.0.0.236_amd64.deb

放到浏览器中尝试，果然可以正常下载

![正常下载](https://static.031130.xyz/uploads/2024/08/12/65f1b73567121.webp)
