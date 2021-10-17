---
title: 来，从AUR给Fedora偷个包
date: 2021-07-23 01:50:09
tags: 
- Linux
- Archlinux
- Fedora
---

> 前一阵子，某Q群里的某初中生居然跳上了Fedora这辆灵车，还一直缠着我要我给他整个打rpm包的教程，说什么要复兴FedoraCN之类的我听不懂的话。碰巧听说Fedora似乎还没有wechat-uos，于是我就寻思着给Fedora打一个，顺便熟悉一下dnf的操作。
>
> 事实上，Fedora和Archlinux的目录结构很相似，理论上来讲Archlinux的大部分包都可以直接解压后塞到Fedora里直接用，对于咱这种日常偷Deb包的Arch用户来说基本没什么难度，唯一的难点在于处理依赖关系。

**Tips1: 使用电脑端的访客可以在页面左下角打开侧栏以获取目录。**

### 下载链接

如果你是为了wechat-uos这个包而非教程而来的，下载链接在这里。[https://zhullyb.lanzoui.com/ikN55rqr7ah](https://zhullyb.lanzoui.com/ikN55rqr7ah)

### 偷包环境

- Archlinux实体机(打包)

- Fedora虚拟机(依赖查询、测试)

### 准备好wechat-uos

首先，咱们先在Archlinux上把我们的`wechat-uos`先打包好，这个老生常谈的问题我不多赘述了。

```bash
yay -S wechat-uos --noconfirm
```

### 查找wechat-uos在Archlinux上所需的依赖

再去查看`wechat-uos`所需要的依赖

```
[zhullyb@Archlinux ~]$ yay -Si wechat-uos
:: Querying AUR...
Repository      : aur
Name            : wechat-uos
Keywords        : electron  patched  uos  wechat  weixin
Version         : 2:2.0.0-1145141919
Description     : UOS专业版微信 (迫真魔改版)
URL             : https://www.chinauos.com/resource/download-professional
AUR URL         : https://aur.archlinux.org/packages/wechat-uos
Groups          : None
Licenses        : MIT
Provides        : None
Depends On      : gtk2  gtk3  libxss  gconf  nss  lsb-release  bubblewrap
Make Deps       : imagemagick
Check Deps      : None
Optional Deps   : None
Conflicts With  : None
Maintainer      : DuckSoft
Votes           : 16
Popularity      : 0.603501
First Submitted : Wed 30 Dec 2020 12:21:51 PM CST
Last Modified   : Sat 20 Feb 2021 06:53:24 AM CST
Out-of-date     : No
```

### 查找Fedora上的对应依赖包名

然后我们需要去Fedora上找一找这些依赖在Fedora上的包名都叫什么。

比如这个`bubblewrap`，我们需要的是他提供的`bwrap`，所以我们直接在Fedora上`sudo dnf provides bwrap`

再比如`gconf`并没有在`/usr/bin`路径下直接留下什么非常具有代表性的可执行文件，所以在Fedora里面寻找等效包就稍微复杂一些，但也并非不能找。

先在Archlinux下使用`pacman -Ql gconf`，输出结果有点长，我就截一小段上来。

```
[zhullyb@Archlinux ~]$ pacman -Qlq gconf
/etc/
/etc/gconf/
/etc/gconf/2/
/etc/gconf/2/evoldap.conf
/etc/gconf/2/path
/etc/gconf/gconf.xml.defaults/
/etc/gconf/gconf.xml.mandatory/
/etc/gconf/gconf.xml.system/
/etc/xdg/
/etc/xdg/autostart/
/etc/xdg/autostart/gsettings-data-convert.desktop
/usr/
/usr/bin/
/usr/bin/gconf-merge-schema
/usr/bin/gconf-merge-tree
/usr/bin/gconfpkg
/usr/bin/gconftool-2
......
```

可以发现，`gconf`还是有不少文件是非常具有代表性的，比如这里的`/usr/bin/gconf-merge-tree`，我们在Fedora上使用`sudo dnf provides gconf-merge-tree`很容易就能找到对应的包是`GConf2`。

`lsb-release`这个依赖中，我们只是需要`/etc/lsb-release`这个文件存在让我们的bwrap可以顺利地伪装成uos的样子。Fedora中虽然有`redhat-lsb-core`这个包算是`lsb-release`的等效包，但是并不提供这个文件，因此我们只需要在待会儿打包的时候带一个`/etc/lsb-release`的空文件即可，不需要将`redhat-lsb-core`写进依赖。

最终我们可以确定下来需要的依赖为`gtk2,gtk3,libXScrnSaver,nss,bubblewrap,GConf2`。

### 准备打包

#### 安装`rpm-tools`

```bash
sudo pacman -S rpm-tools
```

#### 生成工作路径

```bash
mkdir -pv $HOME/rpmbuild/{BUILD,BUILDROOT,RPMS,SOURCES,SPECS,SRPMS}
```

#### 编写 spec 文件

```bash
Name: wechat-uos
Version: 2.0.0
Release: 1
Summary: A wechat client based on electron.
License: None
URL: https://www.chinauos.com/resource/download-professional
Packager: zhullyb

Requires: gtk2,gtk3,libXScrnSaver,nss,bubblewrap,GConf2

AutoReqProv: no

%description

%prep

%pre

%post

%preun

%postun

%files
/etc/lsb-release
/opt/wechat-uos/
/usr/bin/wechat-uos
/usr/lib/license/libuosdevicea.so
/usr/share/applications/wechat-uos.desktop
/usr/share/icons/hicolor/128x128/apps/wechat.png
/usr/share/icons/hicolor/16x16/apps/wechat.png
/usr/share/icons/hicolor/256x256/apps/wechat.png
/usr/share/icons/hicolor/48x48/apps/wechat.png
/usr/share/icons/hicolor/64x64/apps/wechat.png
```

#### 处理source

> 一般来说，我们需要配置各种奇奇怪怪的编译命令，但是我这里直接选择了打包二进制文件，一来是减少了对于spec的学习成本，二来是因为wechat-uos本来就不开源，也没什么好编译的。

创建我们`wechat-uos`的二进制文件所需要放入的文件夹。

```bash
mkdir $HOME/rpmbuild/BUILDROOT/wechat-uos-2.0.0-1.x86_64
```

将我们的wechat-uos直接放入对应的文件夹中

![解压原先打包好的wechat-uos](https://pp1.edgepic.com/2021/09/17/bda910917093156.png)

补上我们的`/etc/lsb-release`

```
mkdir $HOME/rpmbuild/BUILDROOT/wechat-uos-2.0.0-1.x86_64/etc/
touch $HOME/rpmbuild/BUILDROOT/wechat-uos-2.0.0-1.x86_64/etc/lsb-release
```

### 正式打包

```
rpmbuild -bb --target=x86_64 SPECS/wechat-uos.spec --nodeps
```

![打包成功](https://pp1.edgepic.com/2021/09/17/93e5a0917093157.png)

### 安装测试

```bash
sudo dnf install ./wechat-uos-2.0.0-1.x86_64.rpm
```

![测试通过](https://pp1.edgepic.com/2021/09/17/2c7790917093158.png)

### 写在最后

rpm的打包工具是我近期**最**想吐槽的东西了，主要槽点有两个。

其一是：rpm在打包时的默认状态下，会使用 `file` 命令判断文件，如果是二进制的，用ldd判断依赖；如果是脚本，过滤文件中对应的 `use`/`requires`/`import` 语句，以此来找出内部依赖。**这固然是个非常贴心的小善举，**能够确保软件正常运行，**但完全有可能造成比较奇怪的问题。**比如我本次打包中rpm**自作聪明**地给我添加了一个`libffmpeg.so`的依赖，这东西整个Fedora自带的四个源里都不存在，在安装测试的时候出现了找不到依赖的情况。想我这种添加了找不到依赖的情况还算是运气好的，之前听说有人在使用opensuse的某个私人源的时候发现安装网易云音乐居然吧wps-office都给依赖上了，我想就是rpm自动检测到了网易云需要某个库，而wps恰好自带了这个库而导致的依赖误报。在Archlinux中，我们有一个叫`namcap`的小工具能够使用类似的方法检测软件运行时可能所需要的内部依赖，但他并不会默认启用，更不会自说自话的就直接把他添加为依赖，连一声也不吭。

其二是：rpm检测新增包内文件是否与系统已安装的软件包内的文件因为使用相同路径而冲突时，不仅会核对是否有冲突的同路径同名文件，他**还会核对文件夹**的文件占用情况。这说起来可能会有些抽象，我举个例子。在Fedora中，`/usr/bin`路径是被`filesystem`这个包所占有的，所以其他包在打包时是不能直接使用`/usr/bin`、`/usr`、甚至`/`来限定包内文件的范围的（也就是上面spec文件中的%files区域）。而我在第一次打包时，想要直接打包`BUILDROOT`下的所有文件，于是%files就直接填写了`/`作为限定，安装时提示`/usr/bin`和`/usr/lib`被`filesystem`这个包所占用，文件冲突。为此我还特意去仔细对比了Fedora自带的`filesystem`和我这个`wechat-uos`是否有冲突的文件，实则证明并没有，只是单纯这个**检测机制过于死板**罢了。而在Archlinux中，pacman安装时只会检测包内的文件是否与系统内的现有文件路径产生冲突，而不会非常无意义的去限定哪个文件夹是属于哪个包的。

### **附上本文的参考资料**

> 为了避免源网页失效，我特意去[互联网档案馆](http://web.archive.org)做了备份

「[RPM打包原理、示例、详解及备查](https://blog.csdn.net/get_set/article/details/53453320)」							 「[Archive](http://web.archive.org/web/20210722180835/https://blog.konghy.cn/2015/11/13/rpmbuild/)」

「[在 Ubuntu 下直接将二进制文件制作成 rpm 包](https://blog.konghy.cn/2015/11/13/rpmbuild/)」		「[Archive](http://web.archive.org/web/20210722180859/http://blog.sina.cn/dpool/blog/s/blog_6a5aee670101r1si.html)」

「[解除RPM包的依赖的方法](http://blog.sina.cn/dpool/blog/s/blog_6a5aee670101r1si.html)」											「[Archive](http://web.archive.org/web/20210722180936/https://blog.csdn.net/get_set/article/details/53453320)」



*本文同时发布于「[知乎专栏](https://zhuanlan.zhihu.com/p/392650904)」，如果你恰好有知乎帐号的话或许可以考虑帮我点个赞？*
