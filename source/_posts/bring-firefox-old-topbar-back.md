---
title: 把老版的火狐顶栏UI带回来
top: false
tags:
- Firefox
- Linux
- Bwrap
date: 2021-10-01 19:20:23
---

![这是最新版火狐的顶栏](https://npm.elemecdn.com/superbadguy-bed@0.0.4/24.png)

![这是去掉标题栏后的样子](https://npm.elemecdn.com/superbadguy-bed@0.0.4/25.png)

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

![about:support](https://npm.elemecdn.com/superbadguy-bed@0.0.4/26.png)

使用空格键选择我们的数据文件夹后，在终端上该路径开头处的`[ ]`中会被打上`X`，确认无误后，敲回车。

![终端显示](https://npm.elemecdn.com/superbadguy-bed@0.0.4/27.png)

重启浏览器，顶栏就长成了这样。

![Fix后的顶栏效果](https://npm.elemecdn.com/superbadguy-bed@0.0.4/28.png)

### 添加主题

为了进一步模仿Firefox经典的配色，我们可以安装上[这个主题](https://addons.mozilla.org/zh-CN/firefox/addon/photon-colors/)，变成这样

![应用主题后的样子](https://npm.elemecdn.com/superbadguy-bed@0.0.4/29.png)

### 禁用暗色模式

如果你的系统主题使用的是深色，导致了诸如[TUNA镜像站](https://mirrors.tuna.tsinghua.edu.cn)自动为你启用了暗色模式，而你想禁用的话，[之前通过修改`about:config`方案](/2021/04/23/disable-firefox-nightmode-when-your-system-is-using-that/)依然适用。

![修改前](https://npm.elemecdn.com/superbadguy-bed@0.0.4/30.png)

![修改后](https://npm.elemecdn.com/superbadguy-bed@0.0.4/31.png)
