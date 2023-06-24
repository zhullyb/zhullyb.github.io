---
title: 在浙工大宿舍使用路由器连接移动网络
date: 2023-06-24 14:30:24
sticky:
execrpt:
tags:
- Network
- Router
---

> [上一篇博客](/2023/06/24/redmi-ac2100-router-with-padavan/)中，我为 Redmi AC2100 刷入了 Padavan，接下来就打算使用这台路由器进行联网。其实[小米大多数路由器都是支持 l2tp 的协议的](https://bu.dusays.com/2023/06/24/6496ab42d74bf.jpg)，只需要在路由器后台稍微设置一下就能上网，服务器 ip 填 192.168.1.113，账号密码就是 hxzha+手机尾号后8位，密码就是手机尾号后6位。我使用 Padavan 是我个人有一些别的官方固件所不能提供的功能。

![这是我们上一篇博客的成果](https://bu.dusays.com/2023/06/24/6496ac4f3170f.png)

## l2tp 相关设置

我们将 WAN 口插上墙壁一侧的网口，左侧菜单栏点击外部网络，将外网连接类型改为 l2tp

![外网连接类型](https://bu.dusays.com/2023/06/24/6496acaf4435b.png)

DNS 建议前两个填写学校的内网 DNS 地址( 172.16.7.10 ， 172.16.7.30)，最后一个填一个稳定的公共 DNS 即可，由于这一步是可选项，所以就不提供截图了。

往下拉，设置 l2tp 相关的设置项，只需要设置红色框框内的设置项即可。朝晖的 l2tp 服务器 ip 是 192.168.115.1 ， 屏峰校区是 192.168.113.1 ，这里不要填错了。

![Screenshot_20230623_213510.png](https://bu.dusays.com/2023/06/24/6496ae85a4d4f.png)

## 网页认证脚本

> 做完这些步骤，其实就可以正常上网了，只不过每次断网以后可能都需要重新过一遍验证，所以我专门写了一个脚本去过这个验证。

这份脚本我已经开源到 [github gist](https://gist.github.com/zhullyb/4c8708df5724c42f913d3d86ed49d929) 了，在顶部填好自己网页认证时的账号密码以后就可以用了。

<script src="https://gist.github.com/zhullyb/4c8708df5724c42f913d3d86ed49d929.js"></script>

在 Padavan 的设置界面中，我们去打开 ssh 服务

![打开 ssh 服务](https://bu.dusays.com/2023/06/24/6496afd695464.png)

在自己的电脑上通过 ssh 连接到路由器的终端 `ssh admin@192.168.123.1`，默认密码也是 admin，就和进入 Padavan 后台的默认管理密码一样。

![进入路由器终端](https://bu.dusays.com/2023/06/24/6496b029dfe3f.png)

看了一下 Padavan 并没有自带 nano 这个方便的 tui 编辑器，只好用自带的 vi 将就一下将认证代码复制到路由器中。

```bash
vi /etc/storage/login_edu.sh
```

关于 vi 的使用方法我在这里也不展开讲，我个人也不熟悉这款编辑器。

将脚本复制进去后，记得输入自己网页认证的账号密码，然后保存离开，给这个脚本赋予 x 权限。

```bash
chmod a+x /etc/storage/login_edu.sh
```

![保存认证脚本](https://bu.dusays.com/2023/06/24/6496b11b7c541.png)

随后运行 `crontab -e` ，设置运行脚本为每天早上 6 点 01 分执行一次（因为工作日凌晨 00:30 断网，早上网络恢复以后有可能会要求你通过网页认证后才能再次联网）

`1 6 * * * /etc/storage/login_edu.sh`

![设置 crontab](https://bu.dusays.com/2023/06/24/6496b1132f497.png)

随后来到路由器的设置界面，设置「在 WAN 上行/下行启动后执行」和「在防火墙规则启动后执行」这两个地方分别调用我们的网页认证脚本，防止因停电、网线接口松动等故障恢复后依然没法联网的问题。图中的 logger 命令是给我自己排错看的，不需要设置。

![脚本设置界面](https://bu.dusays.com/2023/06/24/6496b36585000.png)

![WAN上下行](https://bu.dusays.com/2023/06/24/6496b369bbd70.png)

![防火墙规则](https://bu.dusays.com/2023/06/24/6496b3703197f.png)
