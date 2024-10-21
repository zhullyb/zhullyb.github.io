---
title: 在 Linux 下使用 mitmproxy 抓取 HTTPS 流量
date: 2024-02-29 22:03:58
sticky:
execrpt:
tags:
- Linux
- Archlinux
- Network
- mitmproxy
---

作为部分 AUR Package 的 maintainer，一直以来我都有在 Linux 下抓取 https 流量的需求，比如抓取应用内的更新检测时访问的 url 地址。之前一直没有空去研究，趁着最近课少，总算是完成了这个目标。

在这里我使用的 mitmproxy，基于 python 和 webui 的一款开源简洁的流量代理软件，可以用于抓取 https 流量信息。

## 安装 mitmproxy

在 Arch Linux 下，官方 `extra` 源中已经打包好了这款软件，直接使用下面的命令即可完成安装。

```bash
sudo pacman -S mitmproxy
```

## 尝试运行 mitmweb

安装完成后，我们将会获得三个新的命令可用：

- mitmdump
- mitmproxy
- mitmweb

我们只要使用 mitmweb 即可同时打开 8080 的代理端口和 8081 端口的 webui。访问 http://127.0.0.1:8081 即可看到 mitmproxy 的网页。

![mitmweb 的界面](https://static.031130.xyz/uploads/2024/08/12/65e092503d5bb.webp)

当然，也可以在 mitmweb 命令后面追加 -p <PORT> 和 --web-port=<PORT> 分别设置代理端口和 webui 的端口。

首先，我们先运行一次 `mitmweb`

## 安装 ca 证书

为了解密 https 流量，我们需要为系统安装上 mitmproxy 自己的证书文件，让系统信任我们的证书。

先来看看 `/usr/share/ca-certificates/trust-source/README` 这个文件

```
This directory /usr/share/ca-certificates/trust-source/ contains CA certificates
and trust settings in the PEM file format. The trust settings found here will be
interpreted with a low priority - lower than the ones found in 
/etc/ca-certificates/trust-source/ .

=============================================================================
QUICK HELP: To add a certificate in the simple PEM or DER file formats to the
            list of CAs trusted on the system:

            Copy it to the
                    /usr/share/ca-certificates/trust-source/anchors/
            subdirectory, and run the
                    update-ca-trust
            command.

            If your certificate is in the extended BEGIN TRUSTED file format,
            then place it into the main trust-source/ directory instead.
=============================================================================

Please refer to the update-ca-trust(8) manual page for additional information.
```

这份文件告诉我们可以在 `/usr/share/ca-certificates/trust-source/anchors/` 路径下放置 PEM 证书文件，并使用 `update-ca-trust` 命令更新系统的信任。

mitmproxy 软件第一次运行时，将会在当前用户的 `$HOME/.mitmproxy/` 文件夹下生成证书，我们打开这个文件夹，发现一共有六个文件：

- mitmproxy-ca-cert.cer 
- mitmproxy-ca-cert.p12 
- mitmproxy-ca-cert.pem 
- mitmproxy-ca.p12 
- mitmproxy-ca.pem 
- mitmproxy-dhparam.pem

我们这里需要将 `mitmproxy-ca-cert.pem` 文件复制到 `/usr/share/ca-certificates/trust-source/anchors/` 路径下

```bash
sudo cp $HOME/.mitmproxy/mitmproxy-ca-cert.pem /usr/share/ca-certificates/trust-source/anchors/
```

随后执行 `update-ca-trust`

```bash
sudo update-ca-trust
```

这样便完成了 ca 证书的安装

## 使目标软件使用 8080 端口通信

其实我试过使用透明代理进行抓包，只不过我的 Archlinux 是作为日常主力机使用的，系统无时无刻不在向外通信，透明代理以后 mitmproxy 的 webui 各种刷屏，便放弃了这个想法，选择指定目标软件使用 8080 端口通信。

网上比较常见的做法是使用 `proxychains-ng` 代理目标软件。这个方案是可行的，只不过我这边测试下来，部分软件使用 proxychains 代理以后出现了仍然不使用代理、无法联网、甚至直接崩溃的情况。

![程序崩溃](https://static.031130.xyz/uploads/2024/08/12/65e09559dceef.webp)

因此我转向了 [gg](https://github.com/mzz2017/gg)。gg 和 proxychains-ng 的定位相同，都是使目标命令通过指定的代理进行通信，只不过 gg 解决了部分 golang 编写的软件无法被 proxychains 代理的问题，并支持一些常见的用来国际联网的协议。

在不对 gg 进行配置的情况下，每次启动时，gg 都会要求我们输入代理地址，这正合我意。

![gg 要求输入代理地址](https://static.031130.xyz/uploads/2024/08/12/65e0963840449.webp)

此时，软件正常启动，流量全部经过 mitmproxy，可以在 webui 上看到具体情况

## 抓包成功

![命令行下看到流量信息](https://static.031130.xyz/uploads/2024/08/12/65e097dfe1f17.webp)
![mitmweb 正常获取解密后的流量信息](https://static.031130.xyz/uploads/2024/08/12/65e09780dd2c0.webp)

我们可以看到 mitmproxy 成功捕获并解密的 https 流量，针对图片等信息甚至可以直接实现预览。
