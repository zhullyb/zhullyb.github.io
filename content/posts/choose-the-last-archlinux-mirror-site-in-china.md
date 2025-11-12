---
title: 选择最新的Archlinux镜像源
date: 2021-05-29
tags:
- Archlinux
---



### 找到最新的Archlinux镜像源

我是testing+kde-unstable用户，平均每天更新4次，对于我而言，选择最新的Archlinux镜像是非常重要的。

Archlinux的主源并不开放给个人用户使用，仅开放给[一级镜像站](https://archlinux.org/mirrors/tier/1/)进行同步，因此我们需要手动寻找国内较新的镜像站。（理论上来说一级镜像站应该比二级镜像站更新，但是有些一级镜像站的同步频率并不高，同步延迟可能会比某些二级镜像站还要高）

一个archlinux的镜像目录大概是长下面这个样子

```
archlinux/
├── community
├── community-staging
├── community-testing
├── core
├── extra
├── gnome-unstable
├── images
├── iso
├── kde-unstable
├── lastsync
├── lastupdate
├── multilib
├── multilib-staging
├── multilib-testing
├── pool
├── staging
└── testing
```

其中的`lastsync`和`lastupdate`用unix时间戳记录着上一次同步时间和镜像的上一次变更时间。

因此，我们只需要对比各个镜像站的`lastsync`谁比较新就行了，我写了如下的辣鸡脚本

```bash
#!/bin/bash

tuna=$(curl -s https://mirrors.tuna.tsinghua.edu.cn/archlinux/lastsync)
bfsu=$(curl -s https://mirrors.bfsu.edu.cn/archlinux/lastsync)
sjtug=$(curl -s https://mirror.sjtu.edu.cn/archlinux/lastsync)
aliyun=$(curl -s https://mirrors.aliyun.com/archlinux/lastsync)
ustc=$(curl -s https://mirrors.ustc.edu.cn/archlinux/lastsync)
zju=$(curl -s https://mirrors.zju.edu.cn/archlinux/lastsync)
cqu=$(curl -s https://mirrors.cqu.edu.cn/archlinux/lastsync)
lzu=$(curl -s https://mirror.lzu.edu.cn/archlinux/lastsync)
neusoft=$(curl -s https://mirrors.neusoft.edu.cn/archlinux/lastsync)
dgut=$(curl -s https://mirrors.dgut.edu.cn/archlinux/lastsync)
netease=$(curl -s https://mirrors.163.com/archlinux/lastsync)
tencent=$(curl -s https://mirrors.tencent.com/archlinux/lastsync)
hit=$(curl -s https://mirrors.hit.edu.cn/archlinux/lastsync)
huaweicloud=$(curl -s https://mirrors.huaweicloud.com/archlinux/lastsync)
sohu=$(curl -s https://mirrors.sohu.com/archlinux/lastsync)
opentuna=$(curl -s https://opentuna.cn/archlinux/lastsync)
pku=$(curl -s https://mirrors.pku.edu.cn/archlinux/lastsync)
nju=$(curl -s https://mirrors.nju.edu.cn/archlinux/lastsync)
njupt=$(curl -s https://mirrors.nju.edu.cn/archlinux/lastsync)

echo """
$tuna        #tuna
$bfsu        #bfsu
$sjtug       #sjtug
$aliyun      #aliyun
$ustc        #ustc
$zju         #zju
$cqu         #cqu
$lzu         #lzu
$neusoft     #neusoft
$dgut        #dgut
$netease     #netease
$tencent     #tencent
$hit         #hit
$huaweicloud #huaweicloud
$sohu        #sohu
$opentuna    #opentuna
$pku         #pku
$nju         #nju
$njupt       #njupt
"""  | sort -r
```

其运行结果如下

```
1622248120     #neusoft
1622247879        #dgut
1622247698         #hit
1622246042         #zju
1622246042        #tuna
1622246042        #bfsu
1622242426       #sjtug
1622242426       #njupt
1622242426         #nju
1622240702        #ustc
1622240522         #cqu
1622238783     #netease
1622235120         #lzu
1622232241 #huaweicloud
1622230871     #tencent
1622217845      #aliyun
1622217001         #pku
1622203750        #sohu
1622166379    #opentuna
```

通过不同时刻的多次测试可以看出，国内同步频率最高的是东软（neusoft）的镜像。顺手一查，没错，是个一级镜像站。通过unix时间戳得知，东软的archlinux镜像几乎是每分钟同步一次，恐怖如斯。。。

## 获得更好的下载速度

我们已经得知东软是国内同步频率最高的Archlinux镜像站了，但是我用东软镜像站的下载速度并不太好看。此时，我们就要搬出依云大佬的神器——[pacsync](https://blog.lilydjwg.me/2020/10/29/pacsync.215578.html)

在root用户下使用如下命令装载pacysnc后

```bash
echo '#!/bin/bash -e

unshare -m bash <<'EOF'
mount --make-rprivate /
for f in /etc/pacman.d/*.sync; do
  filename="${f%.*}"
  mount --bind "$f" "$filename"
done
pacman -Sy
EOF' > /usr/bin/pacsync
```

创建`/etc/pacman.d/mirrorlist.sync`指定我们用来同步pacman数据库（比如东软）

`/etc/pacman.d/mirrorlist`中存放其他国内镜像源地址（按照同步速度从上到下）

以后的同步命令为 `sudo pacsync && yay -Su`

觉得命令过长的话设置alias可以是个不错的选择。
