---
title: vuejs、php、caddy 与 docker —— web 期末大作业上云部署
date: 2023-12-27 22:09:00
sticky:
tags:
- PHP
- Caddy
- Vue.js
- Network
- Docker
---

> 这学期修了一门叫《用HTML5 和 PHP编写JavaScript，jQuery 和 AJAX脚本》的 web 课（对，听起来很奇怪的名字）。期末大作业是写一个影评系统，前端允许使用框架，后端仅允许使用 php，具体的作业要求如下
>
> ![作业要求](https://static.031130.xyz/uploads/2024/08/12/658c4c3128ae4.webp)
>
> （源码会在验收结束以后开源）
>
> 大作业写了得要有三个礼拜，工作时长加起来得有 30 个小时，想着验收之前上线一段时间积累一些评论数据，验收的时候也会更加顺利一些，于是就开始尝试在服务器上部署。部署的过程还是比较复杂的，所以写下这篇博客记录一下。

## 后端部分

早前有[《PicUploader使用系列（一）——在Archlinux上使用Caddy部署PicUploader》](https://zhul.in/2021/10/21/picuploader-on-archlinux-with-caddy/)的经验，便觉得使用 Caddy + php-fpm 部署的方式多少有点麻烦了，这次便尝试了使用 Docker 部署、Caddy 反代的方式。

Dockerfile 如下:

```dockerfile
FROM php:8-apache
RUN docker-php-ext-install mysqli
RUN a2enmod rewrite
COPY . /var/www/html
EXPOSE 80
```

在后端的根目录下有一个 .htaccess 文件，将所有的请求都交给 index.php 来处理，这样就可以根据我的[上一篇博客](https://zhul.in/2023/12/12/php-simple-rest-api/)中所提到的方式去构建不使用任何 php 框架实现的简易 router 效果

```htaccess
RewriteEngine On
RewriteRule ^(.*) index.php [QSA,L]
```

构建 Docker 镜像时使用 `docker build . -t mrs-php` 命令，运行 docker 容器时使用命令

```bash
docker run -d \
    -p 7788:80 \
    --name mrs-php \
    -v /path/to/uploads:/var/www/html/uploads \
    --restart unless-stopped \
    mrs-php
```

这样，后端就在 7788 端口上开起来了，后续 Caddy 只要将打到 `/api/*` 和 `/uploads/*` 的请求转发到 7788 端口即可，避免了使用 php-fpm 时需要的配置。`uploads` 目录是用来存放图片的，我将这个路径挂在在宿主机的目录下，方便备份导入等操作。

### mysql 连接时的小插曲

需要注意的是，在 Docker 容器中运行的 php 如果想要访问宿主机上的 mysql，需要注意修改 mysql 服务器的 ip 地址，并允许 mysql 接收来自非本机的请求。

在宿主机中运行 `ip -br a` 命令可以看到 docker 所采用的虚拟网卡的 ip 地址

```
docker0          UP             172.17.0.1/16 fe80::42:eff:febf:b26c/64
```

我这边得到的 ip 地址是 172.17.0.1，所以在 php 那边访问的数据库 ip 地址就应该是 172.17.0.1，而非 localhost 或者 127.0.0.1

此外，需要允许宿主机的 mysql 接收来自 Docker 容器的请求

使用 `docker network inspect bridge` 命令可以查到 docker 容器的 ip 地址，接着需要去允许来自这个 ip 的请求。建议去网上自行搜索，因为 mysql 语句我自己也不熟悉。我使用的 mysql 版本是 8，语句似乎和以前的版本不兼容？我使用下面三个命令轮着输就好了（有时候报错，有时侯又不报错），有大佬懂的话评论区讲讲。

```mysql
use mysql;
GRANT ALL ON *.* TO 'root'@'%';
update user set host='%' where user='root';
GRANT ALL ON *.* TO 'root'@'%';
```

## 前端部分

前端部分部署起来没什么难度

我使用的是 vite 开发的 vuejs 项目，直接使用 `pnpm build` 构建出静态文件，然后放入了 `/var/www/mrs` 目录，这部分没什么可说的

## Caddy 配置

Caddy 配置如下

```
example.com {
    handle /api/* {
        reverse_proxy localhost:7788
    }

    handle /uploads/* {
        reverse_proxy localhost:7788
    }

    handle /* {
        root * /var/www/mrs
        file_server
        try_files {path} /
    }
}
```

将打到 `/api/*` 和 `/uploads/*` 都交给 7788 端口的后端进行处理，前端部分要使用 `try_files` 将请求都指向 `/` 或 `/index.html` 交由 vue-router 处理，否则 caddy 就找不到对应的文件了。这里我尝试过使用 route 关键词代替 handle，但 `try_files` 的功能没有生效，这两者的区别官方文档中有提到，但我没看懂，等我以后看看有没有机会去折腾了。

## 参考:

[使用Caddy配置同一域名下的前后分离](https://homeboyc.cn/blog/%E4%BD%BF%E7%94%A8caddy%E9%85%8D%E7%BD%AE%E5%90%8C%E4%B8%80%E5%9F%9F%E5%90%8D%E4%B8%8B%E7%9A%84%E5%89%8D%E5%90%8E%E5%88%86%E7%A6%BB/)

[Caddy 2](https://blog.lyh543.cn/notes/linux/caddy.html)
