---
title: 把老版的火狐顶栏UI带回来
top: false
tags:
- Firefox
- Linux
- Bwrap
date: 2021-10-01 19:20:23
---

![这是最新版火狐的顶栏](https://res.cloudinary.com/zhullyb/image/upload/v1/2021/10/25/fb2a8804816768010edddcb65fe412b6.png)

![这是去掉标题栏后的样子](https://res.cloudinary.com/zhullyb/image/upload/v1/2021/10/25/68a309b50a04b933b48b4074fdc874fe.png)

> 在Firefox更新UI以后，我就一直感觉不太适应。顶栏的一个个标签页占用的体积达到了原来的1.5~2倍。Thanks to [black7375/Firefox-UI-Fix](https://github.com/black7375/Firefox-UI-Fix) ，我们得以把以前的顶栏找回来。

### 加载新的css

clone该github项目并进入对应路径后，执行`install.sh`

```bash
git clone https://github.com/black7375/Firefox-UI-Fix.git
cd Firefox-UI-Fix.git
./install.sh
```

在接下来的对话中，我们选择`Photon-Style`，这是最接近老版UI的。

紧接着脚本会要求我们选择我们的Firefox数据文件夹，我们可以打开Firefox，在浏览器地址栏输入`about:support`查看到我们所使用的数据文件夹路径。

![about:support](https://res.cloudinary.com/zhullyb/image/upload/v1/2021/10/25/c0e8859b2e9e21bf16f11c869bcd9e2e.png)

使用空格键选择我们的数据文件夹后，在终端上该路径开头处的`[ ]`中会被打上`X`，确认无误后，敲回车。

![终端显示](https://res.cloudinary.com/zhullyb/image/upload/v1/2021/10/25/e700989b63a40e7a6544c018a7167f89.png)

重启浏览器，顶栏就长成了这样。

![Fix后的顶栏效果](https://res.cloudinary.com/zhullyb/image/upload/v1/2021/10/25/5b13e61bf84607e24f67641b747c108a.png)

### 添加主题

为了进一步模仿Firefox经典的配色，我们可以安装上[这个主题](https://addons.mozilla.org/zh-CN/firefox/addon/photon-colors/)，变成这样

![应用主题后的样子](https://res.cloudinary.com/zhullyb/image/upload/v1/2021/10/25/0583761141cbb938171300143b5e81a1.png)

### 禁用暗色模式

如果你的系统主题使用的是深色，导致了诸如[TUNA镜像站](https://mirrors.tuna.tsinghua.edu.cn)自动为你启用了暗色模式，而你想禁用的话，[之前通过修改`about:config`方案](/2021/04/23/disable-firefox-nightmode-when-your-system-is-using-that/)依然适用。

![修改前](https://res.cloudinary.com/zhullyb/image/upload/v1/2021/10/25/e15e13bfbde9c98e7842a292a7e18914.png)

![修改后](https://res.cloudinary.com/zhullyb/image/upload/v1/2021/10/25/db8cc3f36c62fb78096b87e6caea6ff6.png)
