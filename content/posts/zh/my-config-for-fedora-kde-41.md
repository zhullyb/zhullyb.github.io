---
title: 给家里云装上 Fedora 41 KDE 后，我是如何配置的
date: 2024-11-01 23:35:08
sticky:
tags:
- Linux
- Fedora
- KDE
- HomeServer
- Rustdesk
- Notes
---

> 前两天给自己的 N100 小主机重装成了最近发布的 Fedora 41 ( KDE )，也是花了不少时间把整个系统调成自己熟悉的样子，因此开一篇博客记录一下。以下仅为我个人的 HomeServer 小主机使用，不具有普适性。

## 换官方源

我这里比较适合用上交的源，直接参考[他们的文档](https://mirrors.sjtug.sjtu.edu.cn/docs/fedora/linux)。

```bash
sudo sed -e 's/^metalink=/#metalink=/g' -e 's|^#baseurl=http://download.example/pub/|baseurl=https://mirror.sjtu.edu.cn/|g' -i.bak /etc/yum.repos.d/{fedora.repo,fedora-updates.repo}
```

## 加 rpmfusion 源

参考 [help.cernet.edu.cn 提供的文档](https://help.mirrors.cernet.edu.cn/rpmfusion/?mirror=SJTUG-Siyuan)

安装源配置文件

```bash
sudo yum install --nogpgcheck https://mirror.sjtu.edu.cn/rpmfusion/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm https://mirror.sjtu.edu.cn/rpmfusion/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm
```

换源

```bash
sudo sed -e 's!^metalink=!#metalink=!g' \
         -e 's!^mirrorlist=!#mirrorlist=!g' \
         -e 's!^#baseurl=!baseurl=!g' \
         -e 's!https\?://download1\.rpmfusion\.org/!https://mirror.sjtu.edu.cn/rpmfusion/!g' \
         -i.bak /etc/yum.repos.d/rpmfusion*.repo
```

## dnf 操作默认使用 [Y/n]

```bash
sudo sh -c "echo 'defaultyes=True' >> /etc/dnf/dnf.conf"
```

## 移除不想要的软件

### libreoffice

```bash
sudo dnf remove libreoffice*
```

### discover, flatpak

```bash
sudo dnf remove discover flatpak
```

### podman

```bash
sudo dnf remove podman
```

## 关闭 selinux

```bash
sudo sed -i "s|SELINUX=enforcing|SELINUX=disabled|" /etc/selinux/config
```

## vlc，mpv，ffmpeg （补全大部分编码器）

```bash
sudo dnf install vlc mpv ffmpeg --allowerasing
```

## docker

```bash
sudo dnf install docker
```

## rustdesk

直接去官方的 Github Release 下载安装包

```bash
sudo dnf install https://github.com/rustdesk/rustdesk/releases/download/1.3.2/rustdesk-1.3.2-0.x86_64.rpm
```

> 尽管 Rustdesk 支持被控端使用 wayland，但因为权限原因需要被控端手动选择被控区域，不适合无人值守的环境，因此还是要换 x11。

### 安装 x11 支持

```bash
sudo dnf install plasma-workspace-x11
```

### 使用 x11 启动 sddm

```bash
sudo sed -i "s|^#DisplayServer=wayland|DisplayServer=x11|" /etc/sddm.conf
```

## 开发相关

```bash
sudo dnf install gcc g++ python3-devel
```

## 解除 systemd-resolved 53 端口占用

编辑 `/usr/lib/systemd/resolved.conf`，取消注释，yes 改 no

```diff
[Resolve]
# Some examples of DNS servers which may be used for DNS= and FallbackDNS=:

//...

#DNS=
#FallbackDNS=
#Domains=
#DNSSEC=no
#DNSOverTLS=no
#MulticastDNS=yes
#LLMNR=yes
#Cache=yes
#CacheFromLocalhost=no
-#DNSStubListener=yes
+DNSStubListener=no
#DNSStubListenerExtra=
#ReadEtcHosts=yes
#ResolveUnicastSingleLabel=no
#StaleRetentionSec=0
```

## 配置 fcitx5

```bash
sudo dnf install fcitx5-chinese-addons kcm-fcitx5 fcitx5-autostart
```

在 设置 - 输入法 中添加拼音

### 安装词库

https://github.com/felixonmars/fcitx5-pinyin-zhwiki

https://github.com/outloudvi/mw2fcitx

### 在 wayland 下使用

参考 [处理 fcitx5 的文字候选框在 tg 客户端上闪烁的问题](/2022/07/03/fcitx5-blinking-on-tg-under-wayland-kde/)

```diff
if [ ! "$XDG_SESSION_TYPE" = "tty" ]   # if this is a gui session (not tty)
then
    # let's use fcitx instead of fcitx5 to make flatpak happy
    # this may break behavior for users who have installed both
    # fcitx and fcitx5, let then change the file on their own

    export INPUT_METHOD=fcitx
    export GTK_IM_MODULE=fcitx
    export QT_IM_MODULE=fcitx
    export XMODIFIERS=@im=fcitx
fi
+if [ "$XDG_SESSION_TYPE" = "wayland" ]
+then
+        unset QT_IM_MODULE
+fi
```

然后仍然要去 设置 - 键盘 - 虚拟键盘 中选中 fcitx5

## 安装 vscode

```bash
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" | sudo tee /etc/yum.repos.d/vscode.repo > /dev/null
sudo dnf install code
```

## 网络优化工具

略

## 禁用防火墙

```bash
sudo systemctl disable firewalld --now
```

## RPM 构建

参考 [以 Archlinux 中 makepkg 的方式打开 rpmbuild](/2024/05/03/open-rpmbuild-in-the-way-of-archlinux-makepkg/)
