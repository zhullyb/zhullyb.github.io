---
title: 使用fakehome方案暂时解决跑在KDE暗色主题下的程序使用亮色字体的问题
top: false
date: 2021-09-05
type: waline
tags:
      - Linux
      - Archlinux
      - Bwrap
---

**9月6日更新：AUR的`wemeet-bin`维护者sukanka已经将咱的运行指令直接打进了包内，故本文已经基本失去原本的应用意义，但仍可以作为一个案例来解决类似问题。**

> 在使用腾讯最近推出的Linux原生腾讯会议的时候，咱遇到了个十分影响体验的问题。
>
> 我在使用KDE的暗色主题，腾讯回忆自作主张将字体颜色调成了白色。然而，字体背景是白色的没，因此导致对比度下降，字体难以辨认。效果大概是这个鬼样子:
>
> ![](https://r2-reverse.5435486.xyz/uploads/2024/08/12/62f3cb059b229.webp)



然而我一时半会儿却找不到合适的变量在运行腾讯会议之前unset，无法指定它使用一个正确的字体颜色。

此时，我想到了fakehome的解决方案——bwrap。

关于bwrap，依云在ta的[博客](https://blog.lilydjwg.me/2021/8/12/using-bwrap.215869.html)里讲过运行原理，我在这里直接摘一小段过来

> bwrap 的原理是，把 / 放到一个 tmpfs 上，然后需要允许访问的目录通过 bind mount 弄进来。所以没弄进来的部分就是不存在，写数据的话就存在内存里，用完就扔掉了。

而我们要做的，就是开一个tmpfs作为`$HOME/.config`，让腾讯会议读取不到KDE的主题配置文件。

使用如下命令

```bash
bwrap --dev-bind / / --tmpfs $HOME/.config wemeet
```

软件启动确认没有问题后，我们可以更改腾讯会议desktop中的启动命令

```bash
sudo $EDITOR /usr/share/applications/wemeetapp.desktop
```

将`Exec=`后面的命令改成我们刚刚启动所使用的命令即可。



> 关键词: bwrap, linux, 暗色模式, 深色模式, 夜间模式, 白色字体, 亮色字体
