---
title: UOS到底有没有Secure Boot签名/UOS引导怎么修复
date: 2020-12-22
description: 这篇文章基于2020年12月的一次技术讨论，深入解析了UOS系统在Secure Boot签名方面的实现细节。内容指出，UOS并未使用自己的Secure Boot签名，而是直接借用了Ubuntu已签名的二进制文件，并在安装过程中通过特殊逻辑将Deepin目录内容复制到Ubuntu目录以完成引导配置。这种做法导致用户在引导损坏时难以通过常规方法修复，因为大多数修复教程不会涉及这一隐藏步骤。如果你曾遇到UOS引导问题却无法解决，这篇文章将为你揭示背后的原因，并提供关键的技术背景分析。
tags: 
- Linux
- 大佬对话笔记
- deepin
---


以下内容来自2020年12月22日晚上的大佬对话，非本人原创。

**吃瓜群众:**

> 话说UOS到底有没有Secure boot签名啊

**某dalao:**

> 用的是ubuntu的

**吃瓜群众:**

> 哪来的签名？

**某dalao:**

> 这就不得不讲到另一个槽点了s

**吃瓜群众:**

> ubuntu给他们签？

**某dalao:**

> 不不不，用的是ubuntu签好名的那个binary
>
> 然后ubuntu的那个binary会在EFI分区的ubuntu目录找配置
>
> 于是他们在安装器里写了个逻辑
>
> 把deepin目录的内容复制一份到ubuntu目录
>
> （而不是patch grub包，或者写在grub包的postinst之类的地方）
>
> 后果是用户只要搞坏了引导
>
> 用网上任何教程都恢复不了
>
> 因为没人会教你建一个ubuntu目录，然后把deepin目录的内容复制进去）
>
> 如果不做这一步，任你怎么grub-install啊，update-grub啊，引导就还是坏的
