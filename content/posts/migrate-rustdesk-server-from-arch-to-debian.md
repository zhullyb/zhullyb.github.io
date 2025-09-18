---
title: 将 Rustdesk 中继服务从 Arch Linux 迁移至 Debian
date: 2024-09-20 03:20:38
description: 本文详细记录了将 RustDesk 中继服务从 Arch Linux 迁移至 Debian 的完整过程。内容包括迁移背景、密钥备份方法、Debian 服务器上的软件安装步骤、密钥替换路径、防火墙端口配置及客户端连接设置。适合正在使用或计划自建 RustDesk 服务的用户参考，尤其适合希望从 Arch Linux 转向更稳定发行版的运维人员和开发者。文章还提供了实际操作的脚本和截图，帮助读者顺利完成迁移并确保服务无缝衔接。
sticky:
tags:
- Rustdesk
- Archlinux
- Debian
- Linux
---

这次迁移主要是两方面原因，一来是我安装了 Arch Linux 的 VPS 要过期了，续费价格过高，没有续费的动力；二来是手上的 VPS 越来越多，逐渐意识到 Arch Linux 作为滚动发行版，每次安装新的软件都要 Syu 甚至重启系统，实在没有太多的精力去维护，这也是为什么 Arch Linux 仅适合桌面发行版。

原本在 Arch Linux 上部署的 rustdesk server 我是按照这篇文章「[(水文)在archlinux上部署rustdesk服务端](https://www.liyp.cc/archives/1698241638248)」部署的。本身没什么技巧，直接从 AUR 安装现成的 rustdesk-server-bin，使用 systemctl 启用 `rustdesk-server-hbbr.service` 和 `rustdesk-server-hbbs.service` 两个服务即可。

Rustdesk 现在为 Debian 提供了官方的中继服务器的 deb 包，而谷歌搜了一圈都是下载 zip 包使用 pm2 管理进程，故写下此文。

## 备份原服务器的 rustdesk 密钥

AUR 上的安装方案将密钥放在 `/opt/rustdesk-server/data` 直接用 sftp 获取 `id_ed25519` 和 `id_ed25519.pub` 两个文件就行。如果是新部署的没有这两个文件也没事，rustdesk 服务在启动时可以自动创建，只不过需要在客户端重新输入公钥。

```
sftp> get /opt/rustdesk-server/data/id_ed25519
sftp> get /opt/rustdesk-server/data/id_ed25519.pub
```

## 在新服务器上下载 deb 包，进行安装

```bash
apt install -y curl jq
version=$(curl -s https://api.github.com/repos/rustdesk/rustdesk-server/releases/latest | jq .tag_name)

hbbr_deb=rustdesk-server-hbbr_${version:1:-1}_amd64.deb
hbbs_deb=rustdesk-server-hbbs_${version:1:-1}_amd64.deb
utils_deb=rustdesk-server-utils_${version:1:-1}_amd64.deb

for deb in $hbbr_deb $hbbs_deb $utils_deb
do
    curl -L https://github.com/rustdesk/rustdesk-server/releases/download/${version:1:-1}/${deb} -o ${deb}
done

dpkg -i $hbbr_deb $hbbs_deb $utils_deb
rm $hbbr_deb $hbbs_deb $utils_deb
```

简单写了个脚本，仅适用 amd64，也没做异常处理，如果服务器在大陆境内需要自行解决 github 下载时可能出现的网络波动问题。

dpkg 安装结束后默认会启用两个 systemd 服务并开机自启，所以不需要使用 systemctl 手动启用。

## 替换密钥

将刚刚备份的一个公钥和一个私钥放在 Debian 服务器的相应路径，问题是这个路径在哪里呢？

通过翻看 rustdesk 的 service 文件，我们大概可以定位到是在 `/var/lib/rustdesk-server/` 路径下的

![service 问价你](https://static.031130.xyz/uploads/2024/09/20/59d08477f8a0b.webp)

直接对两个密钥文件进行替换，重启 rustdesk 相关的两个 service 服务即可。

![密钥文件](https://static.031130.xyz/uploads/2024/09/20/527c5b1151a57.webp)

## 开放服务器防火墙

需要开放如下端口，记得 Linux 的防火墙和云服务供应商面板（如果有的话）上都要开放

- TCP(**21115, 21116, 21117, 21118, 21119**)
- UDP(**21116**)

## 客户端设置

id_ed25519.pub 对应客户端中需要输入的 Key，大概长成下面这个样子

```
rdtxujYccRLXwXOu2KR3V9cGgP51lEdSmE0HJHGNkn4=
```

![](https://static.031130.xyz/uploads/2024/09/20/cc715265b8b37.webp)

ID 服务器直接输入中继服务器的 ip 或者解析到对应 ip 的域名即可，另外两个地址可以不填，RustDesk会自动推导（如果没有特别设定）

## 成果展示

![成果展示](https://static.031130.xyz/uploads/2024/09/20/3108bac773390.webp)

## 参见

- [Installation :: Documentation for RustDesk](https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/install/)
- [RustDesk Debian 自建中继服务器](https://catcat.blog/rustdesk-debian-自建中继服务器.html)
- [(水文)在archlinux上部署rustdesk服务端](https://www.liyp.cc/archives/1698241638248)
