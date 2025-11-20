---
title: Cudy TR3000 daed Installation Guide
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

## Background

Not long ago, I spotted the Cudy TR3000 router I'd been eyeing for a while at a discount price of ¥153 on JD.com. While it wasn't quite the all-time low of ¥130 (or even ¥110 with bundled deals), it was within my acceptable range. So I immediately ordered this Cudy TR3000 mini router I'd been longing for, to help ease my pre-semester anxiety (a mental condition).

![](https://static.031130.xyz/uploads/2025/02/23/8b0a4d5812179.webp)

This router is powered by Type-C and features one 2.5Gbps WAN port and one 1Gbps LAN port. Additionally, it has a USB port that can be used for printer sharing, mounting external storage, Android phone USB network sharing, and various other purposes. What really attracted me was its compact size, making it perfect for business trips, travel, short-term rentals, and similar scenarios. Considering I might need to rent a place for an upcoming internship, I seized this opportunity to order it.

![Size comparison with a Xiaomi 8 phone](https://static.031130.xyz/uploads/2025/02/23/ef2b394e6fc0d.webp)

The official firmware is a customized version of OpenWRT with limited functionality, so I decided to flash the original OpenWRT system to increase its capabilities. On the Enshan wireless forum, I found that someone had already compiled [an OpenWRT system based on Linux kernel 6.6](https://www.right.com.cn/forum/forum.php?mod=viewthread&tid=8418091). This meets the kernel version requirement (>= 5.17) for dae's Bind to LAN feature, and the 512MB memory size just reaches the recommended minimum. So I definitely had to give dae a try. If successful, this would be my first hardware router running dae.

---

## Starting the Flashing Process

The router's official system management interface is at 192.168.10.1. On first access, you'll be asked to set a password, then just click through the initialization process to reach the main page. My unit has firmware version `2.3.2-20241226`. I'm not sure if later versions can still use this method.

![](https://static.031130.xyz/uploads/2025/02/28/1c066cb1dab3f.webp)

### Transition Firmware

First, we need to flash the so-called "transition firmware". The purpose of flashing transition firmware is that it can be recognized by the official system's upgrade program, allowing us to proceed with subsequent operations.

The transition firmware filename and MD5 hash:

```
b8333d8eebd067fcb43bec855ac22364  cudy_tr3000-v1-sysupgrade.bin
```

Then we can find the firmware upgrade section in the basic settings of the router's management page, and select the transition firmware to upload and update in the local update section.

![](https://static.031130.xyz/uploads/2025/02/28/3582e569954a6.webp)

### Flash Firmware to Unlock FIP Partition Write Permission

After flashing the transition firmware, wait about one minute for the router's DHCP to restart, and we can access the transition firmware's management page at 192.168.1.1.

![](https://static.031130.xyz/uploads/2025/02/28/6fe8107a87e87.webp)

There's no password on first login - you can enter anything to log in successfully. Considering we might need to restore factory settings later, it's recommended to back up the FIP partition at this step.

![](https://static.031130.xyz/uploads/2025/02/28/79caf5f643689.webp)

This time we need to flash the following LEDE firmware to unlock FIP partition write permission. The filename and MD5 are provided below:

```
4af5129368cbf0d556061f682b1614f2  openwrt-mediatek-filogic-cudy_tr3000-v1-squashfs-sysupgrade.bin
```

Select flash firmware below, upload the firmware we need to flash, and proceed.

![](https://static.031130.xyz/uploads/2025/02/28/79d300bb33d21.webp)

![](https://static.031130.xyz/uploads/2025/02/28/bc29dc9cad24a.webp)

### Flash U-Boot

After waiting about another minute for the computer to reconnect to the router, we can access this firmware with unlocked FIP partition write permission. The default password is `password`.

![](https://static.031130.xyz/uploads/2025/02/28/f98051faba608.webp)

Select File Transfer in the sidebar and upload the U-Boot to be flashed. The filename and MD5 are below. **Note: Extract the zip file first**

```
e5ff31bac07108b6ac6cd63189b4d113  dhcp-mt7981_cudy_tr3000-fip-fixed-parts-multi-layout.bin
```

![](https://static.031130.xyz/uploads/2025/02/28/547c5d324f0a0.webp)

Then access the TTYD terminal from the sidebar, enter the default username/password root / password, and execute the command to flash U-Boot:

```bash
mtd write /tmp/upload/dhcp-mt7981_cudy_tr3000-fip-fixed-parts-multi-layout.bin FIP
```

![](https://static.031130.xyz/uploads/2025/02/28/46b4fc5be8c82.webp)

### Flash Self-Compiled ImmortalWRT

After flashing U-Boot, power off the router. Ensure the ethernet cable connects the computer to the router's LAN port, then press and hold the reset button while plugging in the power. Hold until the white light blinks four times and turns red, then release the reset button to enter U-Boot.

I compiled a 112m layout, so I need to select the `mod-112m` MTD layout before uploading and flashing the firmware.

```
8c9a44f29c8c5a0617e61d49bf8ad45d  112m-immortalwrt-cudy_tr3000-ebpf_by_zhullyb_20250325-squashfs-sysupgrade.bin
```

![](https://static.031130.xyz/uploads/2025/02/28/41c250db91756.webp)

Wait again for the computer to reconnect to the router. This is the final system with daed support. Again, there's no default password - just enter anything to access. After connecting to the network, go to System - Software Packages page and update the package list.

![](https://static.031130.xyz/uploads/2025/02/28/e56084ff09a5d.webp)

Then you can install dae/daed related software. Choose `luci-i18n-dae-zh-cn` or `luci-i18n-daed-zh-cn` based on your needs. Other packages will be installed as dependencies. I installed daed here.

![](https://static.031130.xyz/uploads/2025/02/28/dc4fa4a688cf5.webp)

After installation, refresh the page and you'll see daed in the Services section of the top bar.

![](https://static.031130.xyz/uploads/2025/02/28/551f1f2eb9ab4.webp)

Daed runs normally and can fully utilize my home's 300Mbps downstream bandwidth (single-thread actual test: 250Mbps). CPU usage graph at peak speed is shown below.

![](https://static.031130.xyz/uploads/2025/02/28/651bed7ad4aba.webp)

![Multi-thread speed test](https://static.031130.xyz/uploads/2025/03/01/9fcee79afa63b.png)

![Single-thread speed test](https://static.031130.xyz/uploads/2025/03/01/6716d723a2b0d.png)

## Files Mentioned in This Article

https://www.123684.com/s/gfprVv-wEQ8d

https://www.123912.com/s/gfprVv-wEQ8d

## References

- [Cudy TR3000 Flashing Tutorial Guide](https://www.right.com.cn/forum/forum.php?mod=viewthread&tid=8410353)
- [Using ImmortalWrt+Dae to Configure Transparent Proxy for Windows](https://abxy.fun/post/immortalwrt-dae/)
- [Cudy TR3000 v1 Chinese Three-Partition DHCP U-Boot Second Edition](https://www.right.com.cn/forum/forum.php?mod=viewthread&tid=8415351)
- [Booting Mainline OpenWrt Firmware Using hanwckf/bl-mt798x](https://blog.imouto.in/#/posts/10)
- [QiuSimons/luci-app-daed](https://github.com/QiuSimons/luci-app-daed)
