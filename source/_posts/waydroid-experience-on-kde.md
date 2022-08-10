---
title: Waydroid on KDE 初体验
date: 2021-10-31 15:57:57
sticky:
index_img: https://npm.elemecdn.com/superbadguy-bed@0.0.6/3.svg
tags:
- Archlinux
- Waydroid
- KDE
- Experience
---

> 在[西木野羰基的博客](https://yanqiyu.info/)中看到了其在Fedora中使用waydroid跑明日方舟的[截图](https://cdn.jsdelivr.net/gh/karuboniru/blog_imgs@master/20211025232040.png)，心里有有些痒痒了，决定在Archlinux上尝试使用waydroid。

## Waydroid是什么

Waydroid是一个基于lxc容器技术，用以启动完整安卓系统的方案。

默认使用了LineageOS-17.1，对应 Aosp10，相比起 anbox 显然是更加新了。

![是长成这样](https://npm.elemecdn.com/superbadguy-bed@0.0.4/11.png)

## 内核支持

waydroid需要内核提供`Ashmem`和`binder`支持，西木野羰基是使用的自己编译的内核。而我在使用Archlinux，因此直接使用`linux-zen`即可。

> 注: AUR上的`linux-xanmod`虽然也有这些模块支持，但是在编译时设置了`psi=0`以提升性能，而waydroid恰巧需要`psi=1`的支持，故不可使用。

## 安装

Archlinux已经有人将其打包上传到了AUR，我们直接安装即可。我使用的 AUR Helper 是 yay，所以直接

```bash
yay -S waydroid --noconfirm
```

再装个`python-pyclip`解决剪切板同步的问题

```bash
yay -S python-pyclip
```

## 下载Waydroid镜像

```bash
sudo waydroid init
```

这一步将会自动（从SourceForge）下载纯净的LineageOS镜像压缩包并解压，处于中国大陆网络环境的用户记得（          ）

如果你需要Gapps，可以指定下载Gapps版本，但是这将需要你获取`Android ID`并向谷歌提交 Custom Rom 的 Gapps 申请。见[这里](https://www.google.com/android/uncertified/)

```bash
sudo waydroid init -s GAPPS
```

## 启用服务

这个没什么好说的，使用systemctl启动服务。

```bash
sudo systemctl start waydroid-container.service
```

## 开启waydroid

```bash
waydroid session start
```

## 一些简单的使用技巧

如果你想直接展示整个系统界面，可以使用

```bash
waydroid show-full-ui
```

我们也可以用`waydroid app launch ${package_name}`的方式来启动单个应用（包名可以使用`waydroid app list`来获取

当然，可以直接在Linux环境里 安装 某个apk

```bash
waydroid app install path/to/apkfile.apk
```

F11有助于解决应用分辨率问题，左Alt有助于解决键盘无法输入的问题。

Github上有个[脚本](https://github.com/casualsnek/waydroid_script)，可以帮助 安装OpenGapps/Magisk/arm转译库/获取Android ID。

## 牢骚时间

- 对AMD和英伟达的显卡支持都不太行
- 不能直接输入中文，还是得借助安卓系统内的输入法。
- 不自带arm转译库，通过脚本安装的转译库似乎兼容性挺差（至少我是成功打开什么arm软件
- 系统运行的流畅度还可以
- 相关的资料似乎有点少，官方的文档也没有写得太详细
- Waydroid会自动在`$HOME/.local/share/applications/`为wayland内的安装应用添加Desktop文件（这让我有些反感

## 一些截图

![](https://npm.elemecdn.com/superbadguy-bed@0.0.4/12.png)

![原生安卓从未变过的应用抽屉](https://npm.elemecdn.com/superbadguy-bed@0.0.4/13.png)

![这充电速度太刺激啦！](https://npm.elemecdn.com/superbadguy-bed@0.0.4/14.png)
