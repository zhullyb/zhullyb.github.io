---
title: UOS到底有没有Secure Boot签名/UOS引导怎么修复
date: 2020-12-22
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
