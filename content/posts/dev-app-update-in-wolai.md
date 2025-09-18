---
title: wolai再打包遇到的问题--electron应用的dev判断机制
date: 2021-12-03 22:53:25
description: 本文详细介绍了在Arch Linux上重新打包wolai（一款基于Electron的笔记应用）时遇到的一个典型问题：当使用系统自带的Electron替换内置版本后，应用启动时出现“无法找到dev-app-update.yml”的警告弹窗。文章深入分析了问题根源——electron-updater模块在开发模式下错误读取更新配置文件，并提供了具体解决方案：通过解压app.asar文件，手动创建并添加dev-app-update.yml文件，再重新打包。整个过程涵盖了问题排查、技术原理分析以及实际操作步骤，适合对Electron应用打包、AUR维护或Linux软件打包感兴趣的开发者阅读。
sticky:
tags:
- Archlinux
- electron
---

之前对于electron懵懵懂懂的时候就把 [wolai](https://www.wolai.com/) 给打包上了 AUR ，那会儿年少无知，也不懂得把内置的 electron 拆开来换成系统内置的以节省空间。前一阵子给CN源打完 Motrix 以后突然想起来自己在 AUR 上还有维护一个叫 wolai 的electron 应用，于是打算把软件内置的 electron 拆出来。尝试使用 `electron /path/to/app.asar` 命令启动的时候发现了以下的问题。

![报错了](https://static.031130.xyz/uploads/2024/08/12/62f3caf822bec.webp)

虽然这个报错无关紧要，直接右上角叉掉也不影响软件正常使用，但是就这样推上 AUR 似乎有些不太妥当。于是使用搜索引擎查找答案。

发现是使用系统自带的 electron 启动时，app.asar 内置的一个叫 `electron-updater` 的模块在自动检测更新时会误认为我们此时处于开发模式，于是会尝试读取 app.asar 内部的 dev-app-update.yml 以查询更新。[^1]

但问题在于这个 app.asar 并不是 wolai 开发者在开发时使用 development 模式打出来的包，应该是 production ，所以内置的那个文件名叫 app-update.yml ，少了个dev 前缀，就很尴尬。

以下内容来自一篇简书的文章[^2]

> 所以调试的时候可以建一个default-app.yml文件放在D:\hzhh123\workspace\vue-work\electron-demo1\node_modules\electron\dist\resources\default_app.asar 下，这里就涉及到asar解压缩，但是这样会很麻烦，打包后也需要这样替换，麻烦，所幸electron-updater中提供了这个文件的属性配置updateConfigPath，可以通过设置这个属性来解决这个问题

很遗憾，我们并不是该应用的开发者，并不能指定`electron-uploader`构建时的参数，所以只能考虑解压缩 app.asar 手动放入 dev-app-update.yml 的方案。

根据又一篇简书的文章[^3]，我们了解到 npm 中有一个叫 asar 的程序可以帮助我们解压缩 app.asar。我这里直接将内容搬过来

> 解压
>
> ```undefined
> asar extract 压缩文件  解压文件夹
> ```
>
> 压缩：如果压缩文件存在，则会被替换
>
> ```undefined
> asar pack 文件夹  压缩文件名
> ```

原文是让我们直接使用 npm 下载安装 asar 程序，然而这就会让打包过程变得很复杂，所幸 Archlinux 官方源中已经将这个程序打完了，我们可以直接将 asar 写入 makedepends。

大概就写成了这个样子。

```bash
asar extract ${srcdir}/squashfs-root/resources/app.asar ${srcdir}/new_app
mv  ${srcdir}/squashfs-root/resources/app-update.yml ${srcdir}/new_app/dev-app-update.yml
asar pack ${srcdir}/new_app ${srcdir}/squashfs-root/resources/app.asar
```

程序正常启动，没有弹出之前的对话框了。

![成功啦](https://static.031130.xyz/uploads/2024/08/12/62f3cafb6b04d.webp)

参考: 

[^1]: https://github.com/electron-userland/electron-builder/issues/1505
[^2]: https://www.jianshu.com/p/15bde714e198
[^3]: https://www.jianshu.com/p/17d97e6bf174

