---
title: Hello，这里是竹林里有冰的私人源。
excerpt: 似乎也有人喜欢叫它竹林源（
date: 2021-03-12
tags:
- Archlinux
---

> 其实Archlinux已经有了一个打包了各种常用软件的第三方源叫archlinuxcn，国内拥有多个镜像站为其提供镜像服务。但是他们作为一个开源社区，显然会受到许多限制，诸如不能收录未经授权的商业软件等。目前已经有多个软件因为没有得到授权而不得不下架，详见 [#1968](https://github.com/archlinuxcn/repo/issues/1968)、[#2455](https://github.com/archlinuxcn/repo/issues/2455)、[#2458](https://github.com/archlinuxcn/repo/issues/2458)、[#2460](https://github.com/archlinuxcn/repo/issues/2460)、[#2462](https://github.com/archlinuxcn/repo/issues/2462)。因此我创建了这样一个方便我自己使用的源。

主要收集了一些**侵权软件、闭源软件、不清真的软件**，目前主要是作为archlinuxcn源的补充。（当然我自己的内核```linux-zhullyb```也挂在上面）。

目前源在OneDrive上，采用[onemanager](https://github.com/qkqpttgf/OneManager-php)解析直链，速度取决于各位的网络供应商。

#### 使用方法：

在 ```/etc/pacman.conf``` 尾部添加

```
[zhullyb]
SigLevel = Never
Server = https://mirror.zhullyb.top
Server = https://arch.zhullyb.top
```

> 注，我这里将SigLevel指定为Never，是因为我认为我一个辣鸡的个人源没有必要验证keyring，况且由于OneDrive的直链解析会带来较高的延迟，再额外下载一个sig文件将会极大地破坏体验。

如果你坚持要验证，我这里也提供了`zhullyb-keyring`，请自行下载以后使用`pacman -U`进行安装。此外，由于`pacman`会通过拼接db跳转的链接来下载sig签名，会导致onedrive返回的报错信息被pacman误认为sig文件，这里可以使用由[web-worker.cn](https://web-worker.cn)站长提供的反代，使pacman尝试下载sig文件时接收到404状态码来跳过对db的验证。

```
Server = https://pkg.web-worker.cn/zhullyb/
```

#### **现有软件列表**

| 软件名                          | 版本号                 | PKGBUILD                                                     |
| :------------------------------ | :--------------------- | :----------------------------------------------------------- |
| alibaba-puhuiti                 | 2.0-1                  | see AUR                                                      |
| aliyunpan-liupan1890            | 2.9.24-1               | see AUR                                                      |
| aosp-devel                      | 0.7.1-1                | see AUR                                                      |
| apg                             | 2.2.3-5                | see AUR                                                      |
| archlinux-themes-sddm           | 2.0-1                  | see AUR                                                      |
| baidunetdisk-electron           | 3.5.0-1                | see AUR                                                      |
| balena-etcher                   | 1.6.0-2                | see AUR                                                      |
| cloudflare-wrangler             | 1.19.4-1               | see AUR                                                      |
| com.qq.tim.spark                | 3.3.5.22018spark0-1    | see AUR                                                      |
| com.qq.weixin.spark             | 3.2.1.127spark0-1      | see AUR                                                      |
| com.xiaokanba.bbs.spark         | 1.5.5spark3-1          | [Github](https://github.com/zhullyb/PKGBUILDs/tree/master/com.xiaokanba.bbs.spark) |
| davinci-resolve                 | 17.3.1                 | see AUR                                                      |
| deepin-libwine                  | 2.18_24-4              | [Github(Source Delected)](https://github.com/zhullyb/PKGBUILDs/tree/master/deepin-libwine) |
| deepin-udis86                   | 1.72_4-3               | see AUR                                                      |
| deepin-wine                     | 2.18_24-4              | [Github(Source Delected)](https://github.com/zhullyb/PKGBUILDs/tree/master/deepin-wine) |
| deepin-wine-helper              | 5.1.27-1               | see AUR                                                      |
| deepin-wine-plugin              | 5.1.13-1               | see AUR                                                      |
| deepin-wine-plugin-virtual      | 5.1.13-1               | see AUR                                                      |
| deepin-wine5                    | 5.0.16-1               | see AUR                                                      |
| deepin-wine5-i386               | 5.0.16-1               | see AUR                                                      |
| deepin.com.dingtalk.com         | 6.0.0.11902-1          | see AUR                                                      |
| deepin.com.qq.im.light          | 7.9.14308deepin8-4     | see AUR                                                      |
| deepin.com.qq.qqmusic           | 17.66-2                | see AUR                                                      |
| drawio-desktop                  | 15.4.0-1               | see AUR                                                      |
| fcitx-lilydjwg-git              | 4.2.9.7.20210211-1     | [Github](https://github.com/zhullyb/PKGBUILDs/tree/master/fcitx-lilydjwg-git) |
| fcitx-lilydjwg-git-debug        | 4.2.9.7.20210211-1     | [Github](https://github.com/zhullyb/PKGBUILDs/tree/master/fcitx-lilydjwg-git) |
| fcitx-sogoupinyin-old           | 2.3.1.0112-2           | [Github](https://github.com/zhullyb/PKGBUILDs/tree/master/fcitx-sogoupinyin) |
| flashplugin                     | 32.0.0.465-1           | see AUR                                                      |
| foo2zjs-nightly                 | 20201127-1             | see AUR                                                      |
| freechat-git                    | 1.0.0.3a8304e          | [Github](https://github.com/zhullyb/PKGBUILDs/tree/master/freechat-git) |
| google-chrome                   | 95.0.4638.54-1         | see AUR                                                      |
| hexo-cli                        | 4.3.0-6                | see AUR                                                      |
| hollywood                       | 1.21-5                 | see AUR                                                      |
| icalingua                       | 2.3.2-1                | see AUR                                                      |
| lineageos-devel                 | 0.1-1                  | see AUR                                                      |
| linux-zhullyb                   | 5.14.5-1               | see AUR                                                      |
| linux-zhullyb-headers           | 5.14.5-1               | see AUR                                                      |
| marktext                        | 0.16.3-2               | see AUR                                                      |
| mathematica                     | 12.3.1-2               | [Github](https://github.com/zhullyb/PKGBUILDs/tree/master/mathematica) |
| matlab                          | 9.9.0.1467703-1        | [Github](https://github.com/zhullyb/PKGBUILDs/tree/master/matlab) |
| motrix                          | 1.6.11-1               | see AUR(motrix-bin)                                          |
| netease-cloud-music             | 1.2.1-7                | [Github](https://github.com/zhullyb/PKGBUILDs/tree/master/netease-cloud-music) |
| onscripter                      | 20200722-6             | see AUR                                                      |
| optimus-manager-qt              | 1.6.3-1                | see AUR                                                      |
| pacman-mirrorlist-empty         | 1-1                    | [Github](https://github.com/zhullyb/PKGBUILDs/tree/master/pacman-mirrorlist-empty) |
| pacsync                         | 1-1                    | [Github](https://github.com/zhullyb/PKGBUILDs/tree/master/pacsync) |
| pepper-flash                    | 32.0.0.465-1           | see AUR                                                      |
| purewriter-desktop-bin          | 1.4.0-2                | see AUR                                                      |
| qqmusic-bin                     | 1.1.1-1                | see AUR                                                      |
| qtscrcpy                        | 1.7.1-1                | see AUR                                                      |
| repo-mokee                      | 2.16-3                 | see AUR                                                      |
| speedometer                     | 2.8-4                  | see AUR                                                      |
| spss-bin                        | 26.0.0-1               | [Github](https://github.com/zhullyb/PKGBUILDs/tree/master/spss-bin) |
| texlive-full                    | 20211004-1             | [Github](https://github.com/zhullyb/PKGBUILDs/tree/master/texlive0full) |
| ttf-ms-fonts                    | 2.0-12                 | see AUR                                                      |
| ttf-ms-win10                    | 2019ltsc-1             | see AUR                                                      |
| ttf-ms-win10-japanese           | 2019ltsc-1             | see AUR                                                      |
| ttf-ms-win10-korean             | 2019ltsc-1             | see AUR                                                      |
| ttf-ms-win10-other              | 2019ltsc-1             | see AUR                                                      |
| ttf-ms-win10-sea                | 2019ltsc-1             | see AUR                                                      |
| ttf-ms-win10-thai               | 2019ltsc-1             | see AUR                                                      |
| ttf-ms-win10-zh_cn              | 2019ltsc-1             | see AUR                                                      |
| ttf-ms-win10-zh_tw              | 2019ltsc-1             | see AUR                                                      |
| ttf-wps-fonts                   | 1.0-5                  | see AUR                                                      |
| visual-studio-code-bin          | 1.61.2-1               | see AUR                                                      |
| wechat-uos                      | 2.0.0+lsblk-1145141919 | see AUR                                                      |
| wemeet-bin                      | 2.8.0.1-1              | see AUR                                                      |
| wps-office                      | 11.1.0.10702-2         | see AUR                                                      |
| wps-office-cn                   | 11.1.0.10702-2         | see AUR                                                      |
| wps-office-mime                 | 11.1.0.10702-2         | see AUR                                                      |
| wps-office-mime-cn              | 11.1.0.10702-2         | see AUR                                                      |
| wps-office-mui-zh-cn            | 11.1.0.10702-2         | see AUR                                                      |
| virtualbox-host-modules-zhullyb | 6.1.26-1               | [Github](https://github.com/zhullyb/PKGBUILDs/tree/master/virtualbox-host-modules-zhullyb) |
| xml2                            | 0.5-1                  | see AUR                                                      |
| zhcon                           | 0.2.6-9                | see AUR                                                      |
