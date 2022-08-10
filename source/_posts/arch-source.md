---
title: 竹林源
date: 2021-03-12
tags:
- Archlinux
---



# 无力维护，现已将 `arch.zhullyb.top` 和 `mirror.zhullyb.top` 的所有请求分别转发到 [Clansty](https://lwqwq.com/about) 维护的 `repo.lwqwq.com` 和 `pacman.ltd` ，如果您凑巧看到本消息，建议立即访问 [pacman.ltd](https://pacman.ltd/) 并按照其要求修改源配置文件。



## ~~Hello，这里是竹林里有冰的私人源。~~

 ~~其实Archlinux已经有了一个打包了各种常用软件的第三方源叫archlinuxcn，国内拥有多个镜像站为其提供镜像服务。但是他们作为一个开源社区，显然会受到许多限制，诸如不能收录未经授权的商业软件等。目前已经有多个软件因为没有得到授权而不得不下架，详见 [#1968](https://github.com/archlinuxcn/repo/issues/1968)、[#2455](https://github.com/archlinuxcn/repo/issues/2455)、[#2458](https://github.com/archlinuxcn/repo/issues/2458)、[#2460](https://github.com/archlinuxcn/repo/issues/2460)、[#2462](https://github.com/archlinuxcn/repo/issues/2462)。因此我创建了这样一个方便我自己使用的源。~~

~~主要收集了一些**侵权软件、闭源软件、不清真的软件**，目前主要是作为archlinuxcn源的补充。~~

~~目前源在OneDrive上，采用[onemanager](https://github.com/qkqpttgf/OneManager-php)解析直链，速度取决于各位的网络供应商。~~

#### ~~使用方法：~~

~~在 ```/etc/pacman.conf``` 尾部添加~~

```
[zhullyb]
SigLevel = Never
Server = https://mirror.zhullyb.top
Server = https://arch.zhullyb.top
```

 ~~注，我这里将SigLevel指定为Never，是因为我认为我一个辣鸡的个人源没有必要验证keyring，况且由于OneDrive的直链解析会带来较高的延迟，再额外下载一个sig文件将会极大地破坏体验。~~

~~如果你坚持要验证，我这里也提供了`zhullyb-keyring`，请自行下载以后使用`pacman -U`进行安装。此外，由于`pacman`会通过拼接db跳转的链接来下载sig签名，会导致onedrive返回的报错信息被pacman误认为sig文件，这里可以使用由[web-worker.cn](https://web-worker.cn)站长提供的反代，使pacman尝试下载sig文件时接收到404状态码来跳过对db的验证。~~

```
Server = https://pkg.web-worker.cn/zhullyb/
```

#### ~~**现有软件列表**~~

| Removed. |
| :------------------------------ |
