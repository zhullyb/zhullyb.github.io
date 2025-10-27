---
title: 在 Hexo Fluid 主题中使用霞鹜文楷
date: 2023-11-28 00:16:23
sticky:
tags:
- Hexo
- CSS
- Web
---

我的博客换到 fluid 主题已经有两年了，期间一直有为博客更换字体的想法，但之前没有前端开发的相关知识支撑我换字体的需求。不过现在，我已经有了一些 Vue.js 的开发经验，相信能支撑我完成这个目标。

![最终成品](https://static.031130.xyz/uploads/2024/08/12/6564d0f926e58.webp)

我在谷歌搜索到了这篇文章——[《Hexo博客Fluid主题，字体全局更改为霞鹜文楷体》](https://penghh.fun/2023/05/07/2023-5-7-hexo_blog_font/)。

文章中直接修改了 `themes/fluid/layout/_partial/head.ejs` 让文章生成时在 html 的 head 标签中引入 lxgw-wenkai-screen-webfont 的 css 文件，并使用自定义 css 方案。但这种方案我不喜欢，我的 fluid 主题是通过 npm 安装 hexo-theme-fluid 的方式引入的，这意味着我不能直接编辑 `themes/fluid` 下的文件，包括文章中需要编辑的 `head.ejs` 和 `_config.yml` 。

我翻阅了 [lxgw-wenkai-webfont](https://github.com/chawyehsu/lxgw-wenkai-webfont) 的 README，找到了使用 cdn 引入的方式。我们需要在 html 的 head 标签中加上下面这段:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-screen-webfont@1.1.0/style.css" />
```

~~但我注意到我想要的 lxgw-wenkai-screen-webfont 在 [staticfile.org](https://staticfile.org/) 上也有 cdn 提供，且该 cdn 有海外节点，是不错的选择，所以我要通过下面这段引入:~~

staticfile 已经因为供应链投毒被各 adblock 插件屏蔽，已改用 npmmirror

```html
<link rel="stylesheet" href="https://registry.npmmirror.com/lxgw-wenkai-screen-web/latest/files/style.min.css" />
```

但要如何引入呢？

在 hexo 的[官方文档](https://hexo.io/docs/plugins.html)中，我找到了一个方案。可以在博客的 workdir 下创建一个 `scripts` 文件夹，在当中放入需要执行的 js 脚本。

![hexo 文档](https://static.031130.xyz/uploads/2024/08/12/6564cea5c71ca.webp)

在这篇名为[《Fluid -23- 添加 Umami 统计》](https://www.zywvvd.com/notes/hexo/theme/fluid/fluid-add-umami/fluid-add-umami/) 的文章里，我找到了在 hexo 生成静态文件时直接注入的方式。

在 `scripts/font.js` 中写入:

```javascript
hexo.extend.injector.register('head_end',
'<link rel="stylesheet" href="https://registry.npmmirror.com/lxgw-wenkai-screen-web/latest/files/style.min.css" />',
'default');
```

这样一来，字体文件的 css 便被我们成功引入了，我们还需要指定页面使用霞鹜文楷作为默认字体。

在 fluid 主题的配置文件 `_config.fluid.yml` 中，有一个名为 `font-family` 的配置项，直接写上 `font-family: "LXGW Wenkai Screen"` 便可大功告成。
