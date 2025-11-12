---
title: 处理 fcitx5 的文字候选框在 tg 客户端上闪烁的问题
date: 2022-07-03 13:52:44
sticky:
tags:
- Linux
- Notes
- KDE
---

> 文章开头，先要感谢 fcitx5 的开发者 [老K](https://www.csslayer.info/wordpress/) 帮我 debug 这个问题

## 鬼畜的文字候选框

在新装的 Fedora 36 KDE Wayland 下使用 fcitx5 时遇到了文字候选框前后移动晃眼的问题（如下图）

![fcitx5 blinking](https://static.031130.xyz/uploads/2024/08/12/62c13162a6efc.gif)

## 解决方案

当我向老K提出这个问题上的时候，老K告诉我这是预期行为，一共有两个解决方案。

- 使用 qt 的 text input
- 关掉 kwin 的淡入淡出特效

但由于我并不熟悉 KWin 的特效，所以我选择了前者的方案。

首先，需要确保自己的 Plasma 版本在 5.24 或以上，fcitx5 的版本号在 5.0.14 以上。

然后我们需要让 KWin 去启动 fcitx5。KCM 为此提供了一个非常简单的方式，如下图

![选择 fcitx5 就好啦](https://static.031130.xyz/uploads/2024/08/12/62c134907ada9.webp)

随后需要确保环境变量没有设置 `QT_IM_MODULE `。一定要确保这个变量不存在，连空也不行，必须是 unset。

理论上来说，是不需要重启的，但我的环境变量是 `fcitx5-autostart` 这个 rpm 包在 `/etc/profile.d/fcitx5.sh`里面设置的，我需要重启系统来使新的环境变量生效。

重启后，如果没有什么意外的话，就算成功了。

## 绝对不会缺席的意外

很遗憾，我遇到了意外。

完成上述操作后，文字候选框依然有问题。

在老K的正确推测下，是因为我在 Fedora 下曾经使用过 `im-settings`，该程序在 `$HOME/.config/environment.d/` 路径下重新帮我设置回了 `QT_IM_MODULE` 这个变量，从而使得 tg 启动时还在使用 IM MODULE，而不是预期的 qt text input。

删除这两个影响环境变量的文件后，在 tg 输入时，fcitx5 的文字候选框恢复了正常。

## debug 过程中用到的两个方式

### dbus-send

```bash
dbus-send --print-reply=literal --dest=org.fcitx.Fcitx5 /controller org.fcitx.Fcitx.Controller1.DebugInfo
```

运行如上命令后，我得到了如下的输出

```
   Group [x11::1] has 0 InputContext(s)
Group [wayland:] has 5 InputContext(s)
  IC [a50fe208d42e4611b240c0b66a2fa0b9] program:konsole frontend:dbus cap:e001800060 focus:1
  IC [d7d4d5c05e9c445aab1af9c7dfb5fbd4] program:telegram-desktop frontend:dbus cap:e001800060 focus:0
  IC [ac72ec3edf58481bbdf838352520efd5] program:krunner frontend:dbus cap:e001820060 focus:0
  IC [d8b450176e204953837248f786204c29] program:plasmashell frontend:dbus cap:e001800060 focus:0
  IC [df252979343d42ebbe9bd82ead6ff194] program: frontend:wayland cap:40 focus:0
Input Context without group
```

老K指出，出现了 telegram 的那一行表明 tg 还是在用 IM Module，所以是环境变量有问题

### /proc 查看程序运行时的环境变量

![获取到的环境变量](https://static.031130.xyz/uploads/2024/08/12/62c138b030469.webp)

## 参考资料

[Use Plasma 5.24 to type in Alacritty (Or any other text-input-v3 client) with Fcitx 5 on Wayland](https://www.csslayer.info/wordpress/linux/use-plasma-5-24-to-type-in-alacritty-or-any-other-text-input-v3-client-with-fcitx-5-on-wayland/)

[Candidate window is blinking under wayland with Fcitx 5](https://fcitx-im.org/wiki/FAQ#Candidate_window_is_blinking_under_wayland_with_Fcitx_5)

[查看进程的环境变量](https://www.cnblogs.com/hupeng1234/p/6735403.html)

*注: 上述参考资料均已在 `web.archive.org` 和 `archive.ph` 做过存档，如遇到原站点无法访问的情况，可自行前往这两个站点查看存档。*
