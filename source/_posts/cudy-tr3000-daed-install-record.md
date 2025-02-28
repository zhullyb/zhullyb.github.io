---
title: Cudy TR3000 吃鹅(daed)记
date: 2025-02-28 21:18:34
sticky:
index_img: https://static.031130.xyz/uploads/2025/02/28/cbf464c37ea4f.webp
tags:
- OpenSource Project
- Hardware
- Network
- Router
- OpenWRT
- ImmortalWRT
---

## 缘起

前不久在京东自营看到我馋了很久的 Cudy TR3000 有 ￥153 的折扣价，虽然比起 ￥130 的史低价（甚至 ￥110 的凑单史低价）还有些距离，但已经到我的可接受范围内了，于是果断下单剁手了这台我心心念念的 Cudy TR3000 迷你路由器，以此来缓解我的<span class="heimu">开学前综合症</span>（一种精神性疾病）

![](https://static.031130.xyz/uploads/2025/02/23/8b0a4d5812179.webp)

这台路由器使用 Type-C 供电，拥有一个 2.5Gbps 的 WAN 口和一个 1Gbps 的 LAN 口，在此基础上还有一个 USB 口可用于打印机共享、挂载外接存储、安卓手机 USB 共享网络等多种用途。更让我心动的地方在于其小巧的体型，非常适合出差、旅行、短期租房等场景。考虑到接下来一段实习可能会有租房需求，于是便趁此机会果断下单了。

![与一台小米8的宽高对比](https://static.031130.xyz/uploads/2025/02/23/ef2b394e6fc0d.webp)

官方系统是基于 openwrt 定制的，功能比较单一，因此考虑刷入 openwrt 原版系统增加可玩性。在恩山无限论坛上发现已经有人编译了[基于 Linux 6.6 版本的 OpenWRT 系统](https://www.right.com.cn/forum/forum.php?mod=viewthread&tid=8418091)，这已经满足了 dae 的 Bind to LAN 功能的内核版本要求（ >= 5.17 ），且 512MB 的内存大小刚好达到了推荐的最小内存大小，于是这 dae 肯定是要试着吃一吃的。如果成功了，这就是我手上第一台吃上大鹅的硬路由。

***

## 开始刷机

路由器官方系统的后台管理地址是 192.168.10.1，初次进入会要求你设置密码，然后就是一路随便点，完成初始化，随后就进入到主页。我手上这台的 FW 版本号是 `2.3.2-20241226`，不清楚后续的版本能不能仍然使用这套方案。

![](https://static.031130.xyz/uploads/2025/02/28/1c066cb1dab3f.webp)

### 过渡固件

首先我们需要先刷入所谓的「过渡固件」。刷入过渡固件的意义在于，这个过渡固件能被官方系统的升级程序所承认，这样就允许我们进行后续的操作。

过渡固件的文件名和 md5 值如下: 

```
b8333d8eebd067fcb43bec855ac22364  cudy_tr3000-v1-sysupgrade.bin
```

随后我们可以在路由器的管理页面的基本设置中找到固件升级的地方，在本地更新一栏中选择过渡固件上传更新即可。

![](https://static.031130.xyz/uploads/2025/02/28/3582e569954a6.webp)

### 刷入解锁 FIP 分区写入权限的固件

刷入过渡固件后稍等大约一分钟，路由器的 DHCP 重新工作，我们就可以通过 192.168.1.1 进入过渡固件的管理页面。

![](https://static.031130.xyz/uploads/2025/02/28/6fe8107a87e87.webp)

初次登陆时没有密码，随便输就能登陆成功。考虑到后续可能会有恢复出厂的需求，建议在这一步对 FIP 分区进行备份。

![](https://static.031130.xyz/uploads/2025/02/28/79caf5f643689.webp)

这次我们需要刷入下面这个 LEDE 固件来解锁 FIP 分区的写入权限，文件名和 md5 仍然放在下面

```
4af5129368cbf0d556061f682b1614f2  openwrt-mediatek-filogic-cudy_tr3000-v1-squashfs-sysupgrade.bin
```

在下方选择刷入固件，上传我们本次需要刷入的固件，刷入。

![](https://static.031130.xyz/uploads/2025/02/28/79d300bb33d21.webp)

![](https://static.031130.xyz/uploads/2025/02/28/bc29dc9cad24a.webp)

### 刷入 uboot

再等待一分钟左右，电脑重新连接上路由器后，我们可以进入到这个解锁了 FIP 分区写入权限的固件，默认密码是 `password`

![](https://static.031130.xyz/uploads/2025/02/28/f98051faba608.webp)

在侧栏选择文件传输，将本次要刷入的 uboot 上传，文件名和 md5 还是放在下面。**注意 zip 包要解压**

```
e5ff31bac07108b6ac6cd63189b4d113  dhcp-mt7981_cudy_tr3000-fip-fixed-parts-multi-layout.bin
```

![](https://static.031130.xyz/uploads/2025/02/28/547c5d324f0a0.webp)

随后侧栏进入 TTYD 终端，输入默认的用户名密码 root / password，执行命令刷入 uboot

```bash
mtd write /tmp/upload/dhcp-mt7981_cudy_tr3000-fip-fixed-parts-multi-layout.bin FIP
```

![](https://static.031130.xyz/uploads/2025/02/28/46b4fc5be8c82.webp)

### 刷入自编译的 immortalwrt

刷入 uboot 以后，给路由器断电，确保网线分别连接电脑和路由器 LAN 口后，按住 reset 键再插入电源键，直至白灯闪烁四次后转为红灯后松开 reset 键，即可进入 uboot。

我编译的是 112m 的布局，因此需要选择 `mod-112m` 这个 mtd 布局后上传固件刷入。

```
791a8d4cf5d6b7f17591a89e14e246bb  112m-immortalwrt-cudy_tr3000-ebpf_by_zhullyb_20250228-squashfs-sysupgrade.bin
```

![](https://static.031130.xyz/uploads/2025/02/28/41c250db91756.webp)

再次等待电脑重新连接路由器，这是最终吃上 daed 的系统了，依然是没有默认密码，随便输入即可进入。在连接上网络后，在系统 - 软件包页面，更新软件包列表。

![](https://static.031130.xyz/uploads/2025/02/28/e56084ff09a5d.webp)

随后就可以安装 dae / daed 相关软件了，可视需求选择 `luci-i18n-dae-zh-cn` 或者 `luci-i18n-daed-zh-cn`，其他包会作为依赖一同被安装。我这里安装的是 daed。

![](https://static.031130.xyz/uploads/2025/02/28/dc4fa4a688cf5.webp)

安装后刷新界面，我们就可以在顶栏的服务板块看到 daed。

![](https://static.031130.xyz/uploads/2025/02/28/551f1f2eb9ab4.webp)

daed 正常运行，能正常跑满我家的 300Mbps 宽带下行，速度峰值时 CPU 占用图如下。

![](https://static.031130.xyz/uploads/2025/02/28/651bed7ad4aba.webp)

<img src="https://static.031130.xyz/uploads/2025/02/28/8cddfb60b0981.webp" style="zoom:50%;" />

## 文章中提到的文件

https://www.123684.com/s/gfprVv-wEQ8d

https://www.123912.com/s/gfprVv-wEQ8d

## 参见

- [Cudy TR3000 刷机教程指北](https://www.right.com.cn/forum/forum.php?mod=viewthread&tid=8410353)
- [使用 ImmortalWrt+Dae 为 Windows 配置透明代理](https://abxy.fun/post/immortalwrt-dae/)
- [cudy tr3000 v1中文三分区DHCP uboot第二版](https://www.right.com.cn/forum/forum.php?mod=viewthread&tid=8415351)
