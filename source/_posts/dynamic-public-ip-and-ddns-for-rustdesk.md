---
title: 使用动态公网 ip + ddns 实现 rustdesk 的 ip 直连
date: 2024-06-30 18:15:00
sticky:
execrpt:
tags:
- Linux
- OpenSource Project
- Shell Script
- Rustdesk
- Router
- HomeServer
---

最近跟风整了一台 n100 的迷你主机装了个 Archlinux 当 HomeServer，搭配上了显卡欺骗器，平常一直远程使用，因此需要实现稳定的远程桌面连接。开源软件 Rustdesk 本身对 Linux 的适配尚可，可惜官方提供的服务器位于境外，且前一阵子因为诈骗相关的风波使得官方对连接做出了一些限制，应当使用自建服务器或者 ip 直连。

单从网络安全的角度出发，最佳实践应该是通过 wireguard 或者别的协议先接入局域网，然后使用局域网内的 ip 直连，这是最稳妥的，但我有点懒，而且我可能会在多个设备上都有控制 HomeServer 的需求，给所有设备配置 wireguard 是一件挺麻烦的事情，因此我决定放弃安全性，直接公网裸奔。

在学校宿舍的电信宽带提供了一个动态公网 ip，因此只需要设置好 ddns 和端口转发就可以拿到一个固定的 domain + port 提供给 rustdesk 直连。

## 在被控端 Rustdesk 允许直连访问

在「设置」中的「安全」一栏选择「解锁安全设置」，拉到最下面的「安全」栏，勾选「允许 IP 直接访问」，并选择一个端口，范围在 1000 ~35535 之间且不要被本地的其他程序占用，Rustdesk 的默认值为 21118。

可以直接在局域网内的另一台设备进行测试，直接在 Rustdesk 中输入被控端的局域网 ip 和刚刚设置的端口，看看能不能访问得通，如果不行可能需要排查一下被控端访问墙设置的问题。

![](https://cdn.zhullyb.top/uploads/2024/08/12/66814701cf7ce.webp)

## ddns

由于我的域名是交给 cloudflare 进行解析的，就找了个[支持 cloudflare 的 ddns 脚本](https://github.com/yulewang/cloudflare-api-v4-ddns/)，大致的部署过程可以参考 [「自建基于Cloudflare的DDNS」](https://www.rclogs.com/2023/06/%25e8%2587%25aa%25e5%25bb%25ba%25e5%259f%25ba%25e4%25ba%258ecloudflare%25e7%259a%2584ddns)，不过我小改了一下脚本中获取公网 ipv4 的方式，直接 ssh 到路由器上获取当前的 ipv4 地址，不依赖外部的服务。

```bash
WAN_IP=`ssh -o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedKeyTypes=+ssh-rsa root@192.168.1.1 'ip -br a' | grep pppoe-wan | awk '{print $3}'`
```

理论上来说，有不少路由器自身就支持不少域名解析商

## 端口转发

端口转发需要在路由器的后台设置进行，我这里路由器使用的是 openwrt 系统，大部分路由器应该都支持这个操作。

在「网络」-「防火墙」

![](https://cdn.zhullyb.top/uploads/2024/08/12/6681635804e68.webp)

选择「端口转发」

![](https://cdn.zhullyb.top/uploads/2024/08/12/66817e416534c.webp)

新建端口转发，共享名随便填，外部端口是你最终要在主控端输入的端口，内部 IP 地址是被控机 的 IP 地址，可以用 `ip -br a` 命令看到，内部端口就是上文在 Rustdesk 指定的端口号。

## 效果

可以直接在主控端口输入 ddns 的域名和端口号，实现远程控制

![](https://cdn.zhullyb.top/uploads/2024/08/12/66817f77aae7e.webp)
