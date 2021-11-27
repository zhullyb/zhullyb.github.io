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

## 本地markdown文件的文件类型被识别成了「坚果云 Markdown」

这个是由于坚果云自作主张推广他自己并不好用的lightapp，写了几条 mime 的规则，如图

![没错，整整5个xml](https://res.cloudinary.com/zhullyb/image/upload/v1/2021/11/26/31742e8c2e46e5c093e45b716f48ddf5.png)

看来在我们的启动命令中也需要防止坚果云接触到`$HOME/.local/share/`这个路径，所以现在的启动命令得写成这样。

```bash
bwrap --dev-bind / / --tmpfs $HOME/.config --tmpfs $HOME/.local/share/ /usr/bin/nutstore
```

## 修改desktop文件，使其使用我们自己攥写的启动命令

首先，复制一份desktop文件到我们的 $HOME 目录下，好处是下次更新的时候我们所做的更改不会被包管理器覆盖。

```bash
cp /usr/share/applications/nutstore.desktop $HOME/.local/share/applications/
```

再修改`$HOME/.local/share/applications/nutstore.desktop`

```diff
[Desktop Entry]
Encoding=UTF-8
Type=Application
Terminal=false
Icon=nutstore
-Exec=/usr/bin/nutstore
+Exec=bwrap --dev-bind / / --tmpfs $HOME/.config --tmpfs $HOME/.local/share/applications 
StartupWMClass=Nutstore
Name=Nutstore
Name[zh_CN]=坚果云 
Comment=Data Sync, Sharing, Backup
Comment[zh_CN]=数据同步,共享和备份
Categories=Network;Application;
```

