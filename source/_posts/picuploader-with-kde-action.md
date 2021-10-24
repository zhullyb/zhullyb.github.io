---
title: PicUploader使用系列（二）——为KDE的dolphin添加右键快捷菜单
date: 2021-10-24 22:26:50
tags:
- Archlinux
- PicUploader
---

[上一篇文章](/2021/10/21/picuploader-on-archlinux-with-caddy/)我们在Archlinux中成功部署了PicUploader的web端，本文我们来讲讲如何为KDE的dolphin添加右键快捷键上传，效果类似这样。（gif图来自[PicUploader作者的博客](https://www.xiebruce.top/17.html))

<center><img src="https://img.xiebruce.top/2018/09/11/f4859eda8832f814486fc00df971e3cc.gif" width = "" height = ""></center>

## 创建.desktop文件

```bash
mkdir -p $HOME/.local/share/kservices5/
touch $HOME/.local/share/kservices5/picuploader.desktop
```

## 填上这段内容

```
[Desktop Entry]
Actions=PicUploader;
MimeType=image/jpeg;image/png;
Type=Service
X-KDE-Priority=TopLevel
X-KDE-ServiceTypes=KonqPopupMenu/Plugin
Icon=/var/www/image/favicon.ico

[Desktop Action PicUploader]
Name=Upload with PicUploader
Name[zh_CN]=使用PicUploader上传
Icon=/var/www/image/favicon.ico
Exec=php /var/www/image/index.php %F | xclip -selection clipboard
```

MimeType指的是文件类型。在这份desktop中，我仅指定了png和jpg文件在右键时会弹出picuploader的上传菜单，如果你需要更多文件类型的MimeType，你可以参考下gwenview的desktop都写了哪些文件类型。

> MimeType=inode/directory;image/avif;image/gif;image/jpeg;image/png;image/bmp;image/x-eps;image/x-icns;image/x-ico;image/x-portable-bitmap;image/x-portable-graymap;image/x-portable-pixmap;image/x-xbitmap;image/x-xpixmap;image/tiff;image/x-psd;image/x-webp;image/webp;image/x-tga;application/x-krita;image/x-kde-raw;image/x-canon-cr2;image/x-canon-crw;image/x-kodak-dcr;image/x-adobe-dng;image/x-kodak-k25;image/x-kodak-kdc;image/x-minolta-mrw;image/x-nikon-nef;image/x-olympus-orf;image/x-pentax-pef;image/x-fuji-raf;image/x-panasonic-rw;image/x-sony-sr2;image/x-sony-srf;image/x-sigma-x3f;image/x-sony-arw;image/x-panasonic-rw2;

## 安装所需组件

复制到粘贴板的功能依赖于`xclip`

```bash
sudo pacman -S xclip --needed
```

右下角弹出文字提示的功能依赖于`libnotify`

```bash
sudo pacman -S libnotify --needed
```

## 启用该动作菜单

```bash
kbuildsycoca5
```

## 处理普通用户无权写入logs的问题

```bash
sudo chmod 777 -R /var/www/image/logs/
```

## 最终结果

<center><img src="https://res.cloudinary.com/zhullyb/image/upload/v1/2021/10/24/08fb431459a372138382be4deee5f8bc.gif" width = "" height = ""></center>

## 参考链接

[如何给KDE（Dolphin）的右键菜单添加自定义菜单项？](https://www.peterzhang.top/posts/80.html)

[PicUploader: 一个还不错的图床工具](https://www.xiebruce.top/17.html)
