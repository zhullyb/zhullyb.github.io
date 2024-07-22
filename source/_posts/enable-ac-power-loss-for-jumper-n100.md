---
title: 为中柏 N100 小主机开启来电自启
date: 2024-07-22 23:31:51
sticky:
execrpt:
tags:
- Hardware
- HomeServer
- 笔记
---

因为收到通知，寝室过两天要断电 20 分钟，所以需要打开 N100 家里云的来电自启功能。

正常关机短暂等待数秒后，开机，狂按 Delete 键进入 BIOS。

在 Advanced 选项中选择「OEM Configuration」

![](https://bu.dusays.com/2024/07/22/669e7e6ae10a4.webp)

可以在最后一行「AC Power Loss」中选择模式。

- Power Off: 关闭相关功能。
- Power On: 传统意义上的来电自启，只要接通电源就会自启动。
- Last State: 只有在上次关机是意外断电导致时，接通电源才会自启动。

![](https://bu.dusays.com/2024/07/22/669e7e5ab7ad6.webp)
