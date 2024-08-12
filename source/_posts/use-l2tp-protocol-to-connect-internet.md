---
title: 在 Archlinux 下使用 l2tp 协议连接校园网
date: 2022-09-29 14:30:46
sticky:
execrpt:
tags:
- Archlinux
- Network
---

> 由于高考爆炸，所以不得不进入浙江工地大专来度过自己接下来四年的人生（希望到时候可以借助学校的力量润出去）。

学校这边由于某些不可描述的原因，将校园卡与宽带捆绑销售，且每次登陆校园网时都需要使用定制的 l2tp 协议客户端进行上网，且该客户端将会禁用用户的无线网卡（~~这不明摆着想让我们宿舍每个人都花一次钱~~）。

![学校定制的 l2tp 拨号客户端](https://cdn.zhullyb.top/uploads/2024/08/12/63353e0e1978c.png)

更惨的是，学校仅提供了 Windows 与 MacOS 的客户端。

在 [BearChild](https://imbearchild.cyou/) 的提醒下，我意识到 Linux 下也可以有 l2tp 协议。

谷歌搜索了一番，我在简书上捞到了这篇文章[《ubuntu 连校园网 via l2tp》](https://www.jianshu.com/p/85cd5bd3c7a2)。不过这显然有些麻烦，我们的客户端不需要 pppoe 拨号，只需要插上网线后连接 l2tp 协议即可联网。

所幸，NetworkManager 非常贴心地为我们提供了 l2tp 的插件，在 Archlinux 下使用如下命令即可完成安装。

```bash
sudo pacman -S networkmanager-l2tp
```

安装完成后，就可以在图形化界面下进行我们的设置操作。

由于定制的客户端已经把 l2tp 服务器 ip 写死且显示在界面上了，我们就不需要再去抓包截取服务器 ip，直接使用这边的 `192.168.115.1` 即可。

![KDE 下的 NetworkManager l2tp 设置界面](https://cdn.zhullyb.top/uploads/2024/08/12/63354161dbe28.png)
