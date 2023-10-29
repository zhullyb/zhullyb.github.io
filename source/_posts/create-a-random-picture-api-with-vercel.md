---
title: 使用vercel创建一个随机图片api
date: 2021-05-21
tags: 
- Network
---

如果你的网络环境不算太差的话，你在访问我博客的时候应该可以看到顶部有一张背景图。假如你访问我的博客时留心观察，你或许会发现每次你访问我博客时的背景都是不一样的。如果你没玩够，或许你可以尝试[**点击这里**](https://randompic.zhul.in/api/randomtoppic.php)，我总共搜集了20张壁纸供诸位赏玩。

是的，这是使用php实现的随机图片api，托管于vercel，你可以在[**aya的博客**](https://note.aya1.top/#/4-phpapi)上找到我使用的代码。具体配置方式我不再赘述。

然而，我们还需要解决一个问题: php在哪里运行？

如果你拥有自己的服务器，在国内访问速度毫不逊色，那就好办了，直接扔自己服务器上即可。然而，我并没有。我需要找到一个在国内访问速度给力的地方来部署我的api，以确保访客在打开我的博客时可以在第一时间获取到图片的真实链接并开始加载。

起初，我将其部署在我的好朋友(~~你可以猜猜他是谁~~)的国内vps上，访问速度自然不用说。然而，他的服务器**不支持https**，这就导致使用chrome访问的时候chrome不会自动访问我的api，博客顶部一片惨蓝。。。

随后，我使用的是000webhost提供的虚拟主机，国内访问起来也还不错，大概正常运行了半个月左右的时间，然后莫名开始502了。我懂，作为不交钱的白嫖用户应该自觉滚蛋了，这点觉悟咱还是有。

**随后，我找到了目前的方案——vercel**

vercel是被我用来部署静态网页的，但我没想到他也能**支持php**。参考了[vercel-php](https://github.com/juicyfx/vercel-php)项目后，我大致了解了整个仓库结构。

```
project
├── api
│   └── index.php
└── vercel.json
```

php和附带的资源文件(如果有的话)一定要放到api文件夹下才能够正常被vercel识别。

以下附`vercel.json`

```json
{
  "functions": {
    "api/index.php": {
      "runtime": "vercel-php@0.4.0"
    }
  }
}
```
