---
title: 使用AUR(Helper)安装软件时究竟发生了什么？对于常见的构建错误如何解决？
top: false
tags:
- Linux
- Archlinux
date: 2021-09-11 19:22:29
---

> 虽然对于没有能力手动修改/编写PKGBUILD的Arch用户其实是不应该使用AUR中的包的，这些软件的PKGBUILD可以由个人随意发布，并不能保证安全性，但是作为Archlinux的特色，但随着AUR Helper的趋于便利，还是吸引了不少小白使用AUR。本文将主要讲一讲 AUR Helper 帮助我们安装软件时到底做了些什么事情，并提供一些使用AUR Helper构建时常见错误的解决方案。

## PartⅠ基本原理

### `makepkg`是如何工作的？

以钉钉举例，我们可以从AUR上使用 `git clone https://aur.archlinux.org/dingtalk-bin.git` 获取到由这个包的维护者为我们提前写好的构建脚本。他的目录大概是长成下面这个样子:

```
dingtalk-bin
├── com.alibabainc.dingtalk.desktop
├── dingtalk.sh
├── .git
├── .gitignore
├── PKGBUILD
├── service-terms-zh
└── .SRCINFO
```

- 其中，`.git`是git的工作目录，可以忽视。
- `.gitignore`属于git的配置文件之一，我们也不用管。
- `PKGBUILD`是这个目录下最重要的东西，是一个用于提供参数的脚本。makepkg通过执行PKGBUILD脚本来获取到参数，自动进行下载和构建过程。
- `service-terms-zh`, `com.alibabainc.dingtalk.desktop`, `dingtalk.sh`是包里所需要用到的东西。

***

当我们cd到这个目录下执行makepkg时，

makepkg会调用`curl` / `git`下载PKGBUILD中`source=()`部分中以`http(s)`协议头或者`git+`开头的链接，这些东西将会被下载到这个目录的`src`文件夹下。

对于curl下载的东西，makepkg会使用校验码核对下载到的文件是否完整、是否是当初这个包的维护者下载到的这一个。

校验通过后，makepkg会依次执行`prepare(){}`、`build(){}`、`package(){}`函数中的命令陆续完成*准备、编译*过程，并将最终要打进包里的文件放置到`pkg`文件夹下。

最后，makepkg将会将`pkg`文件夹的内容压缩成包。

### AUR Helper 干了些什么

我们还是以钉钉为例，看看我们执行`yay dingtalk-bin`时到底发生了什么。

![当你使用yay安装软件到底发生了什么](https://cdn.zhullyb.top/uploads/2024/08/12/62f3cdb03ec8c.jpg)

## PartⅡ常见错误解决方案

如果有其他情况觉得可以完善的，欢迎在评论区留言。

### 1. base-devel 没有安装

正如上面所说的，没有安装`base-devel`组，赶紧补上! 

由于`base-devel`并不是一个具体的包，而是由多个包构成的包组，其实并没有很好的方法来检测你是否已经安装。

所以如果你不确定，你也可以执行下面的命令来确保自己已经安装。

```bash
sudo pacman -S base-devel --noconfirm --needed
```

***

常见表现: 

```
ERROR: Cannot find the strip binary required for object file stripping.
```

```
PKGBUILD: line XXX XXX: command not found
```

### 2. source源文件下载失败

1. #### 网络问题

   国内的网络问题不用多说了，大多数情况下都是Github连接不上。

   ![yay下载失败](https://cdn.zhullyb.top/uploads/2024/08/12/62f3cc9c9dda8.webp)

   最简单的解决方案就是把source里下载失败的东西通过特殊手段（比如你浏览器设置下代理，或者找找fastgit这种反代）下载下来以后直接扔到PKGBUILD所在的路径，然后手动执行`makepkg -si`。

   > -s代表自动下载makedepend，-i表示构建成功以后自动安装
   >
   > yay存放PKGBUILD的默认路径是在`$HOME/.cache/yay/$pkgname`下面，具体可以参考我的另一篇关于[yay的用法详解](https://blog.zhullyb.top/2021/04/04/yay-more/#builddir-lt-dir-gt)的博客。

   **我在这里再讲一种使用 [*fastgit*](http://fastgit.org/) 作为反代加速github下载的方法。**~~如果觉得fastgit帮助到了你，你可以考虑[给fastgit项目打钱](http://fastgit.org/donate.html)。~~

   当你的yay出现这个询问菜单时，（也就是出现`Diffs to show`/`显示哪些差异？`字样时）

   ![](https://cdn.zhullyb.top/uploads/2024/08/12/62f3cca0c7aba.webp)

   我们再开一个终端，输入

   ```bash
   sed -i "s|github.com|hub.fastgit.org|g" $HOME/.cache/yay/*/PKGBUILD
   ```

   接着就下一步安装即可。

2. #### 链接失效

   这种情况多见于维护者维护不到位，上游放出了新版本包并删除老版本包以后维护者没有及时跟进的。你可以去逛一逛AUR的评论区查看解决方案，或者去查找上游的最新版本是多少，尝试更改PKGBUILD中的pkgver参数和checksum以后尝试makepkg。

3. #### 需要手动下载

   一般情况下是上游没有提供直链，makepkg无法自行下载，需要人工介入。解决方法同上面的[网络问题](#网络问题)

### 3. checksum 错误

上文已经提到过，checksum用于判断你所下载到的软件和维护者当初下载到的是否一致。但是有些情况下，确实是维护者忘了更新checksum值了，因此我们需要做一个判断。

打开`.SCRINFO`，找到checksum报错的那个文件的链接。

使用wget/curl等工具将他下载下来，可以通过`md5sum+文件名`的方式获取他们的md5值。连续下载两次，核对两次的检验值是否一致。

如果结果一致，那么说明并不是网络波动导致的检验值不符，而是维护者没有及时跟进导致的，你可以使用`yay -S $pkgname --skipchecksums`的方式跳过验证校验值的过程，或者你可以修改PKGBUILD中的校验值为`"SKIP"`来跳过某一文件的校验后手动`makepkg`。

### 4. tuna反代受限

tuna的服务器只有一个ip，但当使用他提供的AUR的反代服务时，全国的使用者都会被AUR认为是tuna这一个ip，过大的请求数量可能导致tuna的服务器超出AUR每天给每个ip限制的请求次数。

***

具体表现: 

```
Rate limit reached
```

解决方案，改回AUR的服务器，使用自己的ip进行请求

```bash
yay --aururl "https://aur.archlinux.org" --save
```



## 写在最后

关于AUR使用的更多细节可以阅读 [《yay进阶》](https://blog.zhullyb.top/2021/04/04/yay-more/)
