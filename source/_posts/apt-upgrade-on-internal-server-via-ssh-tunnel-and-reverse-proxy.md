---
title: ssh 拯救世界——通过 ssh 隧道内网服务器执行 APT 更新
date: 2025-03-30 21:45:24
sticky:
tags:
- Apt
- Network
- OpenSSH
- Caddy
- Linux
- Debian
---

事情的起因是因为精弘的[前技术总监](https://blog.cnpatrickstar.com/)抱怨学校的内网服务器无法连接外网，从而导致 apt 安装与更新异常困难，需要手动从源中下载软件包、软件包的依赖及其依赖的依赖。。。然后将这些包通过 sftp/rsync 一类的手段传到服务器上手动安装。

![](https://static.031130.xyz/uploads/2025/03/30/0447b7d64886a.webp)

于是本文应运而生，我们可以在本机使用 Caddy （Nginx 当然也行）反代一个 APT 源镜像站，通过 ssh 隧道建立端口转发，这样就可以在内网服务器上访问到本地的 Caddy 服务器，进而访问到外网的镜像站。

## 前提条件

- 主控机（你自己的电脑）能够通过 ssh 直接连接电脑（可以是使用一些网络工具），而不是先通过 ssh 登陆到一台中转机，再从中转机登陆到目标服务器。后面这种情况当然也可以使用类似的手段实现我们的目标，但会更复杂一些。
- 主控机（你自己的电脑）在连接内网服务器的同时，能够连接公网镜像站（~~不行的话要不然你提前本地同步一份镜像做离线镜像站~~）。

## 反代镜像站

我这里选择了 Caddy 而非 Nginx，一方面是 Caddy 的配置文件写起来简单，另一方面 Caddy 是 Golang 编写，一个二进制走天下，Windows 也能直接[下载](https://caddyserver.com/download)运行。

我们以最常见的清华 tuna 镜像站为例，一个简单的 caddy 配置文件是这样的

```nginx
:8080 {
    reverse_proxy https://mirrors.tuna.tsinghua.edu.cn {
        header_up Host {http.reverse_proxy.upstream.hostport}
    }
}
```

将上面这段代码保存为 Caddyfile 文件名，随后使用 caddy 命令在保存路径运行

```bash
caddy run --config ./Caddyfile
```

![](https://static.031130.xyz/uploads/2025/03/30/8ef15a08e4852.webp)

如果没有报错，那你应该能在本地的 8080 端口看到清华的镜像站

![](https://static.031130.xyz/uploads/2025/03/30/a9083c95c07a2.webp)

> 你可能注意到，反代后的页面和清华的镜像站有些许差异，没有清华的 logo，这大概是因为页面的 js 对 host 进行了判断，如果不是清华或者北外的页面，就不会添加学校的名称，但这不影响我们从这些镜像站获取更新。

## 建立 ssh 隧道

建立隧道时，需要使用如下的命令

```bash
ssh -R 8085:localhost:8080 root@remote.example.com
```

-R 表示建立反向隧道，其他的参数选项可以参考这一篇博客「[SSH 隧道技术](https://www.entropy-tree.top/2024/04/18/ssh-tunneling-techniques/)」，也是精弘的学长写的。

此时，我们建立了一个内网服务器 8085 端口到本机 8080 端口的 ssh 端口转发。（使用 8085 端口是我为了区分其和 8080 端口，实际上可以使用任何空余端口）

我们可以在服务器上使用 curl 来测试一下是否能够正常访问，我这里简单访问了下 Debian 源根目录下的一个 README 文件。

```bash
curl http://localhost:8085/debian/README
```

![](https://static.031130.xyz/uploads/2025/03/30/597c4af0d398d.webp)

## 换源

所以现在我们在内网服务器的 8085 端口上有一个清华开源镜像站的反代，我们可以通过 8085 端口访问镜像站中的所有内容。

先遵循[清华开源镜像站的指示](https://mirrors.tuna.tsinghua.edu.cn/help/debian/)，进行换源，**记得一定要勾选「强制安全更新使用镜像」**。

![](https://static.031130.xyz/uploads/2025/03/30/46e3c7030ded4.webp)

随后，我们将源中的所有 https://mirrors.tuna.tsinghua.edu.cn 替换成 http://localhost:8085

```bash
sed -i 's|https\?://mirrors\.tuna\.tsinghua\.edu\.cn|http://localhost:8085|g' `grep -rlE 'http(s)?://mirrors\.tuna\.tsinghua\.edu\.cn' /etc/apt/`
```

![执行 apt update](https://static.031130.xyz/uploads/2025/03/30/a8f0c70d48f5b.webp)

![使用 apt 安装 unzip](https://static.031130.xyz/uploads/2025/03/30/07919bf939e92.webp)

可以看到，我们通过 ssh 隧道实现了在内网服务器执行 APT 更新及安装软件。

> 温馨提示，ssh 隧道在本世纪 10 年代初经常被用来进行搭建一些跨境访问，但因为其独特的流量特征很快淡出了历史舞台，因此不要使用 ssh 进行大量的跨境网络传输，容易被封禁。

当然，实现这一目标的方法是很多的，其他一些例如 frp 的工具同样能做到这种效果，只不过 ssh 隧道这种方案随开随用，随关随停，不需要更多的配置，因此我主要推荐。
