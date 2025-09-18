---
title: 为中柏 N100 小主机开启来电自启
date: 2024-07-22 23:31:51
description: 本文详细介绍了如何为中柏 N100 小主机开启来电自启功能，适用于家庭服务器或需要远程控制设备的用户。文章以实际需求为背景，逐步引导读者进入 BIOS 设置，并在 Advanced 选项下的 OEM Configuration 中找到 AC Power Loss 选项。提供了三种模式的解释：Power Off（关闭功能）、Power On（传统来电自启）和 Last State（仅意外断电后恢复供电时自启）。操作简单清晰，帮助用户确保设备在断电恢复后自动重启，提升使用便利性和可靠性。适合硬件爱好者和家庭服务器用户参考。
sticky:
tags:
- Hardware
- HomeServer
- 笔记
---

因为收到通知，寝室过两天要断电 20 分钟，所以需要打开 N100 家里云的来电自启功能。

正常关机短暂等待数秒后，开机，狂按 Delete 键进入 BIOS。

在 Advanced 选项中选择「OEM Configuration」

![](https://static.031130.xyz/uploads/2024/08/12/669e7e6ae10a4.webp)

可以在最后一行「AC Power Loss」中选择模式。

- Power Off: 关闭相关功能。
- Power On: 传统意义上的来电自启，只要接通电源就会自启动。
- Last State: 只有在上次关机是意外断电导致时，接通电源才会自启动。

![](https://static.031130.xyz/uploads/2024/08/12/669e7e5ab7ad6.webp)
