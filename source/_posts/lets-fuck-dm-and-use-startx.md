---
title:      抛弃DisplayManager，拥抱startx
date:       2021-03-14
tags:       Linux
---

在正常情况下，我们会给Linux装上一个DisplayManager以方便我们输入账号密码来进入图形化系统，但是我不想要额外装一个DM来启动我的图形化系统（而且之前我一直用的sddm也出过一小阵子的问题）

首先卸载我的sddm

```shell
sudo pacman -Rsnc sddm sddm-kcm
```

安装startx所在的软件包

```shell
sudo pacman -S xorg-xinit
```

从/etc/X11/xinit/xinitrc拷贝一份.xinitrc

```shell
cp /etc/X11/xinit/xinitrc ~/.xinitrc
```

注释掉最后5行

```
#twm &
#xclock -geometry 50x50-1+1 &
#xterm -geometry 80x50+494+51 &
#xterm -geometry 80x20+494-0 &
#exec xterm -geometry 80x66+0+0 -name login
```

然后需要在结尾处写上我们的配置。我用的桌面是Plasma，查询[wiki](https://wiki.archlinux.org/index.php/KDE#From_the_console)

To start Plasma with xinit/startx, append export DESKTOP_SESSION=plasma and exec startplasma-x11 to your .xinitrc file. If you want to start Xorg at login, please see Start X at login.

然后在xinitrx文件末尾处写上我们的配置

```
export DESKTOP_SESSION=plasma
startplasma-x11
```
Ps: 在第二行中，wiki中让我们使用exec，代表当xorg桌面会话结束后自动退出当前用户，而我不想退出，所以没加

至此，我们的startx就已经配置完成了，重启后只需要在tty界面登录用户后输入```startx```并回车即可进入图形化界面。