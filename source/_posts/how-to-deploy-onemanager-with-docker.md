---
title: 如何使用 docker 部署 onemanager
date: 2024-02-11 16:30:29
sticky:
execrpt:
tags:
- PHP
- OneDrive
- OpenSource Project
- Docker
---

***

## 部署方法

如果你只是想找一个 OneManager-php 的 Docker 部署方法，直接看 [https://github.com/zhullyb/OneManager-php-docker](https://github.com/zhullyb/OneManager-php-docker)

***

一直以来，我都是 [OneManager-php](https://github.com/qkqpttgf/OneManager-php) 的忠实用户。这些年来，尽管有 alist 这种 UI 好看，多种网盘高度聚合的项目逐渐取代了 onemanager 的生态位，但 onemanager 支持文件分片上传、上传流量不经服务器的特点还是让我非常满意。前一阵子，glitch 暂停了针对项目自定义域名的支持，因此在我手贱地取消了项目原本绑定的域名后，迫切地需要寻找一个新的部署的平台，只不过 onemanager 项目现在列出的方案都不太让我满意，因此我就萌生出了在 vps 上自己部署的想法。

### Docker 镜像选用

vps 上自己部署 php 项目，最简单的方法是使用 Docker，~~使用 Docker 就可以免去配置 nginx 或者同类产品的 php-fpm 配置~~才怪。我打开 Docker 提供的 [php 官方镜像](https://hub.docker.com/_/php)，最小的镜像是带`-cli`后缀的，这个镜像就不适合进行部署，php 内置的开发服务器是单线程的，当同时打开两个网页访问开发服务器的时候，其中一个网页就会卡住；以`-fpm`结尾的镜像变体很明显，仍然需要去 nginx 或同类产品的配置文件那边去配置 fpm，这给部署了好几次 php 项目的我带来的心理阴影；剩下一个就是`-apache`后缀、使用 apache server 提供 php 服务的镜像，体积虽然大了点，但好在操作简单，只需要将 php 文件放进 `/var/www/html`，启用 php 的相关拓展，启用 apache 的相关功能即可。

## php 拓展

php 的拓展可以使用镜像自带的 `docker-php-ext-install` 和 `docker-php-ext-enable` 命令进行操作，此外还有一个 `docker-php-ext-configure` 命令可以配置相关的拓展，不过我并不是 php 开发者，不熟悉拓展有什么好配置的。

OneManager-php 没有依赖任何的 php 拓展，因此这个步骤可以直接跳过。

## Apache Server 配置

和 php 拓展一样，镜像内也提供了几个命令进行 Apache Server 的配置，分别为 `a2disconf`、`a2dismod`、`a2dissite`、`a2enconf`、`a2enmod`、`a2ensite`、`a2ensite`。

OneManager-php 在部署的时候依赖于 Apache Server 的 rewrite 的模块，因此在 Dockerfile 中需要使用 `a2enmod rewrite` 开启 rewrite 支持。至于别的 Apache Server 配置，都可以通过项目中的 .htaccess 文件进行配置。

## ~~.htaccess 文件纠错~~

~~在 OneManager-php 仓库中，`.htaccess` 文件有一些小问题。~~

```htaccess
RewriteRule ^(.*) index.php?/$1 [L]
```

~~这行配置原本是将访问的路径追加到 `index.php?/` 后面的意思，但 一旦路径中出现了 `[`、`]` 或者空格等字符时，会触发 Apache 自带的保护，因此我们将这行改成下面这个样子即可。~~

```htaccess
RewriteRule ^(.*) index.php [QSA,L]
```

原项目合并了[我的 PR](https://github.com/qkqpttgf/OneManager-php/pull/716)，因此这一过程不再需要。

## 处理文件权限问题

OneManager-php 在运行过程中，会有针对配置文件的读写操作，此外还内置了一键更新的功能，因此会对路径内的文件进行读写，我们需要确保 php 在运行过程中有权限对这些文件进行读写。

可以直接将 `/var/www/html` 路径的所有权转给 `www-data` 用户。

```bash
chown -R www-data:www-data /var/www/html
```

## 最终的 Dockerfile

```dockerfile
FROM php:8-apache
RUN a2enmod rewrite
COPY OneManager-php /var/www/html
RUN chown -R www-data:www-data /var/www/html
```

其实一共就 4 行，还是挺简单的。
