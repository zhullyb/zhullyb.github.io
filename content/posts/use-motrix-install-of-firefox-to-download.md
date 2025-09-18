---
title:      使用Motrix接管Firefox的下载
date:       2021-04-11
description: 本文介绍如何配置 Firefox 浏览器，使其能够使用 Motrix 接管默认下载任务。如果你习惯使用 Motrix 作为下载工具，但 Firefox 本身没有提供官方扩展支持，这篇文章提供了一个实用的替代方案。通过使用 Aria2 Integration 插件，并配合 Motrix 的 RPC 配置，你可以实现浏览器与下载器的无缝衔接。文章以图文方式详细展示了配置步骤，包括插件设置和 Motrix 的 JSON-RPC 配置，适合希望提升下载体验的 Firefox 用户参考。
tags:       笔记
---

> 本文是一篇个人笔记，不具有太强的技术性，仅仅是为后来者指个方向。

熟悉我的人都知道，我是一个Firefox的忠实用户，原因有二：

​	一/ Firefox国际版同步功能国内可用

​	二/ moz://a（Firefox用户应该能在地址栏直接访问这个链接）

但是Motrix没有推出适用于Firefox的接管浏览器下载功能的插件，于是只能用[aria2的插件](https://addons.mozilla.org/firefox/addon/aria2-integration)。这个插件内置了AriaNG,对于aria2用户来说会比较实用，但是对于Motrix用户而言其实功能有些多余且不兼容，比如什么自动启动aria2什么的是无法实现的。

主要的配置过程我就图解了，退出前记得保存配置。

![step 1](https://static.031130.xyz/uploads/2024/08/12/62f36d3a79438.webp)
![step 2](https://static.031130.xyz/uploads/2024/08/12/62f36d3d08a23.webp)

