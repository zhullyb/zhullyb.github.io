---
title: Archlinux坚果云踩坑实录
top: false
tags:
- Archlinux
date: 2021-10-02 00:21:34
---

> 在Archlinux上，坚果云似乎出现了一些问题。

## 安装

```bash
yay -S nutstore
```

这个没什么可说的，AUR还是Archlinuxcn都无所谓，都是一模一样的。

## 白屏

双击图标，咦？怎么白屏了？

![白屏](https://s3.jpg.cm/2021/10/02/ImawUi.png)

看看AUR评论区，有人说`nutstore-experimental`修了？

![AUR评论区](https://s3.jpg.cm/2021/10/02/Imaook.png)

对比了一下，就是改了改`/opt/nutstore/conf/nutstore.properties`

```bash
sudo sed -i 's|webui.enable=true|webui.enable=false|' /opt/nutstore/conf/nutstore.properties
```

轻松解决

## 窗口太小不能登陆

![调出窗口规则设置界面](https://s3.jpg.cm/2021/10/02/Ima25C.png)

![进行设置](https://s3.jpg.cm/2021/10/02/Ima3Nt.png)

![完成](https://s3.jpg.cm/2021/10/02/ImahLz.png)

## 桌面使用了暗色主题导致部分字体不清晰？

![这字体鬼看得见？](https://s3.jpg.cm/2021/10/02/Ima9D4.png)

参考[使用fakehome方案暂时解决跑在KDE暗色主题下的程序使用亮色字体的问题](/2021/09/05/wrong-fonts-color-fix-under-kde-with-a-dark-theme/)编写启动命令

```bash
bwrap --dev-bind / / --tmpfs $HOME/.config /usr/bin/nutstore
```

![测试通过](https://s3.jpg.cm/2021/10/02/ImaiFD.png)

修改`/usr/share/applications/nutstore.desktop`文件

```bash
sudo sed -i "s|$(grep Exec /usr/share/applications/nutstore.desktop)|Exec=bwrap --dev-bind / / --tmpfs $HOME/.config /usr/bin/nutstore|" /usr/share/applications/nutstore.desktop
```

