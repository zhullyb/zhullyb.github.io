---
title: deepin-elf-verify究竟是何物？
date: 2021-11-20
sticky:
execrpt:
tags:
- deepin
- Linux
---

## 起因

越来越多上架在 Deepin 应用商店中的 deb 包中开始依赖了一个叫做 `deepin-elf-verify` 的依赖，今天来讲讲这个~~神奇~~的 `deepin-elf-verify` 到底为何物，为什么这么多程序都要依赖于他来工作。

## 下载拆包

打开 [Bfsu镜像站](https://mirrors.bfsu.edu.cn/) ，可以很轻松地找到 [Packages](https://mirrors.bfsu.edu.cn/deepin/dists/apricot/main/binary-amd64/Packages) —— 在 apt 源中记录了各个文件信息（包括他在仓库中的相对位置）的这么一个*神奇*的文件，就是体积有点大，达到了68MB的样子。我们可以通过以下命令检索今天的主角——`deepin-elf-verify`。

```bash
curl -s https://mirrors.bfsu.edu.cn/deepin/dists/apricot/main/binary-amd64/Packages | grep deepin-elf-sign | grep pool
```

得到了输出: 

> Filename: pool/main/d/deepin-elf-verify/deepin-elf-verify_0.2.0.6-1_amd64.deb

我们就可以把完整的下载链接拼出来: [https://mirrors.bfsu.edu.cn/deepin/pool/main/d/deepin-elf-verify/deepin-elf-verify_0.2.0.6-1_amd64.deb](https://mirrors.bfsu.edu.cn/deepin/pool/main/d/deepin-elf-verify/deepin-elf-verify_0.2.0.6-1_amd64.deb)

下载解压，大概是这么一个目录结构: 

```
deepin-elf-verify_0.2.0.6-1_amd64
├── control.tar.xz
├── data.tar.xz
└── debian-binary
```

是个常规的deb包该有的结构了。

- control.tar.xz 中存放了deb包的相关信息
- data.tar.xz 是整个包最终会被安装到系统中的文件

终于到了激动人心的时刻了，打开 data.tar.xz ！

![空的？](https://npm.elemecdn.com/superbadguy-bed@0.0.4/9.png)

**搞错了，再来**

打开UOS的[源链接](https://uos.deepin.cn/uos/)，使用`curl`+`grep`检索`deepin-elf-verify`在源中的相对位置

```bash
curl -sL https://uos.deepin.cn/uos/dists/eagle/main/binary-amd64/Packages | grep deepin-elf-verify | grep pool
```

获得输出: 

> Filename: pool/main/d/deepin-elf-verify/deepin-elf-verify_0.0.14.5-1_amd64.deb 
> Filename: pool/main/d/deepin-elf-verify/deepin-elf-verify-dbgsym_0.0.14.5-1_amd64.deb

拼接为链接: [https://uos.deepin.cn/uos/pool/main/d/deepin-elf-verify/deepin-elf-verify_0.0.14.5-1_amd64.deb](https://uos.deepin.cn/uos/pool/main/d/deepin-elf-verify/deepin-elf-verify_0.0.14.5-1_amd64.deb)

下载后打开 `data.tar.xz`

<img src="https://npm.elemecdn.com/superbadguy-bed@0.0.4/10.png" alt="看来还是有东西的"  />

## 说说结论吧

### 对于UOS

在UOS下，`deepin-elf-verify`用于检测用户运行的进程是否被deepin信任的证书签名过，虽然有些过于限制用户，对于一个将要广泛用于政府机关的发行版而言是可以理解的。

### 对于deepin

- `deepin-elf-verify` 在 deepin 上就是个空包。

- 当我们使用 deepin 安装一个含有 `deepin-elf-verify` 的软件包时，apt 会自动从源内搜索并安装 `deepin-elf-verify`，由于是个空包，他对于系统不会有任何负担。

- 大多数依赖`deepin-elf-verify`的程序都把依赖写成了`deepin-elf-verify (>= 0.0.16.7-1)`，而在deepin源中，`deepin-elf-verify`版本号是 0.2.0.6，因此在未来的很长一段时间里应该都是满足要求的，说明统信那边并没有「想要让deepin装不上UOS的包」的这种想法，可见在这一点上，统信还没有明显的偏心。

### 在别的Deb发行版下

`deepin-elf-verify`存在于、并且仅仅存在于 deepin 和 UOS 的源内。

而当我们使用别的 deb 发行版（如Debian、Ubuntu）时，apt 无法在他们自己的源内找到 `deepin-elf-verify` ，apt就会报错并且停止安装。

**小结: 至于其最终目的，是为了\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_**
