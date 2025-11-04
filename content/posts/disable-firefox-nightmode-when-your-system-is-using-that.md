---
title:      在系统使用暗色主题时禁用Firefox的夜间模式
date:       2021-04-23
tags:
- 笔记
- Firefox
---

在我使用Archlinux的时候经常会使用一些暗色主题，但是我并不希望我浏览网页时一些自作聪明的网页自动切换成夜间模式。

这个设置我找了好久，每次在谷歌上检索都会跳出来一堆教我改Firefox主题的、用插件开夜间模式的，却都不是我的目的。

我们所需要做的是在浏览器地址栏输入`about:config`进入高级设置

搜索并添加一个值

```
ui.systemUsesDarkTheme
```

将这个选项的**数值**设置为0即可。

![步骤1](https://static.031130.xyz/uploads/2024/08/12/62f36c8f05efd.webp)

![步骤2](https://static.031130.xyz/uploads/2024/08/12/62f36cce30773.webp)



2021.12.13更新: Firefox 更新 95.0 以后，如果遇到原方案失效的问题，可以参考 [CSL的博客](https://blog.cubercsl.site/post/%E5%9C%A8%E7%B3%BB%E7%BB%9F%E4%BD%BF%E7%94%A8%E6%9A%97%E8%89%B2%E4%B8%BB%E9%A2%98%E6%97%B6%E7%A6%81%E6%AD%A2%E7%94%A8-firefox-%E7%9A%84%E5%A4%9C%E9%97%B4%E6%A8%A1%E5%BC%8F/)。