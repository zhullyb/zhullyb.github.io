---
title: pacman更新时遇到「GPGME 错误：无数据」
date: 2022-01-01 23:42:09
description: 在 Arch Linux 使用 pacman 更新时遇到「GPGME 错误：无数据」怎么办？本文详细解析这一常见问题的成因：特别是在校园网或酒店 Wi-Fi 等需要登录认证的网络环境中，pacman 在尝试下载不存在的数据库签名文件（.db.sig）时被网络认证页面劫持，导致无法正常完成更新。文章提供了清晰高效的解决方案——只需一条终端命令即可修复，并深入解释了错误背后的机制，适合遇到类似问题的 Arch 用户快速排查和解决。
sticky:
tags:
- Archlinux
---

## 情景再现

当初是使用 pacman 更新时遇上了「GPGME 错误：无数据」的问题，我尝试复现了下，大概是下面这样的情况。

```
[zhullyb@Archlinux ~]$ sudo pacman -Syu
错误：GPGME 错误：无数据
错误：GPGME 错误：无数据
错误：GPGME 错误：无数据
:: 正在同步软件包数据库...
 core                                137.6 KiB   598 KiB/s 00:00 [------------------------------------] 100%
 extra                              1566.0 KiB  6.12 MiB/s 00:00 [------------------------------------] 100%
 community                             6.0 MiB  20.6 MiB/s 00:00 [------------------------------------] 100%
错误：GPGME 错误：无数据
错误：GPGME 错误：无数据
错误：GPGME 错误：无数据
错误：未能同步所有数据库（无效或已损坏的数据库 (PGP 签名)）
```

英文版的提示应该是长成下面这个样子

```
[zhullyb@Archlinux ~]$ sudo pacman -Syu
error: GPGME error: No data
error: GPGME error: No data
error: GPGME error: No data
:: Synchronizing package databases...
 core                                137.6 KiB   574 KiB/s 00:00 [------------------------------------] 100%
 extra                              1566.0 KiB  5.66 MiB/s 00:00 [------------------------------------] 100%
 community                             6.0 MiB  18.1 MiB/s 00:00 [------------------------------------] 100%
error: GPGME error: No data
error: GPGME error: No data
error: GPGME error: No data
error: failed to synchronize all databases (invalid or corrupted database (PGP signature))
```

## 解决方案

```
sudo rm /var/lib/pacman/sync/*.sig
```

很简单，就这一条命令就够了。

## 问题原因

pacman在更新数据库文件时也会尝试下载`$repo.db.sig`，这里的`$repo`可以是 core、extra、community、archlinuxcn 等仓库名。

但是无论是官方源还是 archlinuxcn 源，**大多数源的数据库文件**都不会被签名，也就**不会存在 .db.sig 文件**。

pacman 尝试下载时这些数据库文件的签名文件时，镜像站就会返回 **404 的 http 状态码**告诉pacman: “你个傻叉，神他妈没有这个文件！”

pacman 挨了一顿骂，也就善罢甘休，没有再动这个念头，所以我们每次更新也都相安无事。

而出现这种错误的情况大多是发生在 校园网、酒店免费 WIFI 这种**需要登陆以后才能上网的网络环境**。

因为 pacman 尝试下载 `.db.sig` 文件时被登陆网页劫持了（这点你们应该深有感受，如果你在这种网络环境下没有登陆，你无论访问什么网页都会被重定向到登录界面，http 的状态码此时是200，不是404）。从没见过 `.db.sig`的 pacman 此时两眼放光，由于没有挨骂，他就迅速地把登录界面当成是`.db.sig`下载下来了。

下载下来以后，pacman 激动地摆弄起 `.db.sig`，甚至发现里面没有自己期待已久的 GPG签名数据并开始报错时仍然不愿意撒手，因此此时无论再怎么同步源码、再怎么 Syyu 也不会有效果，必须人工干预。
