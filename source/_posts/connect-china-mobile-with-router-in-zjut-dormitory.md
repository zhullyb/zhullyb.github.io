---
title: 在浙工大宿舍使用路由器连接移动网络(校园网)
date: 2023-06-24 14:30:24
sticky:
execrpt:
tags:
- Network
- Router
---

> [上一篇博客](/2023/06/24/redmi-ac2100-router-with-padavan/)中，我为 Redmi AC2100 刷入了 Padavan，接下来就打算使用这台路由器进行联网。其实[小米大多数路由器都是支持 l2tp 的协议的](https://bu.dusays.com/2023/06/24/6496ab42d74bf.jpg)，只需要在路由器后台稍微设置一下就能上网，服务器 ip 填 192.168.1.113，账号密码就是 hxzha+手机尾号后8位，密码就是手机尾号后6位。我使用 Padavan 是我个人有一些别的官方固件所不能提供的功能。

***

**2023.7.10 Updates:**

首先，搬到屏峰校区以后，l2tp 服务器确实依然为 192.168.115.1，这点挺奇怪的。

然后我发现 6.26 我的那个解决方案过于复杂，原先写的认证脚本完全可以胜任这项工作，之前失败的原因是因为我在朝晖抓的脚本参数不适用于屏峰校区，目前已经修复。脚本的变动情况可以看[这里](https://gist.github.com/zhullyb/4c8708df5724c42f913d3d86ed49d929/revisions#diff-c33ee93215d3dddc16517dae8107b3473f7abc77f56ff5afedc1f263e7e22b27)。

***

**2023.6.26 Updates:** 

~~在我于 2023 年 6 月 26 日搬去屏峰校区以后，发生了连不上网的情况。目前一个可行的方案: 在 192.168.210.100 将自己的 MAC 地址全部解绑，然后使用自己的一台设备连接网线接口，正常通过网页验证。随后在 192.168.210.100 查看刚才通过网页验证的设备的 MAC 地址，将这一串 MAC 地址复制到 Padavan 的「外部网络（WAN）- MAC 地址」中，且将 l2tp 服务器改为 192.168.115.1 （没错，填朝晖的可以用）并重新连接 l2tp。~~

![MAC 地址设置](https://bu.dusays.com/2023/06/26/649987173e542.png)

***

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

顶部 TODO 处要写的账号密码就是那个有图书馆背景的网页认证密码。

![](https://bu.dusays.com/2023/09/17/6506a036d0f55.png)

```bash
#!/bin/bash

# Login webpage identify for China Mobile in Zhejiang University of Technology automatically
# Author: zhullyb
# Email: zhullyb@outlook.com


# TODO: Fill Your Account and Password for 192.168.210.112/192.168.210.111 here
user_account=
user_password=

if `ip route | grep -q 10.129.0.1`; then
  gateway=10.129.0.1
elif `ip route | grep -q 10.136.0.1`; then
  gateway=10.136.0.1
fi

if whoami | grep -q "admin\|root" && [ -n "$gateway" ]; then
  route add -net 192.168.210.111 netmask 255.255.255.255 gw ${gateway}
  route add -net 192.168.210.112 netmask 255.255.255.255 gw ${gateway}
  route add -net 192.168.210.100 netmask 255.255.255.255 gw ${gateway}
  route add -net 172.16.0.0 netmask 255.255.0.0 gw ${gateway}
fi


test_curl=$(curl -s http://172.16.19.160)
wlan_user_ip=$(echo ${test_curl} | grep -oE 'wlanuserip=[0-9\.]+' | grep -oE '[0-9\.]+')

if echo "${test_curl}" | grep -q "192.168.210.112"; then \
curl "http://192.168.210.112:801/eportal/?c=ACSetting&a=Login&protocol=http:&hostname=192.168.210.112&iTermType=1&mac=000000000000&ip=${wlan_user_ip}&enAdvert=0&loginMethod=1" \
  -X POST \
  -d "DDDDD=,0,${user_account}@cmcczhyx" \
  -d "upass=${user_password}" \
  -d 'R1=0' \
  -d 'R2=0' \
  -d 'R6=0' \
  -d 'para=00' \
  -d '0MKKey=123456' \
  -d 'buttonClicked=' \
  -d 'redirect_url=' \
  -d 'err_flag=' \
  -d 'username=' \
  -d 'password=' \
  -d 'user=' \
  -d 'cmd=' \
  -d 'Login='
elif echo "${test_curl}" | grep -q "192.168.210.111"; then \
curl "http://192.168.210.111:801/eportal/?c=ACSetting&a=Login&protocol=http:&hostname=192.168.210.111&iTermType=1&mac=000000000000&ip=${wlan_user_ip}&enAdvert=0&loginMethod=1" \
  -X POST \
  -d "DDDDD=,0,${user_account}@cmccpfyx" \
  -d "upass=${user_password}" \
  -d 'R1=0' \
  -d 'R2=0' \
  -d 'R6=0' \
  -d 'para=00' \
  -d '0MKKey=123456' \
  -d 'buttonClicked=' \
  -d 'redirect_url=' \
  -d 'err_flag=' \
  -d 'username=' \
  -d 'password=' \
  -d 'user=' \
  -d 'cmd=' \
  -d 'Login='
fi
```

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
