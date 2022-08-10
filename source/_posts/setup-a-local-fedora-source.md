---
title: 创建一个本地的 Fedora 镜像源
date: 2022-05-11 04:18:26
sticky:
tags:
- Fedora
- Caddy
---

> Fedora 36 在多次跳票后，总算是在 5月10日正式发布了。截止北京时间 5月11日凌晨两点，上海交通大学开源镜像站的上游 `rsync://download-ib01.fedoraproject.org/`  仍然没有同步 Fedora 36 的 Release 源。鉴于 Release 自 freeze 以后基本是不会有什么大变动的，也不需要及时同步更新，干脆就直接建立一个本地的镜像源。

## 准备

1. 一块足够大的硬盘

   根据我个人实测，单 Fedora 36 的 x86_64 架构 的 Release 源中的 binary rpm 就占用了 89.6 GB，具体准备多的的硬盘空间还得看你具体需要同步些什么。

2. 符合要求的上游

   这里所说的符合要求一共是两个方面，一是允许 rsync 同步，二是有你想要的文件。我通过 getfedora.org 的下载按钮的转发目标得知 `mirror.karneval.cz` 已经完成了 Fedora 36 Release 源的同步。

3.  良好的网络条件

   这里说的良好的网络条件，并不一定是说需要访问境外站点的能力，而是你和你的上游之间的网络访问畅通，不要动不动就i断开连接那种。如果你选择的是国内镜像站作为你的上游，那一般不会有什么问题。

## 开始同步

现在的主流方案一般都是选择 `rsync` 直接开整。

### 试探环节

很多镜像站的 rsync 文件路径和 http 文件路径路径是不同的。

比如说，我这里用的 mirror.karneval.cz 的 http 页面显示的 fedora 仓库路径在 `/pub/fedora`，但 rsync 同步时需要使用 `/fedora` 路径。

为了确定这一点，我们可以先通过 `rsync rsync://example.com` 进行预览

```bash
rsync rsync://mirror.karneval.cz
```

![image-20220511103736493](https://bu.dusays.com/2022/05/11/627b2177c4da2.png)

通过一层一层预览目录的方式，找到需要同步的路径是 `/fedora/linux/releases/36/Everything/x86_64/os/`

### 同步环节

通过 `mkdir` 和 `cd` 创建并进入我们准备用于同步源码的文件夹，然后开始执行同步命令。

```bash
rsync -avP rsync://mirror.karneval.cz/fedora/linux/releases/36/Everything/x86_64/os/ .
```

*Ps: 中途如果由于各种原因而中断了同步过程，可以再次使用上述命令继续同步，rsync 会保证文件完整性。*

![耗费两个半小时，同步成功](https://bu.dusays.com/2022/05/11/627b22fa44446.png)

## 安装、配置并启用 static server (可选)

如果只需要本机使用，那么直接跳过这一步即可；如果需要给局域网内的其他机器提供镜像源，那么需要启用 static server。

我这里选择的是 caddy，性能虽然比 nginx 略逊一筹，但胜在配置简单。

caddy 的安装可以直接参考[官方文档](https://caddyserver.com/docs/install)，这里不再赘述。

配置也不过那么几行的事情，我给个 example。端口号只要和别的程序没有冲突，就可以随意指定。443 端口需要 ssl 证书比较麻烦，局域网内直接用非标准端口即可。

```
:14567 {
        root * /the/directory/you/use

        file_server {
                browse
        }
}
```

配置完后直接以普通用户的权限启用即可，使用 systemd 启用需要解决 caddy 用户对目标无权限的问题。

```bash
caddy run --config /etc/caddy/Caddyfile
```

浏览器输入对应的 ip 和端口，应该就可以访问了。

![image-20220511113417004](https://bu.dusays.com/2022/05/11/627b2ebd23331.png)

## 修改源配置文件

由于我们仅同步了 Release 源，就只需要修改 `/etc/yum.repo.d/fedora.repo` 即可。

如果镜像源在本机上，可以直接使用 `file://` 协议头: 

```diff
[fedora]
name=Fedora $releasever - $basearch
+ baseurl=file:///the/directory/you/use
- metalink=https://mirrors.fedoraproject.org/metalink?repo=fedora-$releasever&arch=$basearch
enabled=1
countme=1
metadata_expire=7d
repo_gpgcheck=0
type=rpm
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-fedora-$releasever-$basearch
skip_if_unavailable=False
```

如果镜像源在同局域网设备上，通过 `http://` 协议也能达到相同的效果: 

```diff
[fedora]
name=Fedora $releasever - $basearch
+ baseurl=http://192.168.1.233:14567
- metalink=https://mirrors.fedoraproject.org/metalink?repo=fedora-$releasever&arch=$basearch
enabled=1
countme=1
metadata_expire=7d
repo_gpgcheck=0
type=rpm
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-fedora-$releasever-$basearch
skip_if_unavailable=False
```

*Ps: 提供镜像源的机子的局域网 ip 可以通过 `ip -br a` 命令获取*
