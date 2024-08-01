---
title: 在 Linux 下使用 mitmproxy 抓取安卓手机上的 HTTPS 流量
date: 2024-07-31 16:02:28
sticky:
execrpt:
tags:
- mitmproxy
- Network
- Linux
- Archlinux
- Android
---

纵使安卓下有小黄鸟 HttpCanary 这种抓包神器，但手机一块 6 英寸的小屏实在是不方便分析流量情况，还得是 PC 的屏幕更大一些，处理起流量信息来更得心应手一些。

把话说在前面，目前的安卓抓包有不小的限制

- Android 7 以下的版本: 直接以普通用户的权限安装 ssl 证书即可被信任
- Android 7 以上的版本:
  - 安全性较低的应用: **需要使用 root 权限**将证书移动至 `/system/etc/security/cacerts`使证书被系统信任
  - 安全性较高的应用（比如微信 7.0 以上的版本）: 在满足上一条条件的情况下，需要阻止第三方应用使用自带的 ssl 证书信任范围（绕过 SSL Pinning）。通常情况下需要额外的手段对目标应用进行篡改，比如使用 [justTrustMe](https://github.com/Fuzion24/JustTrustMe) 这个 xposed 模块，或者 [frida](https://github.com/frida/frida/)。

> 除此之外，Linux 版本 >= 5.5 的安卓设备也可以使用 [eCapture](https://github.com/gojue/ecapture) 这款基于 eBPF Linux  内核模块实现的抓包软件，算是种奇技淫巧。

本文只讨论 Android 7 以上版本中安全性较低的应用，因为我当前的抓包目标局限于一款安全性不高的外包软件。

## 基本操作

见「[在 Linux 下使用 mitmproxy 抓取 HTTPS 流量](/2024/02/29/capture-https-traffic-on-linux-with-mitmproxy/)」

## 安装 ssl 证书

```bash
cp $HOME/.mitmproxy/mitmproxy-ca-cert.pem $(openssl x509 -subject_hash_old -in $HOME/.mitmproxy/mitmproxy-ca-cert.pem | head -n 1).0
```

此时我们就可以在家目录下找到一个以 .0 结尾的证书文件，我们的目标是将其放到手机的 `/system/etc/security/cacerts` 路径下。

对于一些出厂安卓版本较低、system 分区采用可变文件系统的手机，我们可以很轻松的使用带有 root 权限的文件管理器将证书文件移动到对应的目录（我这里就是）；而对于出厂版本较高的手机，system 分区可能是不可写的，需要采用额外的奇技淫巧。

> 1、通过 ADB 将 HTTP Toolkit CA 证书推送到设备上。
>
> 2、从 /system/etc/security/cacerts/ 中复制所有系统证书到临时目录。
>
> 3、在 /system/etc/security/cacerts/ 上面挂载一个 tmpfs 内存文件系统。这实际上将一个可写的全新空文件系统放在了 /system 的一小部分上面。 将复制的系统证书移回到该挂载点。
>
> 4、将 HTTP Toolkit CA 证书也移动到该挂载点。
>
> 5、更新临时挂载点中所有文件的权限为 644，并将系统文件的 SELinux 标签设置为 system_file，以使其看起来像是合法的 Android 系统文件。
>
> ——[《安卓高版本安装系统证书 HTTPS 抓包 - 终极解决方案》](http://91fans.com.cn/post/certificate/) 「[archived here](http://web.archive.org/web/20240801045307/http://91fans.com.cn/post/certificate/#gsc.tab=0)」

## 让被抓包的应用流量经过 mitm 代理服务器

mitmproxy 默认会在 pc 端的 8080 端口开启一个 http 代理服务器，我们要做的就是想办法让待抓包的应用流量被这个 http 代理服务器所代理。

```bash
[zhullyb@Archlinux ~]$ ip -br a
lo               UNKNOWN        127.0.0.1/8 ::1/128 
enp0s31f6        UP             172.16.0.255/25 fe80::2df9:2927:cd44:65c/64 
wlp0s20f3        UP             192.168.20.212/24 fe80::a6bc:919:281e:dcab/64 
docker0          DOWN           172.17.0.1/16 fe80::42:d1ff:febe:d513/64
```

在这里我们能看到本机的无线网卡地址是 192.168.20.212，所以 http 代理服务器的地址就是 http://192.168.20.212:8080。（如果你的有线网卡和手机在同一局域网下，当然也可以用有线网卡的 ip 地址）

我们当然可以在安卓手机的 WIFI 连接页面填入 http 代理地址。

![](https://bu.dusays.com/2024/08/01/66ab548080ed6.jpg)

但这对我来说似乎并不是一个好主意：一来并不是所有的应用都会默认使用 http 代理服务器，二来这回导致抓包目标不明确，非目标应用的流量也会经过代理服务器。

我选择了 Nekobox 这个常见的代理软件，它支持 http 代理服务器，且允许分应用代理。

![](https://bu.dusays.com/2024/08/01/66ab54f08dfd6.webp)

可以看到能正常抓取 https 流量

![](https://bu.dusays.com/2024/08/01/66ab5970a6ac7.webp)

## 参见

- [安卓应用防抓包机制及一些绕过](https://ibukifalling.github.io/2023/06/07/Android-app-packet-capture/)
- [安卓7.0+系统抓包方案](https://chorer.github.io/2022/05/19/A-%E5%AE%89%E5%8D%937.0%E7%B3%BB%E7%BB%9F%E6%8A%93%E5%8C%85%E6%96%B9%E6%A1%88/)
- [frida抓包](https://www.cnblogs.com/snad/p/17449454.html)
- [gojue/ecapture](https://github.com/gojue/ecapture)
- [安卓高版本安装系统证书 HTTPS 抓包 - 终极解决方案](http://91fans.com.cn/post/certificate/#gsc.tab=0)
