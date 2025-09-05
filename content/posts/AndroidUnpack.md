---
title: 安卓解包笔记
date: 2020-08-10
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