---
title: 使用 Windows 虚拟机运行虚拟专用网客户端为 Linux 提供内网环境
date: 2024-05-23 01:07:44
sticky:
execrpt:
tags:
- Linux
- Windows
- Virtual Machine
- Network
---

## 起因

最近在某家公司实习，公司内部的 git 部署在内网环境上，需要通过虚拟专用网的客户端（天翼云的 AONE）才能够正常访问。很可惜，客户端只提供了 Windows 和 MacOS 的版本。

![](https://cdn.zhullyb.top/uploads/2024/08/12/664e29866c1ab.webp)

工作的代码总是要提交的，我也不想改变我的开发环境，又不希望在 Windows 上使用 git-for-windows 这个近乎简陋的工具进行代码提交，更别说还有一些别的内网服务接下来可能也会用到。所以最好的办法就是在 Linux 下也配置好能够访问内网的环境。

## 理论

在 Windows 下使用 AONE 的网络拓扑是这样的

![](https://cdn.zhullyb.top/uploads/2024/08/12/664e2b93de6f9.webp)

而我的方案则是使用 Windows 虚拟机开启 AONE，并在这台虚拟机上开一个 socks5 server 负责代理 Linux 宿主机需要打到内网服务的流量。网络拓扑如下

![](https://cdn.zhullyb.top/uploads/2024/08/12/664e2e1b0da09.webp)

根据 bilibili 上[技术蛋老师的视频总结](https://www.bilibili.com/video/BV11M4y1J7zP/)，我们应该选择使用网卡桥接的网络配置，只有这个配置方式同时支持「宿主->虚拟机」和 「虚拟机->互联网」的网络。

![图片来源: bilibili 技术蛋老师](https://cdn.zhullyb.top/uploads/2024/08/12/664e2fbb4a36b.webp)

## 实操

### 在 Windows 虚拟机中开启虚拟专用网客户端

开启 AONE，不做赘述

### 开启 socks server，监听地址为 0.0.0.0 （或者设置为宿主机的 IP 地址）

在「[熊孩子(BearChild)](https://imbearchild.cyou/)」的推荐下，我这里采用的是大名鼎鼎的二级射线（某 V 字开头的常见软件），直接从 GIthub Release 中下载 Windows X64 的压缩包，简单配置下即可，如果没有什么特殊需求的话可以只修改图中的两处配置。

![](https://cdn.zhullyb.top/uploads/2024/08/12/664e328cd83b3.webp)

在终端中通过该软件的 run 命令即可开启服务

![](https://cdn.zhullyb.top/uploads/2024/08/12/664e32e6c350a.webp)

### 在宿主机进行测试

我这里使用的是 mzz2017 编写的 gg 命令进行代理，代理服务器的 ip 地址使用虚拟机下 ipconfig 命令获得的 ip 地址，端口号则对应上面配置文件中的 port 参数。

![](https://cdn.zhullyb.top/uploads/2024/08/12/664e33c3e8320.webp)

这里 curl 百度得到了正确的相应，说明通道是通的，gg 也可以用于代理浏览器。经实测能够正常访问公司内网服务，不便在博客中展示。
