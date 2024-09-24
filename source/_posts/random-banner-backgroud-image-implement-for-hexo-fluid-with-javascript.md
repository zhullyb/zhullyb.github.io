---
title: 基于 JavaScript 的 Hexo Fluid 主题 banner 随机背景图实现
date: 2024-09-25 00:00:42
sticky:
execrpt:
tags:
- JavaScript
- Hexo
---

## 为什么要换掉随机图片 API

因为 API 太慢了。根据 [PageSpeed](https://pagespeed.web.dev/) 的测速，使用 API 的图片加载时间来到了整整 2.5s，这似乎有些不可忍受。

![PageSpeed 测速](https://cdn.zhullyb.top/uploads/2024/09/25/3ef1a17bca955.webp)

### Vercel 冷启动问题

当初年少无知，为了实现 banner 随机背景图，选择了[使用 vercel 创建随机图片 API](/2021/05/21/create-a-random-picture-api-with-vercel/)。这带来了一些问题，首先 vercel 在站点一段时间没人访问以后会进入一种类似休眠的模式，下一次启动将会经历一个冷启动（cold start）的过程。我认为这对于一个图片背景的随机 API 而言是不可忍受的。

![冷启动](https://cdn.zhullyb.top/uploads/2024/09/24/f8cb9fd7a963e.webp)

观察图上就可以发现，第一次访问时花费了 1.9 秒，第二次只需要 0.5 秒，这是因为第一次是冷启动，需要花费更多时间。

### 多一次网络请求

抛开冷启动不谈，引入 API 就会导致一次额外的网络请求。访客的浏览器将会先请求随机图片 API，然后根据 API 返回的 302 相应去请求真正的图片，而且这一过程是没法并行的，只能串行执行，这会浪费更多的等待时间。

### Vercel 在大陆境内的访问质量

Vercel 在大陆境内的访问质量其实并不算好，即使是使用了所谓的优选节点，也不一定能保证整个大陆境内大部分访客都有不错的访问质量，因此使用 Vercel 搭建 API 的行为并不是最优解。

## 转向 JavaScript 实现

这个方案本身没多少复杂的，只不过是三年前的我对前端一无所知不敢操刀罢了。

### 删除原有的背景图

在 `_config.fluid.yml` 中，将所有的 `banner_img:` 字段全部置空，防止其加载默认的 `/img/default.png` 而白白浪费用户的流量。这个字段一共在配置文件中出现了九次。

![字段置空](https://cdn.zhullyb.top/uploads/2024/09/25/70bd0b27f5aad.webp)

### 添加 js

我们的目标是修改 id 为 banner 的 div 块的 backgroud 的 css 属性，Hexo Fluid 默认的生成内容是这样的

```html
<div id="banner" class="banner" parallax=true style="background: url('/img/default.png') no-repeat center center; background-size: cover;">
```

我们可以通过 id 来定位这个元素，修改其 style.background 属性。

可以在任何地方引入下面的 js 代码，在这篇名为[《Fluid -23- 添加 Umami 统计》](https://www.zywvvd.com/notes/hexo/theme/fluid/fluid-add-umami/fluid-add-umami/) 的文章里的方案是可供参考的。

```javascript
const imgs = [
    "https://example.com/1.jpg",
    "https://example.com/2.jpg",
    "https://example.com/3.jpg",
    "https://example.com/4.jpg",
    "https://example.com/5.jpg",
    "https://example.com/6.jpg",
    "https://example.com/7.jpg",
    "https://example.com/8.jpg",
    "https://example.com/9.jpg",
    "https://example.com/10.jpg",
    "https://example.com/11.jpg",
    "https://example.com/12.jpg",
    "https://example.com/13.jpg",
    "https://example.com/14.jpg",
    "https://example.com/15.jpg",
    "https://example.com/16.jpg",
    "https://example.com/17.jpg",
    "https://example.com/18.jpg",
    "https://example.com/19.jpg",
    "https://example.com/20.jpg",
]

const luck_img = imgs[Math.floor(Math.random() * imgs.length)]
const banner = document.getElementById('banner')
banner.style.background = `url(${luck_img}) center center / cover no-repeat`
```

## 成果

博客能够在不引入外部 api 的情况下通过 js 自主实现随机的 banner 背景图，~~但 pagespeed 的测速结果并没有明显好转~~，因为 pagespeed 模拟了低速 4G 的访问速度，无论如何都无法提升大文件的加载速度。不过避免了多一次网络请求后，打开页面时的加载速度确实有提升。

## 参见

- [How can I improve function cold start performance on Vercel?](https://vercel.com/guides/how-can-i-improve-serverless-function-lambda-cold-start-performance-on-vercel)
