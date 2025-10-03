---
title: 为红米 Redmi AC2100 路由器刷入 Padavan
date: 2023-06-24 00:22:53
sticky:
tags:
- Router
- Network
---

> 大一一年转眼就要过去了，最近要搬校区了，顺手就把之前刷过的「小米路由器4A千兆版」出手给了同学，自己反手入了一个 「Redmi AC 2100」，尽管是跟着教程走，但过程中依然是遇见了不少坑，因此就开一篇博客记录了一下。

## 重置路由器

这一步其实可有可无，只是我从闲鱼上入手这个路由器，买家并没有告知我密码，于是我只能手动 RESET 这个路由器来进入后台。

## 通过网络设置引导

原本就是连上路由器后简单地通过引导界面，但由于我没有一个正常的网络环境，所以这一步走的其实也是有点困难的，我还是稍微记一下。

首先浏览器地址栏输入 192.168.31.1 (小米家的路由器默认好像都是这个 ip 地址)，看到下图界面，加不加入用户改善计划其实都是无所谓的，反正马上就要刷掉这个系统了。

![路由器设置引导界面](https://r2-reverse.5435486.xyz/uploads/2024/08/12/6495c9a227d2c.webp)

此处选择「不插网线，继续配置」，因为我们没有标准的网络环境，还指望着这台路由器跑 l2tp 帮我们连校园网呢。

![路由器设置引导界面](https://r2-reverse.5435486.xyz/uploads/2024/08/12/6495ca724bf14.webp)

这里需要选择「自动获取IP」（静态 IP）好像也行，但别的选项在我的网络环境下恐怕都是没法继续配置下去的。

![路由器设置引导界面](https://r2-reverse.5435486.xyz/uploads/2024/08/12/6495cae48566d.webp)

随后随手输个 WIFI 名称和密码，主要是记住密码进路由器后台管理。

![路由器设置引导界面](https://r2-reverse.5435486.xyz/uploads/2024/08/12/6495cb8eba4b5.webp)

设置完上述设置项以后，再次进入 192.168.31.1 ，就能看见路由器后台管理的登陆页面了。

![路由器后台管理首页](https://r2-reverse.5435486.xyz/uploads/2024/08/12/6495cc2ff1e02.webp)

## 获取 ssh 权限

输入登陆密码，进入路由器后台管理页面，我们需要通过 bug 去获取打开官方系统的 ssh 功能

> 这里提一嘴，当初我刷小米路由器4A千兆版的时候用的是[这个仓库](https://github.com/acecilia/OpenWRTInvasion/)来打开 ssh。

首先是确认路由器的版本，我从闲鱼上购得的路由器自带的版本是官方稳定版 2.0.23，一开始跟着别人的思路就降级到了 2.0.7，但后来遇见问题在网上查解决方案的时候看到有人说这个漏洞在 2.0.23 依然可用，但我也没有去试。

在电脑上下载 2.0.7 的[升级包](https://cdn.cnbj1.fds.api.mi-img.com/xiaoqiang/rom/rm2100/miwifi_rm2100_firmware_d6234_2.0.7.bin)，在路由器设置界面的常用设置->系统状态->手动升级 选择自己下载的升级包，确认等待重启即可。有些教程说可以选择保留数据，但我也懒得试，就直接清除了所有数据，又不得不再次过一遍上面的配置引导。

在地址栏，删除 `/web/home#router` 部分，加入下面这串代码

```text
/api/misystem/set_config_iotdev?bssid=Xiaomi&user_id=longdike&ssid=-h%3B%20nvram%20set%20ssh_en%3D1%3B%20nvram%20commit%3B%20sed%20-i%20's%2Fchannel%3D.*%2Fchannel%3D%5C%22debug%5C%22%2Fg'%20%2Fetc%2Finit.d%2Fdropbear%3B%20%2Fetc%2Finit.d%2Fdropbear%20start%3B
```

再次删除后面的代码，加入下面这串代码

```text
/api/misystem/set_config_iotdev?bssid=Xiaomi&user_id=longdike&ssid=-h%3B%20echo%20-e%20'admin%5Cnadmin'%20%7C%20passwd%20root%3B
```

![需要被去除的 url 部分](https://r2-reverse.5435486.xyz/uploads/2024/08/12/6495ce20b91d1.webp)

![被截剩的 url 部分](https://r2-reverse.5435486.xyz/uploads/2024/08/12/6495ce1de2acd.webp)

两次请求的正常反馈应该长成下面这个样子。

![正常反馈](https://r2-reverse.5435486.xyz/uploads/2024/08/12/6495ce8d86b03.webp)

此时应该就可以使用 ssh 访问路由器的 root 账户了，密码已经被改为了 admin

```ba
ssh -o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedKeyTypes=+ssh-rsa root@192.168.31.1
```

![登陆成功](https://r2-reverse.5435486.xyz/uploads/2024/08/12/6495cf0b224c4.webp)

## 刷入 breed

如果用我在安卓刷机的经验来讲 breed 是什么的话，我会把他类比成第三方 Recovery (TWRP)。这是一个能够帮助你去输入系统、备份系统的恢复模式。虽然我们可以直接刷入 padavan，但如果系统没有自带镜像刷写工具或者输入的系统打不开了，那可能就是一台路由器的报废，或许得靠编程器才能救回来。

首先，我们到 breed 下载站上下载 breed 的镜像: https://breed.hackpascal.net/

![需要下载的 breed 镜像](https://r2-reverse.5435486.xyz/uploads/2024/08/12/6495cf9ca81de.webp)

随后，在电脑上这个存放了 breed 镜像的路径上开一个 http server，我这里选择的是 `darkhttpd`，Windows 或者 MacOS 用户可以选择使用 `miniserve`，他们呢起的是一样的效果，甚至可以使用 python 直接开一个 local server。

![本地 http 服务](https://r2-reverse.5435486.xyz/uploads/2024/08/12/6495d0bd79f4c.webp)

接下来，通过自己电脑在路由器局域网内的那个 ip 地址并添加端口号在浏览器上访问你开的 http server，直接右键复制 breed 镜像的下载链接。

![查看本机 ip](https://r2-reverse.5435486.xyz/uploads/2024/08/12/6495d0bd79f4d.webp)

![复制下载链接](https://r2-reverse.5435486.xyz/uploads/2024/08/12/6495d10b09fe0.webp)

将 ssh 连接到的路由器终端 cd 到 /tmp 路径下，使用 wget 命令去下载你刚刚复制到的 url，这样我们就简单地将 breed 镜像传输到了路由器的内存上。再使用 `mtd -r write breed-mt7621-xiaomi-r3g.bin Bootloader` 刷入 breed，刷入成功后 ssh 将会自动断开连接，但并不会直接进入 breed。

![Screenshot_20230623_203903.png](https://r2-reverse.5435486.xyz/uploads/2024/08/12/6495d17602f3a.webp)

我们需要先断开路由器的电源，使用一根针（比如取卡针）怼在 RESET 按钮上面，再次接通路由器的电源并持续按压 RESET 按钮几秒钟，浏览器这时就会进入 breed 状态，浏览器访问 192.168.1.1 就可以看到他的控制面板。

![Breed Web 界面](https://r2-reverse.5435486.xyz/uploads/2024/08/12/6495d2129a764.webp)

## 刷入 Padavan

在 Breed 中拥有很多的功能，不过我们用到的只是「固件更新」这一个功能，备份功能什么的可以自己尝试，这只是一个可选项。

首先去下载站下载适配 Redmi AC2100 的 Padavan 镜像: https://opt.cn2qq.com/padavan/

![适配 Redmi AC2100 的 Padavan 镜像](https://r2-reverse.5435486.xyz/uploads/2024/08/12/6495d5cbbb5b9.webp)

然后在 Breed 的 web 端控制台直接选择 Padavan 的系统镜像进行固件更新

![固件更新界面](https://r2-reverse.5435486.xyz/uploads/2024/08/12/6495d63261ad4.webp)

确认后直接刷入

![固件刷入中](https://r2-reverse.5435486.xyz/uploads/2024/08/12/6495d64fd1e0e.webp)

自动重启后，Padavan 就刷入完成了。

Padavan 的默认 WIFI 名是 PDCN 和 PDCN_5G，WIFI 密码是 1234567890

![Padavan 的默认 WIFI](https://r2-reverse.5435486.xyz/uploads/2024/08/12/6495d6c11aa01.webp)

浏览器输入 192.168.123.1 就可以进入默认的后台管理页面，管理页面的用户名和密码都是 admin

![Padavan 设置界面](https://r2-reverse.5435486.xyz/uploads/2024/08/12/6496ac4f3170f.webp)

> 参考文章: 
>
> [《小米/红米AC2100刷OpenWrt/Padavan/第三方固件的详细教程（2022年8月23日更新）》](https://www.bilibili.com/read/cv18237601/)
>
> [《小米、红米 AC2100 一键开启 SSH，可自定义安装各种插件》](https://zhuanlan.zhihu.com/p/260531160)
>
> [《解决SSH no matching host key type found 问题》](https://blog.alanwei.com/blog/2022/01/24/ssh-no-matching-host-key-type-found/)
