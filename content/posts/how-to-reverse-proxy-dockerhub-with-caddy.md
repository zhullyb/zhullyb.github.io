---
title: 使用 Caddy 反向代理 dockerhub 需要几步？
date: 2024-09-21 01:29:17
description: 本文详细介绍了如何利用 Caddy 服务器搭建 Docker Hub 反向代理服务，以解决中国大陆用户访问 Docker Hub 镜像缓慢或无法访问的问题。文章首先通过 mitmproxy 抓包分析 Docker 拉取镜像的完整流程，识别出关键请求域名，并解释为什么需要同时代理 registry-1.docker.io、auth.docker.io 和 production.cloudflare.docker.com 三个域名。随后，逐步讲解 Caddy 配置方法，包括响应头重写、域名替换等关键技术细节，并提供两种使用方式：命令行指定镜像地址或修改 Docker 守护进程配置。最后，文章还提供了验证方法和相关参考资料，适合有一定 Linux 和 Docker 使用经验的用户阅读实践。
sticky:
index_img: https://static.031130.xyz/uploads/2024/09/21/46f7b160e6e56.webp
tags:
- Caddy
- Docker
- mitmproxy
- Network
- Linux
---

几个月前，由于众所周知的原因，中国大陆境内失去了所有公共的 dockerhub 镜像（或者说是反代）。网上随即涌现了一批自建 dockerhub 反代的，有用 Cloudflare Workers 的，也有用 nginx 的，甚至还有自建 registry 的。我使用 caddy 的原因很简单，一是配置简单，而是通过一台国内访问质量良好的境外服务器进行反向代理的访问质量会比 Cloudflare 减速器好很多。

前一阵子在中国大陆境内想要从 dockerhub 拉取镜像的时候遇到了这方面的困扰，因此有自建 dockerhub 反代的想法。

## 遇事不决先抓包

为了弄清楚 docker 从 dockerhub 拉取镜像的过程，需要先对网络请求进行抓包。具体的抓包方案我使用的是 mitmproxy，手动信任 ssl 证书的操作在「[在 Linux 下使用 mitmproxy 抓取 HTTPS 流量](/2024/02/29/capture-https-traffic-on-linux-with-mitmproxy/)」这篇文章中已经讲过了，只需要配置 dockerd 使用本机的 8080 端口进行代理即可。

docker pull 时，是调用 dockerd 进行镜像拉取，而 dockerd 在绝大多数发行版上都是由 systemd 进程直接启用了，在 shell 中直接设置环境变量的方式并不能进行代理，而透明代理的方案会引入大量无关请求，增加流量分析的难度。

比较好的方案是直接在 systemd 服务这一层设置好代理的环境变量，我这里参考的是「[配置 HTTP/HTTPS 网络代理 | Docker — 从入门到实践](https://yeasy.gitbook.io/docker_practice/advanced_network/http_https_proxy)」这篇文章。

```bash
$ cat /etc/systemd/system/docker.service.d/http-proxy.conf 

[Service]
Environment="HTTP_PROXY=http://127.0.0.1:8080"
Environment="HTTPS_PROXY=http://127.0.0.1:8080"
```

重启完 systemd 服务，万事俱备，我拉取了一个较小的 docker 镜像，顺利得到了预期的结果。

```bash
docker pull svenstaro/miniserve:latest
```

![抓包结果](https://static.031130.xyz/uploads/2024/09/21/acbee0959be78.webp)

docker 先请求了 `registry-1.docker.io` 得到了 401 的 http 状态码后转去访问了 `auth.docker.io`，得到了 Authorization 字段以后重新请求 `registry-1.docker.io`，获取源数据后被 307 转发到了 `production.cloudflare.docker.com` 上。

其中，第一个 401 响应的响应头中，用 WWW-Authenticate 字段标注了 auth 鉴权的域

![WWW-Authenticate](https://static.031130.xyz/uploads/2024/09/21/e905c55e76a25.webp)

而 307 响应的响应头中，使用 Location 字段标注了被转发到的 url

![Location](https://static.031130.xyz/uploads/2024/09/21/6a2e0bf6a8284.webp)

## 三个域名都需要反向代理嘛？

首先，作为我们提供反代服务的入口，`registry-1.docker.io` 一定是需要代理的，否则就无法提供反代后的服务。

`auth.docker.io` 只出现了一次，需要反代嘛？根据它在境内的访问质量，恐怕是需要反代的。

![auth.docker.io](https://static.031130.xyz/uploads/2024/09/21/4a70c8cac6a4c.webp)

最后就是 `production.cloudflare.docker.com` ，这也是我们最终下载镜像文件的地方，99% 以上的流量都是打到这里去的，而 cloudflare 在境内的访问质量是知名的减速器，完全不可以信赖。

**因此，三个域名都需要反代。**

## 如何反代

分三个域名各自代理，在 `registry-1.docker.io` 那一块进行特殊处理，将响应头中的 WWW-Authenticate 和 location 字段进行关键词替换，将原域名替换为反代域名。

最后的成果大概就是这个样子:

```caddyfile
dockerhub.example.com {
	reverse_proxy https://registry-1.docker.io {
		header_up Host {http.reverse_proxy.upstream.hostport}
		header_down WWW-Authenticate "https://auth.docker.io" "https://auth.dockerhub.example.com"
		header_down Location "https://production.cloudflare.docker.com" "https://production.dockerhub.example.com"
	}
}

auth.dockerhub.example.com {
	reverse_proxy https://auth.docker.io {
		header_up Host {http.reverse_proxy.upstream.hostport}
	}
}

production.dockerhub.example.com {
	reverse_proxy https://production.cloudflare.docker.com {
		header_up Host {http.reverse_proxy.upstream.hostport}
	}
}
```

PS: 推荐后两个域名使用 CNAME 解析到第一个域名，这样后面更改解析的时候更方便一些。

## 如何设置 docker 使用反代

可以直接在 `docker pull` 和 `docker run` 的命令前加上域名，比如原本的

```bash
docker run hello-world
```

改成

```bash
docker run dockerhub.example.com/library/hello-world
```

（如果原本的镜像由 dockerhub 官方提供，没有用户名，路径需要加上 “library”）

***

也可以选择以前的方案，创建或修改 `/etc/docker/daemon.json`：

```
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
    "registry-mirrors": [
        "https://dockerhub.example.com"
    ]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

## 验证

一般来说，能够在中国大陆境内的网络质量下较快地下拉镜像本身就代表反代成功了，但保险起见可以像本文的第一部分一样抓个包，看看是不是都走了自己的域名了。

## 参见

[国内的 Docker Hub 镜像加速器，由国内教育机构与各大云服务商提供的镜像加速服务](https://gist.github.com/y0ngb1n/7e8f16af3242c7815e7ca2f0833d3ea6)

[无障碍访问 Docker Hub 的各种方法（自建 registry、Cloudflare 加速、Nginx 反代、代理 Docker 网络） | 绅士喵](https://blog.hentioe.dev/posts/unhindered-accesss-dockerhub.html)
