---
title: 使用 VirtScreen 将 Pad 作为副屏
date: 2022-10-04 00:19:20
sticky:
execrpt:
tags:
- Linux
- Hardware
---

> 由于浙江工地大专的朝晖尚9宿舍实在是太小了，我没有办法放下一块便携显示屏，所以只能把家中闲置的 Huawei Pad M6 作为自己的副屏。

经过一轮搜索下来，我找到了 [VirtScreen](https://github.com/kbumsik/VirtScreen) 作为工具。

## 安装

在 Archlinux 上，大概有三种以上的方式进行安装: 

一、使用 AUR 上的 [virtscreen](https://aur.archlinux.org/package/virtscreen/)

遇到的唯一一个麻烦是作为依赖之一的 `python-quamash` 在 python3.10 上无法直接安装。通过 AUR 的评论区得知，需要将 `collections.Mapping` 改为 `collections.abc.Mapping` 方可通过安装。

二、使用 dderjoel 的 fork 进行安装

见 [https://github.com/dderjoel/VirtScreen/blob/master/package/archlinux/PKGBUILD](https://github.com/dderjoel/VirtScreen/blob/master/package/archlinux/PKGBUILD)

三、直接通过 appimage 安装，不过需要自己手动安装 `x11vnc`

## 配置

### 系统层

打开软件以后，我们需要先在 `Display->Virtual Display->Advaced` 选择 VIRTUAL1 作为显示屏。

如果没有这个选项，可能需要根据自己的显卡做出相应的调整。

可以参考 [ArchWiki](https://wiki.archlinux.org/title/Extreme_Multihead#Using_a_virtual_output)。

### 软件层

在这里，我们需要根据我们作为副屏的设备的屏幕分辨率来计算我们需要在 VirtScreen 中设置的分辨率参数。

我的 Huawei Pad M6 是 2560\*1600 的分辨率，但 VirtScreen 最高支持只有 1920\*1080，所以我们需要选择 1280\*800，并开启高分辨率选项。

VNC 那边只需要根据自己的需求设置一下密码即可。

## 使用

在 VirtScreen 的 Display 界面点击 "Enable Virtual Screen"，切换到 VNC 界面点击 "Start VNC Server"，可以勾选右侧的 "Auto"。

Pad 端只需要安装任意一个 VNC 客户端即可，我这里使用的是"VNC Viewer"。

## 图片

![效果图](https://static.031130.xyz/uploads/2024/08/12/633b1bd1ba8f4.webp)