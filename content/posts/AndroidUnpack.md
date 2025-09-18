---
title: 安卓解包笔记
date: 2020-08-10
description: 在这篇安卓解包笔记中，我们将深入探讨如何解压和提取安卓系统镜像文件。文章详细介绍了使用 brotli 工具解压缩 .dat.br 格式文件，以及如何通过 sdat2img 脚本将 system.new.dat 和 system.transfer.list 转换为可挂载的 system.img 镜像。此外，还提供了相关工具（如 brotli 和 sdat2img）的官方 GitHub 获取链接，方便读者下载和使用。无论你是安卓 ROM 开发者、系统定制爱好者，还是对 Linux 环境下操作感兴趣的技术人员，这篇指南都将帮助你顺利完成系统镜像的解包和挂载步骤，为进一步的修改或分析打下基础。
tags: 
      - Android
      - Rom编译
      - Linux
---

```
brotli -d system.new.dat.br
sdat2img system.transfer.list system.new.dat
mount system.img {known_path}
```

Get brotli [here](https://github.com/google/brotli) & sdat2img [here](https://github.com/xpirt/sdat2img)