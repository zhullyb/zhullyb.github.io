---
title: 在 Arch Linux 下配置使用 HP Laser 103w 打印机无线打印
date: 2024-07-14 18:30:33
sticky:
execrpt:
tags:
- Archlinux
- Hardware
- Linux
- Printer
- HomeServer
- 笔记
---

我寝室有一台使用 wifi 连接的 HP Laser 103w 打印机，这些天刚好布置了新的 HomeServer，因此来记录一下这台打印机的配置过程，根据 HP 官网驱动包的名字「HP Laser 100 and HP Color Laser 150 Printer series Print Driver」推断，此过程应该能适用于所有的 HP Laser 100 及 HP Color Laser 150 系列的打印机。

## 打印机联网

首先使用 Windows 操作系统完成打印机的联网工作，在路由器的网页管理界面可以看到这台打印机的局域网 ip 是 192.168.123.20 ，记录备用。如果有条件的话，尽量将打印机的 MAC 地址与 IP 地址绑定，避免路由器将该 IP 分配给别的设备。

![路由器的网页管理界面](https://cdn.zhullyb.top/uploads/2024/08/12/6693aa41c079b.png)

## 安装 CUPS

随后按照 ArchWiki 的 [CUPS 页面](https://wiki.archlinux.org/title/CUPS)进行相关配置，CUPS 是苹果公司开源的打印系统，是目前 Linux 下最主流的打印方案。

首先安装 cups ，如果需要「打印为 pdf」的功能，可以选装 cups-pdf。

```bash
pacman -S cups
```

```bash
pacman -S cups-pdf
```

接着需要启动 cups 的服务，如果需要使用 cups 自带的 webui，可以直接启用 cups.service，这样就能在 http://localhost:631 看到对应的配置页面。

```bash
systemctl enable cups.service --now
```

而如果你正在使用一些集成度较高的 DE 如 KDE 或 GNOME，可以安装 DE 对应的打印机管理程序。在 Arch Linux 下，KDE 自带的打印机管理程序包名为 `print-manager`，此外还需要安装安装 `system-config-printer` 打印机功能支持软件包。这种方案则不需要启动 cups.service，只需要启动 cups.socket 即可。

```bash
pacman -S print-manager system-config-printer
systemctl enable cups.socket
```

## 杂项

在常规的流程中，通常会安装 `ghostscript` 来适应 Non-PDF 打印机，这台 HP Laser 103w 也不例外。

```bash
pacman -S ghostscript
```

如果是 PostScript 打印机可能还需要安装 `gsfonts` 包，但我这里不需要。

## 安装驱动

OpenPrinting 维护的 `foomatic` 为很大一部分打印机提供的驱动文件，Gutenprint 维护的 gutenprint 包也包含了佳能(Canon)、爱普生(Epson)、利盟(Lexmark)、索尼(Sony)、奥林巴斯(Olympus) 以及 PCL 打印机的驱动程序。如果你的打印机型号和我的不同，可以尝试安装这些组织维护的驱动。具体的安装方法同样可以在 ArchWiki 的 [CUPS 页面](https://wiki.archlinux.org/title/CUPS)找到。我上一台打印机 HP LaserJet 1020 所需的驱动是在 [AUR/foo2zjs-nightly](https://aur.archlinux.org/packages/foo2zjs-nightly) 中取得的。

但 HP Laser 103w 的驱动程序都不在这些软件包中，在 HP 的官网我们可以找到[这个页面](https://support.hp.com/cn-zh/drivers/hp-laser-100-printer-series/model/2100769190)，包含了 HP Laser 103w 的 Linux 驱动[下载地址](https://ftp.hp.com/pub/softlib/software13/printers/CLP150/uld-hp_V1.00.39.12_00.15.tar.gz)（已在 web.archive.org 存档）。通过下载下来的文件名，我们可以看见名字为 uld-hp，理论上可以直接通过压缩包内的安装脚本进行安装，但我通过这个名字顺藤摸瓜，找到了 [AUR/hpuld](https://aur.archlinux.org/packages/hpuld) 可以直接进行安装。

```bash
yay -S hpuld
```

## 添加打印机

打开设置中的打印机设置后，选择添加打印机，CUPS 直接帮我们找到了局域网下的打印机，并自动开始搜索驱动程序（虽然没搜到）。

![自动搜索](https://cdn.zhullyb.top/uploads/2024/08/12/6693b6e81f9c4.png)

但如果没能自动检测到打印机，也可以使用手动选项中的 AppSocket/HP JetDirect 手动输入打印机的 ip 地址进行配置。

紧接着就到了选择驱动程序的阶段，厂商选择 HP，能够找到「HP Laser 10x Series」的选项，直接选择。

![选择驱动](https://cdn.zhullyb.top/uploads/2024/08/12/6693b76b9c1ca.png)

接着就可以完成打印机的添加。

![完成添加](https://cdn.zhullyb.top/uploads/2024/08/12/6693b7ba82d99.png)

随后便能正常打印文件啦！
