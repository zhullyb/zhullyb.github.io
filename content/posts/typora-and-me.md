---
title: Typora与我
date: 2021-11-26 23:05:05
description: 在这篇文章中，作者分享了个人对 Typora 这款 Markdown 编辑器的深度使用体验和情感依赖。文章从 Typora 宣布收费的消息出发，探讨了其独特的所见即所得编辑模式如何提供沉浸式的写作环境，让创作者能够专注于内容本身而非格式细节。作者还详细介绍了 Typora 与本地图床工具 PicUploader 的高效配合，以及截图工具 Flameshot 的流畅整合，极大提升了插图与内容创作的连贯性。文末出现反转：作者发现 Linux 和开发版仍可无限期试用，因此决定继续使用 Typora，不再切换其他编辑器。如果你也在寻找一款能极大提升 Markdown 写作效率的工具，这篇文章会给你带来不少共鸣和实用建议。
sticky:
tags: 
- Casual Talk
---

Typora 要收费了，$14.9 买断制，支持三设备激活。而且尚且不知道这里买断的是单个大版本更新还是多个大版本更新。

很多人说，不要紧，我们有VsCode、我们有Vnote、我们有MarkText。。。

但我还是不习惯。

***

Typora真的就是个非常纯粹的Markdown编辑器，他有所见即所得的视觉效果，同时为我提供了沉浸式的写作体验。

当我在使用Typora写文章的时候，我就是个非常单纯的内容创作者，我不需要去考虑各种Markdown的语法格式，我只需要用文字写下我所想的，然后通过右键菜单把文字的样式调整到一个能够合理突出主次的程度，便完成了。若是用的时间长了，记住了打开菜单时旁边现实的快捷键，那速度便更快了。即使有插入图片/视频的需求，我也只需要将图片复制进 Typora 的编辑框，我在Typora预先设置好的自定义上传命令会自动调用我部署在本地的[PicUploader](https://github.com/xiebruce/PicUploader)完成上传，并将媒体文件以 Markdown/html 语法呈现在编辑框中。

这样一来，我的行文思路就是连贯、不受打断的。即使需要从系统中截取一些图片作说明用途，我也可以通过 Flameshot 截取图片并简单画几个箭头、标几个序号或者框几个按钮后复制到剪切板，并最终粘贴到Typora的编辑框中，整个过程就像是我在和别人QQ聊天时截个图发过去一般简单。

![gif缩略图有点小，建议是点开来看](https://static.031130.xyz/uploads/2024/08/12/62f3b881e3c4c.gif)

倘若我使用别的Markdown编辑器，我便需要将图片保存到本地、手动上传到图床、手动写markdown的`![]()`语法，如此一来，我的精力就被分散了，那我也就不会有为文章插入图片的兴趣，抑或是插入完某张图片以后深感心力憔悴，便把写了一半的文章束之高阁，欺骗自己将来有一天我会继续完成这篇文章。

***

~~总而言之，Typora对于我而言确实是非常有用的工具，而我将在接下来的半年到一年时间中过渡到其他的开源Markdown编辑器中。即使改变我的使用习惯将是一件非常痛苦的事情，但我不得不这么做。Typora内置的electron在Archlinux的滚动更新下不知道过多久会出现与系统不兼容的情况[^1]，所以这意味着继续使用老版本的Typora并不是长久之策，我需要在此之前尽快切换到其他的Markdown编辑器。而我不是个商业公司的Markdown工程师，单纯为了个人兴趣而花大价钱去买这一款生产力工具却无法得到经济回馈似乎并不是一个明智的选择。~~

反转了，仔细阅读Typora官网的Q&A后发现了这么一条:

> **Can I use Typora for free ?**
>
> You will have a 15 days free trial before the purchase. If you use  dev version or Linux version, you will have unlimited trial time if you  keep Typora updated. But we may show “trial button” or disable certain  features to encourage you to purchase our app, but basic and most  functions will be kept.

看起来 Dev 版和 Linux版本在最新版本可以无限试用下去，那我不考虑改变我的写作习惯了。

> 注: Dev 版藏得有点深，在[这里](https://typora.io/releases/dev)

[^1]:baidunetdisk-bin内置的electron已经无法在如今的Archlinux上跑起来了，目前唯一的解决方案是拆包、并使用系统级的electron去启动百度网盘，也就是AUR的baidunetdisk-electron。但是typora运用了一些混淆/加密的手段，使得只有他内置的electron才可以正确启动程序。
