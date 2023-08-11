---
title: 从零开始的静态网页部署（到个人云服务器）
date: 2023-08-04 01:19:22
sticky:
execrpt:
tags:
- Linux
- Network
- Vue.js
- Caddy
---

> 这篇博客是受 [Tiancy](https://www.tianci-blog.top/) 之托，在2023年精弘网络暑期授课的前端系列第七节课时针对项目部署这一块内容时所产生的产物。在授课视频中，受时长所限，我不得不采用宝塔面板+纯 ip 访问的方式来完成一个简单的部署，但这终究不是什么优雅的方案: 宝塔的安全性堪忧、其隐私性也是备受争议，而纯 ip 访问的方式也过于简陋，且没有支持 https 访问。
>
> 因此这篇博客将以面对初学者的口吻去讲述如何从零开始部署一个 Vue.js 的项目到云服务器，以解我心头的愧疚。但是，我没有备案过的域名，且国内云服务器厂商众多，这篇博客终究不可能做到像保姆级教学那样去一一演示每一家云服务器厂商网页面板上的操作过程，而一些比较基础的概念我会给出简单的解释和例子以及引用一些外部链接，但终究不会全面覆盖到，诸位还请见谅。
>
> 本文采用了一些 ChatGPT 和 Google Bard 提供的内容，准确性经过我本人核阅。

## 基础 Web 知识

针对以下三个知识点，我是在初中的信息课上学到的，互联网上应该不乏对于这三个问题的权威解释，因此我也不在此赘述，不知道的小伙伴请自行搜索。

- ip 地址是什么
- 域名是什么
- DNS 服务器是干什么的

## 关于备案

### 不备案的影响

当你通过域名去访问境内服务器的 80 (http 默认端口) 和 443 (https 默认端口)时，如果该域名没有备案或者境内这台云服务器的云服务器商不知道你在别的服务商那里有备案的情况下，则会对请求进行拦截。对于访问 80 的请求，将会直接劫持 http 请求以重定向到他们的备案提示页面；对于访问 443 的请求，由于 https 没法被劫持，则会通过连接重置的方式阻止你访问。如果你确定你需要使用中国大陆境内的云服务器，应当采取「备案」和「接入备案」两种方式分别解决上述两种情况。

### 备案方法

每个省都有自己对应的管局，而各省的管局对于备案的规则都有些差异，而个人备案一般是找自己户籍所在地的管局去备案，详细的可以看[阿里云写的文档](https://help.aliyun.com/zh/icp-filing/user-guide/icp-filing-regulations-of-the-miit-for-different-regions)。

### 使用中国大陆境外的云服务器

可以选择和我一样去中国大陆以外的地区部署云服务，但由于众所周知的原因，访问别的国家或地区的服务器可能会有速度慢、延迟高等问题，这涉及到线路优化，也比较复杂。更糟糕的情况是，你甚至有可能刚开出来一台机子就发现这个 ip 在中国大陆境内是无法访问到的，这也是比较尴尬的地方。一般来说，可以选择在境内的云服务器商那里实名认证（不是备案）去购买他们的境外服务器（比如 ucloud 新用户优惠的香港云服务器，~~ucloud 的客户经理看到了能不能再送我一台机子啊~~），这种机子是线路相对比较好的。

选购中国大陆境外的云服务器时，厂商可能会提供测试 ip 来帮助你判断线路质量，可以使用 ipip.net 提供的 [besttrace](https://www.ipip.net/product/client.html) 程序来查看数据包经过的地方，很可能你买一台香港的服务器，数据却要从日本或者美国绕一圈，这就非常尴尬。

## 域名部分

### 域名注册

要获得一个域名，最简单的方式是花钱。境内的阿里云、腾讯云、华为云等几家比较有名的云服务器厂商均有域名注册的业务且价格基本差距不大，可以随便找一个注册。而境外的域名注册商，我这边个人推荐 namesilo，这家支持支付宝付款且价格尚可，首次购买前可以去搜索引擎搜一搜近期的优惠码，可能会有一些优惠折扣。（可恶我没有拿到 aff 回扣）

### 域名解析

#### 域名解析的作用

如果你了解了 dns 的作用，那我们可以来简单讲讲域名解析是干什么的。dns 服务器将会告诉用户的设备某一个域名它对应的 ip 是多少，而域名解析这一步就是告诉世界上所有的 dns 服务器这个域名从此刻开始对应的 ip 是多少，以便世界上所有的 dns 服务器向网民在需要时告知他们正确的 ip 地址。

要实现这一步骤并不复杂，作为初学者我们也不必去担心会不会有人把你花钱买来的域名指向错误的 ip 地址，这些都交给域名解析服务去解决。几乎每一家提供的域名解析服务页面上都会指导你去将域名的 NameServer 设置为他们家的服务器，这里也不做教学。

#### 域名解析服务推荐

凡是提供域名注册服务的云服务商基本也都会提供域名解析服务，在这里我主要推荐两家云服务商（我没拿广告费啊）—— cloudflare 和 dnspod。这两家免费版套餐的操作页面都简洁明了，没有非常扎眼的广告。前者提供了除中国大陆以外地区的 cdn 加速服务，而后者可以提供境内境外分线路解析的功能（把来自境内的用户指向 ip 地址 A，来自境外的用户指向 ip 地址 B）。

#### 解析记录类型

作为初学者只需要了解 A 记录和 CNAME 记录就行了。

A 记录的意思就是将一个域名指向一个 ipv4 地址，也就是去实现 dns 服务器最主要的作用。而 CNAME 记录是将一个域名指向另一个域名，通俗来讲就是「和它一样」。比如 a.com 如果 CNAME 指向 b.com，意思就是说我现在不确定 a.com 的 ip 是多少，但我知道 a.com 的 ip 和 b.com 一样，所以你去查 b.com 就行了。

## 服务器部分

### 云服务器的购买

这部分我直接忽略过去了，本文在「关于备案」这一部分已经详细阐述了备案相关的内容，购买中国大陆境内还是境外的服务器需要由屏幕前的各位自己决定~~（应该没人会把我的博客打印成纸质稿看吧）~~。

### 如何选择云服务器上要运行的 Linux 发行版

服务器上常用的 Linux 发行版主要是 Debian、Ubuntu、CentOS(这个死得差不多了) 这三个，那我个人更熟悉的是 Ubuntu，版本号越新越好，截止本文发出最新的 lts 版本是 22.04 lts，所以直接选择这个就行。

### 使用 ssh 连接上服务器

在云服务器的网页面板上选择好服务器的配置与运行的操作系统后，云服务商应该至少给你提供两样东西: 云服务器的 ip 和 root 用户的登陆密码。这可能是在网页面板上展示的，一些境外的云服务商可能是直接发送到你注册时预留的邮箱中的，这都无所谓。拿到这两样东西我们就可以使用 ssh 连接到服务器的终端，进行配置操作。

打开自己系统的终端，使用如下命令去连接云服务器（Win10 以上的系统应该也已经自带 openssh 了）

```bash
ssh root@<your_server_ip>
```

```bash
[zhullyb@Archlinux ~]$ ssh root@120.55.63.96
The authenticity of host '120.55.63.96 (120.55.63.96)' can't be established.
ED25519 key fingerprint is SHA256:Op8u4Fv+NvtOxJDKeBQ/jIsFpuR4EYTUt53qjG8k6ok.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '120.55.63.96' (ED25519) to the list of known hosts.
root@120.55.63.96's password: 
Welcome to Ubuntu 22.04.2 LTS (GNU/Linux 5.15.0-78-generic x86_64)
```

输入密码时，已经输入的密码部分在屏幕上不会显示，但无需理会，只要将云服务器的密码粘贴后直接敲回车就好。

### 如何编辑一个服务器上的文件

一般来说，网上的教程会推荐你使用 vim 这个 tui 界面的编辑器去编辑这个文件，但 vim 的学习成本有点高，如果只是临时编辑服务器上的文件的话，我个人更加推荐使用 nano

```bash
nano /etc/caddy/conf.d/example.conf
```

这行命令表示我要编辑 `/etc/caddy/conf.d/example.conf` 这个文件，如果这个文件不存在则去创建这个文件。

随后你可以根据自己的需求去编辑文件了，上下左右按键可以调整光标位置，直接敲键盘上的字母按键就可以把字母敲进去，想推出时使用 `ctrl+s` 保存，再使用 `ctrl+x` 退出就可以了。

### 云服务器的安全组规则

一般是国内的云服务厂商会有安全组规则这种东西，你可以理解成一个额外的防火墙。一般来说，80 和 443 两个端口被我们约定作为网页的默认端口，80 是 http 的端口，而 443 则是![image-20230810152620477](/home/zhullyb/.config/Typora/typora-user-images/image-20230810152620477.png) https 的端口。因此，我们需要在安全组规则这里去允许 80 和 443 两个端口能被外部访问到。截图中是阿里云的控制面板。![](https://bu.dusays.com/2023/08/10/64d4e31fd5270.png)

![](https://bu.dusays.com/2023/08/10/64d4e34db94ee.png)

云服务商给的默认规则应该是下面这个样子的:

![image-20230810151900653](https://bu.dusays.com/2023/08/10/64d4e3ca6aa29.png)

这里开放的 22 端口用于 ssh 连接服务器，而3389 则是 Windows 的远程桌面。我们可以使用「快速添加」按钮来开放 80 和 443 端口

![](https://bu.dusays.com/2023/08/10/64d4e4e5b1e68.png)

### Linux 下常见的文件路径及对应作用

在这一章节中，我只罗列了几个比较常见的路径，更多的资料推荐查阅[菜鸟教程](https://www.runoob.com/linux/linux-system-contents.html)，写得还不错。`$USER` 指当前用户的用户名

| 路径          | 作用                                                         |
| ------------- | ------------------------------------------------------------ |
| `/home/$USER` | 用户的家目录，下有 Desktop，Download，Picture 等多个文件夹（root 用户的家目录是 `/root`） |
| `/etc`        | 存放软件的配置文件的地方                                     |
| `/usr/bin`    | 存放二进制可执行文件的地方，一般也会被链接到 `/bin`          |
| `/usr/lib`    | 一般用于存放依赖库(动态链接库)，一般会被链接到 `/lib`        |
| `/usr/share`  | 一些共享数据，比如帮助文档、软件需要的资源文件等等           |
| `/opt`        | optional(可选) 的缩写，一些由官网提供的（区别于发行版自带的）软件可能被安装到这里 |
| `/boot`       | 开机引导使用的路径，一般在正常使用时不会去操作这里           |
| `/var`        | variable(变量) 的缩写，存放那些经常被变更的东西，比如运行日志、网站数据等等 |

### caddy 的配置与使用

caddy 是一个 web 服务器，他是使用 golang 写的一个平替品，拥有配置更简单、自动申请 Let's Encrypt 证书的优势，我个人非常推荐非专业运维去使用这个。caddy 的官方文档在 https://caddyserver.com/docs/ ，但我相信你们不会去看（我也没有认真看过），有问题可以尝试去问问 chatgpt 看看能不能得到想要的配置文件。caddy 现在已经迭代到 V2 版本了，与 V1 版本相比有一些语法差异以支持更多的功能，且许可证允许商用更加自由。

caddy V2 支持使用 json 配置文件或者 Caddyfile，对于不复杂的需求我个人更推荐后者，简洁易懂。下面是我博客所使用的 Caddyfile 示例:

```nginx
# 这里表示，使用 zhul.in 这个域名访问 443 端口时，提供以下内容
zhul.in:443 {
        # 这里设置了所需提供内容的目录
        root * /var/www/blog

        # 这里设置的是开启 https 支持时所需要使用的 ssl 证书文件，但如果不设置也不碍事，caddy 会自动帮你申请 Let's Encrypt 的 ssl 证书
        tls /var/www/key/zhul.in.cert /var/www/key/zhul.in.key

        # 这里表示我们开启了 zstd 和 gzip 两种压缩算法，来减少数据传输量，不设置也没问题
        encode zstd gzip
        # 这里表示我们开启了一个文件服务器，当你访问 https://zhul.in/example_file 时，caddy 会提供 /var/www/blog/example_file 这个文件的内容
        file_server

		# 这里是错误处理部分
        handle_errors {
        		# 这里表示当发生错误时，将请求重定向到 /404.html 这个文件
               	rewrite * /404.html
            	# 这里使用了模板来处理错误页面。当发生错误时，Caddy会使用模板引擎来填充错误页面的内容，以便向用户显示有关错误的相关信息。
                templates
            	#这里表示继续使用文件服务器来提供错误页面
                file_server
        }
}
```

你可以发现，如果要把这个 Caddyfile 写到最简单，仅仅是能跑的状态，只需要这几行:

```nginx
zhul.in:443 {
        root * /var/www/blog
        
        file_server
}
```

这就是我为什么推荐非专业运维去使用 caddy 的原因，只需要三行代码就可以跑起来一个简单的服务。

而部署一个 Vue.js 项目，我们可能会需要多加一行 `try_files {path} {path}/ /index.html` ，这一行代码的意思是当用户尝试访问 /example 时，实际需要用户的浏览器去访问 /index.html 这个地方，因为使用了 vue-router 的项目的编译产物只有 /index.html 而没有 /example.html，而后者的内容是包括在前者中的。以下的 Caddyfile 是精弘的首页正在使用的配置文件，应该可以适用于绝大多数的 Vue 项目:

```nginx
www.myzjut.org {
        root * /var/www/jh

        encode zstd gzip
        file_server
        try_files {path} {path} /index.html
}
```

第一行省略了端口号，说明 80 和 443 端口都支持。

### 通过sftp/rsync将本地的静态网页上传到云服务器的对应目录

#### 使用 sftp 部署

> sftp 是一个交互性比较强的上下传工具，如果不喜欢背命令的话可以考虑使用 sftp，操作起来都比较顺其自然

首先，我们在本地 cd 到静态网页文件所在的路径，比如一个 Vue 项目编译产生的文件可能就会在 dist 下面

```bash
cd dist/
```

然后，我们使用 sftp 连接到服务器，这和 ssh 命令没什么两样的，就换了个命令名。

```bash
sftp root@<your_server_ip>
```

输入 root 用户的密码后，命令行的提示符就会变成 `sftp >` 的样子

```bash
[zhullyb@Archlinux ~]$ sftp root@<your_server_ip>
Connected to <your_server_ip>.
sftp>
```

这是一个交互式的命令行窗口，可以使用 `cd`、`mkdir` 等几个简单的命令。我们先创建 `/var/www` 这个文件夹:

```bash
sftp> mkdir /var/www
```

再创建 `/var/www/jh` 这个文件夹:

```bash
sftp> mkdir /var/www/jh
```

随后，我们就可以进入远程服务器的 `/var/www/jh` 目录下

```bash
sftp> cd /var/www/jh
```

这样我们就可以把本地的静态网页文件上传到服务器，使用 `put` 命令即可，下面的命令表示将本地当前目录下的所有文件以及其子文件夹全部内容都上传到服务器的当前文件夹，也就是 `/var/www/jh`

```bash
sftp> put -r *
```

再输入 `exit` 即可推出 sftp 状态。

这边再教一些 sftp 使用中的常用命令:

ls: 查看远程服务器中当前目录中所有非隐藏文件

lls: 查看本地当前路径中的所有非隐藏文件

pwd: 查看远程服务器中当前的路径

lpwd: 查看本地当前的路径

#### 使用 rsync 部署

> rsync 的交互性就不太强，是在本机操作的，需要提前写好一行比较长的命令去执行操作，比较适合写在脚本里。

下面这行代码是我们精弘网络首页使用 github action 部署时的命令

```bash
rsync -avzP --delete dist/ root@<your_server_ip>:/var/www/jh/
```

dist/ 表示我想要上传当前路径下的 dist 文件夹下的所有文件

root@<your_server_ip> 这一段和前面的 ssh 与 sftp 一样，都表示用户名和对应的服务器 ip，

`:var/www/jh` 表示文件将被上传到服务器的这个路径下。

以下是 rsync 的一些常用参数：

- `-a`：以归档模式进行同步，即保持文件的所有属性（如权限、属主、属组、时间戳等）。

- `-v`：显示详细的同步过程。

- `-z`：使用压缩算法进行数据传输，以减少网络带宽的占用。

- `--delete`：在目标目录中删除源目录中不存在的文件。

- `-P`选项是`rsync`命令的一个常用选项，它的作用是将`--partial`和`--progress`选项组合在一起使用。

  - `--partial`选项表示如果文件传输被中断，`rsync`会保留已经传输的部分文件，下次继续传输时可以从上次中断的地方继续。
  - `--progress`选项表示显示文件传输的进度信息，包括已经传输的字节数、传输速度和估计剩余时间等。

  使用`-P`选项可以方便地同时启用这两个选项，以便在文件传输期间显示进度信息，并在中断后继续传输。

## 附 : 其他相关的一些操作技巧（还没写完，等我填坑）

### 使用 ssh-copy-id 将本地的 ssh 公钥复制到服务器上



### 配置 sshd 以加强服务器的安全性

sshd 是 Secure Shell Daemon 的缩写，它是一个 ssh 的守护进程，允许用户通过 SSH 协议安全地连接到远程服务器。

sshd 的配置文件应该在 `/etc/ssh/sshd_config` 文件中，通过更改其中一些配置项，我们可以让我们的服务器更安全。

| 建议                        | 修改方式                                                     |
| --------------------------- | ------------------------------------------------------------ |
| 禁用 root 用户通过 SSH 登录 | 在 sshd配置文件中将 `PermitRootLogin` 选项设置为 `no`。（在此之前，你应该创建一个非 root 用户并设置好对应的账号密码，修改好 /etc/sudoers 文件确保该用户能够通过 sudo 执行一些需要 root 权限去执行的语句） |
| 强制使用 SSH 密钥登录       | 在 sshd 配置文件中将 `PasswordAuthentication` 选项设置为 `no`。（在此之前，你应该完成上一步 ssh-copy-id 将本地的 ssh 公钥复制到服务器上） |
| 更改 SSH 端口               | 在 sshd 配置文件中将 `Port` 选项设置为一个未使用的端口。（在此之前，使用 ssh 命令连接到服务器时，需要使用 -p \<port> 参数去指定端口） |
| 启用 SSH 日志记录           | 在 sshd 配置文件中将 `SyslogFacility` 选项设置为 `auth`。    |

### systemd 的作用与使用方法

systemd 是一个用于管理 Linux 系统的服务管理器和初始化系统。

#### 使用 systemctl 命令管理服务状态

在我们静态网页部署这一块，我们主要用 `systemctl` 命令去管理一些服务的状态，比如我们想要将 caddy 设置为开机自启，这样我们即使重启了服务器，caddy 也能自动开始提供服务。

以下是一些常见的 `systemctl` 命令：

- `systemctl start`：启动服务。
- `systemctl stop`：停止服务。
- `systemctl restart`：重新启动服务。
- `systemctl status`：查看服务的状态。
- `systemctl enable`：使服务在启动时自动启动。
- `systemctl disable`：使服务在启动时不自动启动。

#### 使用 journalctl 命令来查看日志消息

在服务出现问题的时候，我们可以通过 `systemctl` 命令去查看服务在运行过程中留下的日志消息，方便我们去排错。

以下是一些常见的 `journalctl` 命令：

- `journalctl -b`: 显示当前系统日志。
- `journalctl -b -1`: 显示最近一条系统日志。
- `journalctl -b -10`: 显示最近 10 条系统日志。
- `journalctl -u <unit>`: 显示指定单元的日志。
- `journalctl -u <unit> -b`: 显示指定单元的最近系统日志。
- `journalctl -u <unit> -b -1`: 显示指定单元的最近一条系统日志。
- `journalctl -u <unit> -b -10`: 显示指定单元的最近 10 条系统日志。

还可以使用 `journalctl` 命令来导出日志消息到文件。例如，以下命令将当前系统日志导出到 `/home/user/journal.log` 文件：

```
journalctl > /home/user/journal.log
```

### 防火墙的配置

关于防火墙，iptables 是 Linux 系统中最早使用的防火墙工具，它基于内核模块来过滤网络数据包。nftables 是 iptables 的继任者，与 iptables 相比，nftables 更简单易用，同时性能也更好。

但我这边想要推荐的是 ufw，他是 iptables 的一个前端，它提供一个更简单、更易于使用的命令行界面。UFW 基于 iptables 来实现其功能，但它不被用来直接使用 iptables 命令。UFW 使用自己的命令来配置防火墙，这些命令被转换为 iptables 命令并执行。

查看 ufw 状态

```bash
sudo ufw status
```

禁用所有端口

```bash
sudo ufw deny all
```

开放 22 端口(ssh 的默认端口，禁用可能导致服务器失联)

```bash
sudo ufw allow 22
```

开放 80 端口

```bash
sudo ufw allow 80
```

开放 443 端口

```bash
sudo ufw allow 443
```

启用 ufw

```bash
sudo ufw enable
```

### 包管理器是什么

### Linux 常用命令

### 常用的一些debug手段

