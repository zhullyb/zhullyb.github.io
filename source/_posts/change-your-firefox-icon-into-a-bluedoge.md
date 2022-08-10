---
title: FireFox? IceDoge!!!
date: 2021-02-27
tags: 
      - Linux
      - Fun
---

事情的起因是这样的。

 Solidot

 **[Mozilla 强调 Firefox 的 logo 仍然包含小狐狸 ](https://www.solidot.org/story?sid=67051) 2021-02-27 20:02**

 #Firefox 过去几天一个广泛流传的 meme 宣称，Firefox 著名的红色小狐狸 logo 正被逐渐简化直至消失。Mozilla 官方博客[对此做出了回应](https://blog.mozilla.org/firefox/the-fox-is-still-in-the-firefox-logo/)，强调 Firefox 的 logo 将会始终包含小狐狸，他们没有消除狐狸的计划。作为反击这一 meme 行动的一部分，Mozilla 修改了[Firefox Nightly](https://www.mozilla.org/en-US/firefox/nightly/firstrun/) 的 logo，将著名的网络 meme 狗币中的柴犬图像与红色小狐狸 logo 整合在一起。如果你下载安装 Nightly 版本，你会看到狗狗在看着你。

这只狗是非常可爱，大概是长下图这个样子。

![非常可爱对吧](https://www.mozilla.org/media/img/logos/firefox/logo-nightdoge-lg-high-res.14f40a7985fe.png)

但是我是一个将Firefox当成主浏览器的用户，咱不可能去用Nightly，所以我就打算把我这里这只稳定版的红色小狐狸![这只我都看烦了的小狐狸](https://www.mozilla.org/media/protocol/img/logos/firefox/browser/logo-lg-high-res.fbc7ffbb50fd.png)

换成上面的那只狗。

通过直接写入用户目录下的icon可以在不覆盖浏览器原图标、不给包管理器惹麻烦的情况下实现我们的目标，所以，代码如下

```bash
#/usr/bin/sh

# This script will change icon of you Firefox Browser into a bluedoge
# Depend on imagemagick

cd ~
curl https://www.mozilla.org/media/img/logos/firefox/logo-nightdoge-lg-high-res.14f40a7985fe.png  logo-nightdoge-lg-high-res.14f40a7985fe.png

for _resolution in 16 22 24 32 48 64 128 192 256 384
do
    mkdir -p ~/.local/share/icons/hicolor/${_resolution}x${_resolution}/apps/
    convert -resize "${_resolution}x${_resolution}" "logo-nightdoge-lg-high-res.14f40a7985fe.png" "firefox${_resolution}.png"
    mv "firefox${_resolution}.png" ~/.local/share/icons/hicolor/${_resolution}x${_resolution}/apps/firefox.png
done

rm logo-nightdoge-lg-high-res.14f40a7985fe.png

# If you want to change back your icons, run the command bellow
# rm ~/.local/share/icons/hicolor/*/apps/firefox.png
```

