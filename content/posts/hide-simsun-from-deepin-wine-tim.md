---
title: 禁止deepin-wine-tim使用simsun字体渲染
date: 2021-04-27
description: 本文介绍了如何在 Arch Linux 系统中通过 bwrap 命令屏蔽 deepin-wine-tim 对 simsun 字体的调用，从而改善 TIM 客户端的字体渲染效果。作者详细说明了操作步骤，包括定位字体文件、使用 bubblewrap 工具隔离字体路径，并修改桌面启动文件以实现持久化配置。适用于使用 deepin-wine 运行 TIM 或 QQ 且希望获得更清晰现代字体显示效果的用户。方法同样适用于 deepin-wine-qq，但不保证适用于其他安装方式或版本。
tags:
- Archlinux
- Linux
- Bwrap
---

> 本文中，我通过bwrap命令对运行Tim的wine程序屏蔽了simsun字体以获得了一个更为舒适的字体渲染效果。我所使用的Tim为`deepin-wine-tim`，至于`deepin-wine-qq`通过相同的方式应该也能达到相同的效果，spark商店的Tim我自己测试下来似乎是没法达到这样的效果，而使用其他方法安装simsun字体的网友们则需要注意灵活变通，不要照抄我给出的字体路径。

在Archlinux下，我们通常会使用deepin-wine5来运行QQ/Tim.

但是当我们在系统中倒入simsun字体时，无论使用什么奇迹淫巧似乎都无法阻止deepin-wine5找到simsun并优先使用它。于是，字体渲染就会变成如图这样奇奇怪怪的画风: 

![](https://static.031130.xyz/uploads/2024/08/12/62f3c887040ff.webp)

但是我并不喜欢这样的渲染效果，使用simsun渲染出来的字体总感觉有一种上世纪的风格，况且，在我的1080p小屏下显示并不清晰。

于是，在尝试了更改注册表、在wine容器的系统路径下直接塞入字体文件等等方式无果后，我选择了逃避——直接让wine程序读取不到simsun。

我的simsun是通过`ttf-ms-win10-zh_cn`这个包安装上去的，被安装在`/usr/share/fonts/TTF/`路径下。

使用`pacman -Qo /usr/share/fonts/TTF/`命令查找这个路径下所安装的字体包，我这里的输出如下:

```
[zhullyb@Archlinux ~]$ pacman -Qo /usr/share/fonts/TTF/
/usr/share/fonts/TTF/ is owned by ttf-cascadia-code 2102.25-1
/usr/share/fonts/TTF/ is owned by ttf-fira-code 5.2-1
/usr/share/fonts/TTF/ is owned by ttf-hack 3.003-3
/usr/share/fonts/TTF/ is owned by ttf-monaco 6.1-6
/usr/share/fonts/TTF/ is owned by ttf-ms-win10-zh_cn 2019ltsc-1
/usr/share/fonts/TTF/ is owned by ttf-opensans 1.101-2
```

可以看到，并没有什么对wine程序运行特别重要的字体包，于是我计划通过bwrap命令对运行Tim的wine程序直接屏蔽这个路径。

首先安装提供`bwrap`命令的`bubblewrap`程序: `sudo pacman -S bubblewrap --needed`

通过查找deepin-wine-tim的desktop文件发现Tim的启动命令是`/opt/apps/com.qq.office.deepin/files/run.sh`

在终端中输入命令进行测试`bwrap --dev-bind / / --tmpfs /usr/share/fonts/TTF/ /opt/apps/com.qq.office.deepin/files/run.sh`

出现如下界面，看来方法是可行的。

![](https://static.031130.xyz/uploads/2024/08/12/62f3c88b119f8.webp)

于是，我们进一步更改deepin-wine-tim的desktop文件，以方便我们不需要每次都在Terminal中执行这么一大长串命令。需要更改的地方如下图红色方框圈出部分

![](https://static.031130.xyz/uploads/2024/08/12/62f3c88f41790.webp)

我这里附一下图中的命令方便诸位复制粘贴。

```
[zhullyb@Archlinux ~]$ cat /usr/share/applications/com.qq.office.deepin.desktop 
#!/usr/bin/env xdg-open

[Desktop Entry]
Encoding=UTF-8
Type=Application
X-Created-By=Deepin WINE Team
Categories=chat;Network;
Icon=com.qq.office.deepin
Exec=bwrap --dev-bind / / --tmpfs /usr/share/fonts/TTF/ /opt/apps/com.qq.office.deepin/files/run.sh
Name=TIM
Name[zh_CN]=TIM
Comment=Tencent TIM Client on Deepin Wine
StartupWMClass=tim.exe
MimeType=
```

