---
title: 将博客从 waline v2 更新到 waline v3
date: 2024-11-15 23:49:43
description: 本文详细记录了将 Hexo 博客的评论系统 Waline 从 V2 升级到 V3 版本过程中遇到的两个主要问题及解决方案。首先，针对 Waline 无法加载的问题，通过自定义 CDN 路径巧妙绕过主题源码修改，实现无缝升级。其次，处理升级后评论中重复显示“@”符号的问题，通过 Python 脚本批量清理 LeanCloud 数据库中的历史评论数据，使用正则表达式匹配并移除多余的标记。文章为使用 Waline 和 Hexo 的开发者提供了实用的升级指南和故障排除方法，适合遇到类似问题的用户参考。
sticky:
tags:
- Python
- waline
- Hexo
---

> waline 更新到 V3 版本已经是九个月前的事情了，眼瞅着 hexo fluid 主题并没有带我更新的意思，我就打算自己更新到最新版，结果遇到了两个坑，写文供大家参考。

在 Hexo 目录下的 `_config.fluid.yml` 文件中找到 waline 的 cdn，将版本号指向最新版。

```diff
-  waline: https://registry.npmmirror.com/@waline/client/2.15.8/files/dist/
+  waline: https://registry.npmmirror.com/@waline/client/^3/files/dist/
```

## 插曲一——waline 不加载

再次部署博客，我遇到了第一个坑：waline 没有在页面上正常加载。

打开控制台一看，报错给得很明白：`Waline is not defined`

![](https://static.031130.xyz/uploads/2024/11/16/663e910db29b7.webp)

根据 [issue#2483](https://github.com/walinejs/waline/issues/2483)，

> https://unpkg.com/@waline/client@3.1.3/dist/waline.umd.js 用这个地址
>
> 本质是 ...... 没有使用 ES Module 的加载方式 `<script type="module">`，所以需要使用 UMD 的模块

那么按照正常的脑回路，我们应该修改主题中的引入 waline 部分的 js 文件，把针对 waline.js 的引用改成 waline.umd.js，具体的修改处[在这里](https://github.com/fluid-dev/hexo-theme-fluid/blob/94049b2e6da5ae865f5cf7088f0c53917a6dc8bc/layout/_partials/comments/waline.ejs#L5-L6)

但是，我是使用 npm 安装的主题，方便在主题更新时直接同步上游的更改，如果使用这种修改源文件引用的方式将会导致我不得不放弃原有的主题安装方式，改用下载主题源码的方式。

那么有没有办法，既能够成功加载带 umd 的 js，又不用改动主题源码呢？还真有，我自己部署 cdn 就好了。从 npmjs 下载带 umd 的 waline.umd.js，重命名成 waline.js，和 waline.css 一起放在同一路径下，在把自己的 cdn 链接前缀填入 `_config.fluid.yml` 中，就可以实现移花接木——表面上访问的是 waline.js，实际上内容是 waline.umd.js 。

## 插曲二——重复显示的 @

更新到 v3 版本以后，我发现所有的评论都出现了重复两遍的 @

![](https://static.031130.xyz/uploads/2024/11/16/f6fbaa99a784e.webp)

我去群里提问，管理员 [li zheming](https://imnerd.org/) 给出了这样的答复:

> 这个是 feature 了，早版本 @ 是渲染在评论内容里的，这块后来重构了下，@ 是 Waline 自己渲染了。不过历史数据我们并没有处理，所以会出现这种情况。如果比较介意的话可以手动去数据库里删除下。

那么很显然，我很介意这点，我需要删除数据库中的 @ 信息。

打开 waline 的后台管理站点，我发现我有整整 30 页的评论——很显然我是 waline 的牢用户了，我不太可能一个一个手动去掉评论中的 @

![](https://static.031130.xyz/uploads/2024/11/16/c4487502542e5.webp)

我的 waline 数据库是 leancloud，对方的 webui 没办法帮助我批量去除 html 或者 markdown 形式的内容（就算对方支持 sql 语句，处理这个问题都够呛），我需要一个脚本来直接处理数据库中的信息。

首先，我们需要导出数据库数据，自然是登陆 leancloud，然后找到 数据存储 - 导入导出 - 数据导出，选择 Comment 单个 Class，单击导出按钮。

![](https://static.031130.xyz/uploads/2024/11/16/d2cd564739120.webp)

err，我寻思凌晨 1 点应该是 16 点前吧，怎么导出不了，而我昨晚 23 点反而可以导出，leancloud 到底是哪门子时区。所以我直接拿了 23 点时导出的数据进行处理。

leancloud 导出的数据是 jsonl 格式的，我们对需要去除的 @ 信息进行归纳总结，发现一共有两种 @ 的渲染方式

- `<a class="at" href="#id">@username</a>`  的 html 风格（有时 class 和 href 顺序还会反过来）
- `[@username](#id)` 的 markdown 风格

而 html 风格还有两种结尾方式，

一种是如 `<a class="at" href="#id">@username</a> , ` 这样以 空格 + 半角逗号 + 空格 结尾的形式，

令一种是如 `<a class="at" href="#id">@username</a>: ` 这样以 半角冒号 + 空格结尾的形式。

markdown 风格的结尾方式我就只看到一种，如 `[@username](#id): `这样以 半角冒号 + 空格结尾的形式。

因此，我们需要对三种形式分别编写正则表达式进行匹配并删除，参考代码如下

```python
import re

with open('Comment.0.jsonl', 'r') as f:
    s = f.read()

patterns = [
    r'<a class=\\"at\\" href=\\"#(?:.*?)\\">@(?:.*?)</a>: ',
    r'<a class=\\"at\\" href=\\"#(?:.*?)\\">@(?:.*?)</a> , ',
    r'\[@(?:.*?)\]\(#(?:.*?)\):'
]

for pattern in patterns:
    s = re.sub(pattern, "", s)

with open('Comment.1.jsonl', 'w') as f:
    f.write(s)
```

随后删除 Comment 表中所有数据，把生成的 `Comment.1.jsonl` 导入 leancloud，就算是大功告成了。

![](https://static.031130.xyz/uploads/2024/11/16/d248ae2eac74c.webp)

![](https://static.031130.xyz/uploads/2024/11/16/c3875dcde1d97.webp)
