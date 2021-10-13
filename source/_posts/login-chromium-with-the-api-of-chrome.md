---
title:      使用Chrome的同步api为chromium开启同步功能
date:       2021-04-15
tags:       笔记
---

今年两三月的时候，Google限制了chromium的同步api次数，导致各个发行版内置的chromium将不再能继续使用Google的数据同步功能。

今天在翻 archlinuxcn 的群组的时候翻到了一段脚本: [https://gist.github.com/foutrelis/14e339596b89813aa9c37fd1b4e5d9d5](https://gist.github.com/foutrelis/14e339596b89813aa9c37fd1b4e5d9d5)

大意就是说，由于Archlinux特殊的chromium启动方式导致我们可以在设置`oauth2-client-id`和`oauth2-client-secret`的情况下通过chrome的同步api继续使用Google的同步服务，说得太多了也没必要，毕竟原文就在那里，看不看取决于你，我这里直接给命令吧。

```shell
echo "--oauth2-client-id=77185425430.apps.googleusercontent.com
--oauth2-client-secret=OTJgUOQcT7lO7GsGZq2G4IlT" >> ~/.config/chromium-flags.conf
```

再次打开chromium,你就会发现你心心念念的同步功能回来了。

![](https://i.loli.net/2021/10/14/zXIHAwRhq65y7Wc.png)