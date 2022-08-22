---
title: 抛弃PicGo，直接使用curl将图片上传到LskyPro
date: 2022-03-31 19:19:14
sticky:
tags:
-	Shell Script
- 图床
- Lsky Pro
---

前一阵子为了图床折腾了好长一段时间。刚开始用的是 cloudinary，虽然每月有限制，但强在境内访问速度还不错，可惜后来 `res.cloudinary.com` 这个域名在某些地方被 DNS 污染了，而自定义域名是付费版的功能，就不得不放弃了。

后来也尝试过 npm图床 的方案，可惜面对这种滥用公共资源的行为我无法接受~~（肯定不是因为受不了那繁琐的上传步骤，随便传张图都得 bump 下版本号的原因）~~，而且现在境内的能作为图床使用的 npm 镜像似乎也就只剩下 `npm.elemecdn.com` 这一个能够正常回源了，没准哪天就用不了了，所以就去投奔了[杜老师](https://dusays.com/)的[去不图床](https://7bu.top/)。

去不图床采用开源图床程序 [Lsky Pro](https://www.lsky.pro/) 搭建，没有免费服务，且配置了鉴黄服务，看起来就是打算长久做下去的图床站点。境内使用腾讯云cdn，境外采用 cloudflare cdn，速度都挺让我满意的。~~（杜老师看见请给我打钱，或者多送我点空间也行~~（x

Typora 一直是我写博客的主用 Markdown 编辑器，之前我采用 Typora 调用 [PicUploader(php)](https://github.com/xiebruce/PicUploader) 自动上传图片的方案写博客，体验相当不错，如图: 

![](https://bu.dusays.com/2022/08/10/62f3b881e3c4c.gif)

可惜 PicUploader 目前仍然没有支持 LskyPro 的上传，我采用的是现在烂大街的 Typora+PicGo+LskyPro插件 的方案去实现 Typora 的自动上传图片功能。

这个方案有明显的弊端：

- PicGo 运行依赖于 electron，极大地消耗了系统资源。
- PicGo 面对多张图片( >=4张 )同时上传时容易报错。
- PicGo 对于 Linux 的支持比较有限，作者可能不熟悉 Linux，直到半个月前我去交了一个 pr 才支持 wayland 下使用 wl-clipboard 将图片链接复制到粘贴版。

正好 LskyPro 有详细的文档，应该可以用 curl 手糊一段 Shell 脚本实现直接上传，资源占用小，唯一的弊端是上传完成后的图片不容易管理。脚本如下

```bash
#!/bin/bash

export TOKEN=YOU_TYPE_IT
export UPLOAD_API_URL=https://7bu.top/api/upload

for images in "$@"; do
        curl -s -X POST $UPLOAD_API_URL -F "token=$TOKEN" -F "image=@$images" | jq -r .data.url
done
```

> 2022/04/02更新: 第六行 $@ - "$@"，解决文件名中出现空格时导致的上传失败问题。

需要借助 jq 来读取返回的 json，各 Linux 发行版源内应该都有打包，自行安装即可。

授予x可执行权限后，Typora 内直接填写自定义命令输入脚本所在位置即可实现 Typora 自动上传图片了。
