---
title:      在系统使用暗色主题时禁用Firefox的夜间模式
date:       2021-04-23
tags:       笔记
---

在我使用Archlinux的时候经常会使用一些暗色主题，但是我并不希望我浏览网页时一些自作聪明的网页自动切换成夜间模式。

这个设置我找了好久，每次在谷歌上检索都会跳出来一堆教我改Firefox主题的、用插件开夜间模式的，却都不是我的目的。

我们所需要做的是在浏览器地址栏输入`about:config`进入高级设置

搜索并添加一个值

```
ui.systemUsesDarkTheme
```

将这个选项的**数值**设置为0即可。

![步骤1](https://download.cdn.xlj0.com/uploads/102/rHD1Znxsh7mVO6G.png)

![步骤2](https://download.cdn.xlj0.com/uploads/102/1syVleQBgH5rA8J.png)