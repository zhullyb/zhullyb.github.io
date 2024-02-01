---
title: 将 umami 从 v1 迁移到 v2 版本
date: 2024-02-02 04:39:48
sticky:
execrpt:
tags:
---

网上相关的文章挺多的，但我遇到了奇怪的问题。不过我现在打算睡了，也就记一笔，等我睡醒以后找个时间来把这篇博客补完。

主要遇到的问题是 supabase 的 connection pooling 举动，以及 6543 端口不能使用预备语句，需要改为 5432 端口的问题，这一点我还没查清楚。反正就是从 supabase 获取 connection pooling 的 url，把端口号改 5432 就能用了。
