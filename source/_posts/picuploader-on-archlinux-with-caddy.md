---
title: PicUploader使用系列（一）——在Archlinux上使用Caddy部署PicUploader
date: 2021-10-21 22:15:33
sticky:
tags:
- Archlinux
- Caddy
- PicUploader
---

 之前找对大陆网络友好的图床时，找到了cloudinary，但是全英文界面对操作增加了不少难度，其页面也不是很简洁，让我一下打消了使用网页版的念头。通过搜索，找到了 PicUploader 这一方案，使用php编写，支持cloudinary的api。

 作者在其[博客](https://www.xiebruce.top/17.html)中仅提供了nginx的部署方案，我参考其配置文件成功实现了在caddy下的部署，并且花费了数个小时排坑，故写下本文帮助后来者节省时间。

## 安装`caddy`和`php-fpm`以及所需的拓展

```bash
sudo pacman -S caddy php-fpm php-gd php-sqlite --needed
```

## 配置`php-fpm`

### 在`/etc/php/php.ini`启用PicUploader所需拓展

PicUploaer依赖于`fileinfo`、`gd`、`curl`、`exif`、`pdo_sqlite`拓展，可以使用`php -m`命令来查看目前加载成功了的插件。

```diff
;extension=bcmath
;extension=bz2
;extension=calendar
- extension=curl
+ extension=curl
;extension=dba
;extension=enchant
- extension=exif
+ extension=exif
;extension=ffi
;extension=ftp
- extension=gd
+ extension=gd
;extension=gettext
;extension=gmp
;extension=iconv
;extension=imap
;extension=intl
;extension=ldap
;extension=mysqli
;extension=odbc
;zend_extension=opcache
;extension=pdo_dblib
;extension=pdo_mysql
;extension=pdo_odbc
;extension=pdo_pgsql
- extension=pdo_sqlite
+ extension=pdo_sqlite
;extension=pgsql
;extension=pspell
;extension=shmop
;extension=snmp
;extension=soap
;extension=sockets
;extension=sodium
;extension=sqlite3
;extension=sysvmsg
;extension=sysvsem
;extension=sysvshm
;extension=tidy
;extension=xmlrpc
;extension=xsl
extension=zip
```

### 编辑`/etc/php/php.ini`以增加单文件上传大小限制

~~查出这个问题浪费了我整整4小时时间。~~

```diff
- upload_max_filesize = 2M
+ upload_max_filesize = 100M
```

### 编辑`/etc/php/php-fpm.d/www.conf`使其在运行时使用caddy用户。

```diff
---
; Unix user/group of processes
; Note: The user is mandatory. If the group is not set, the default user's group
;       will be used.
- user = http
+ user = caddy
- group = http
+ group = caddy
; The address on which to accept FastCGI requests.
; Valid syntaxes are:
;   'ip.add.re.ss:port'    - to listen on a TCP socket to a specific IPv4 address on
;                            a specific port;
;   '[ip:6:addr:ess]:port' - to listen on a TCP socket to a specific IPv6 address on
---
---
; Note: This value is mandatory.
listen = /run/php-fpm/php-fpm.sock
; and group can be specified either by name or by their numeric IDs.
; Default Values: user and group are set as the running user
;                 mode is set to 0660
- listen.owner = http
+ listen.owner = caddy
- listen.group = http
+ listen.group = caddy
;listen.mode = 0660
; When POSIX Access Control Lists are supported you can set them using
; these options, value is a comma separated list of user/group names.
; When set, listen.owner and listen.group are ignored
;listen.acl_users =
;listen.acl_groups =
---
```

**2022年1月14日更新**：在 Fedora 尝试部署的时候遇到了新的坑，Fedora 的相应配置文件为 `/etc/php-fpm.d/www.conf`，相应修改如下

```diff
; Unix user/group of processes
; Note: The user is mandatory. If the group is not set, the default user's group
;       will be used.
; RPM: apache user chosen to provide access to the same directories as httpd
-user = apache
+user = caddy
; RPM: Keep a group allowed to write in log dir.
-user = apache
+group = caddy

; The address on which to accept FastCGI requests.
; Valid syntaxes are:
;   'ip.add.re.ss:port'    - to listen on a TCP socket to a specific IPv4 address on
;             a specific port;
---
---
; Set permissions for unix socket, if one is used. In Linux, read/write
; permissions must be set in order to allow connections from a web server.
; Default Values: user and group are set as the running user
;                 mode is set to 0660
-;listen.owner = nobody
+listen.owner = caddy
-;listen.owner = nobody
+listen.group = caddy
;listen.mode = 0660

; When POSIX Access Control Lists are supported you can set them using
; these options, value is a comma separated list of user/group names.
; When set, listen.owner and listen.group are ignored
-listen.acl_users = apache,nginx
+;listen.acl_users = apache,nginx
;listen.acl_groups =

; List of addresses (IPv4/IPv6) of FastCGI clients which are allowed to connect.
; Equivalent to the FCGI_WEB_SERVER_ADDRS environment variable in the original
; PHP FCGI (5.2.2+). Makes sense only with a tcp listening socket. Each address
; must be separated by a comma. If this value is left blank, connections will be
; accepted from any ip address.
; Default Value: any
listen.allowed_clients = 127.0.0.1
```

## 拉取 PicUploader 最新代码

首先创建一个用于存放代码的目录

```bash
sudo mkdir -p /var/www/
```

clone 最新源码

```bash
sudo git clone https://github.com/xiebruce/PicUploader.git /var/www/picuploader
```

将代码所有权转交给caddy用户

```bash
sudo chown -R caddy:caddy /var/www/picuploader
```

## 编辑Caddyfile

caddy默认使用`/etc/caddy/Caddyfile`，因此如果你就部署这一个站点，直接修改这个就好了。

caddy的语法非常简洁易懂，因此我随手写了几行就能跑起来了。

下面是我用的Caddyfile，如果你在服务器上部署，请把`http://api.picuploader.com`更换为你服务器所需要绑定的域名(不带http协议头)，caddy将自动为你申请ssl证书。

```
http://api.picuploader.com {
        root * /var/www/picuploader

        php_fastcgi * unix//run/php-fpm/php-fpm.sock {
                index dashboard.php
        }

        file_server {
                index index.php
        }

        handle_errors {
        root * /etc/caddy/error
                rewrite * /error.html
                templates
                file_server
        }
}

# Import additional caddy config files in /etc/caddy/conf.d/
import /etc/caddy/conf.d/*
```

php我选择了监听本地`unix//run/php-fpm/php-fpm.sock`的方案，这个路径在上文的`/etc/php/php-fpm.d/www.conf`可以设置，如需查询，直接使用 `grep listen\ = /etc/php/php-fpm.d/www.conf`应该就能看见。

### 设置访问密码（可选）

caddy2开始不允许在caddyfile中直接指定明文密码，因此我们需要用`hash-password`获取加密后的密码密文

```bash
caddy hash-password  --plaintext <YourPassword
```

再在Caddyfile中，加上

```
basicauth /* {
		<username <hashed_password
}
```

## 修改hosts/设置DNS解析

由于 api.picuploader.com 这个域名不在我手里，而我只是想在本地使用，并不打算部署到服务器，因此修改hosts将这个域名解析到本地是个不错的选择。

```bash
sudo sh -c "echo '127.0.0.1		api.picuploader.com'  /etc/hosts"
```

而你若是在服务器上部署，应当去设置DNS解析，这个应该不需要我多说。

## 开启服务

在Archlinux下，我习惯直接用systemd运行`caddy`和`php-fpm`以开机自启动。

```bash
sudo systemctl enable --now caddy php-fpm
```

## 最终测试

在浏览器内访问 [api.picuploader.com](http://api.picuploader.com) ，如果能看到页面，就算是成功啦。

## 设置上传参数

见作者博客：[PicUploader: 各图床获取上传图片参数的方法](https://www.xiebruce.top/117.html)

