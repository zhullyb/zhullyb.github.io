---
title: el-image 和 el-table 怎么就打架了？Stacking Context 是什么？
date: 2025-05-31 00:29:40
sticky:
tags:
- Vue.js
- JavaScript
- CSS
- HTML
---

这是精弘内部的图床开发时遇到的事情，大一的小朋友反馈说 el-image 和 el-table 打架了。这里专门提供一个 [demo](https://static.031130.xyz/demo/el-image-el-table-conflict.html) 来直观展示情况，下面是截图。

![](https://static.031130.xyz/uploads/2025/05/31/c6674f6f13955.webp)

看到后面的表格透出 el-image 的预览层，我的第一反应是叫小朋友去检查 z-index 是否正确，el-image 的 mask 遮罩的 z-index 是否大于表格。

![](https://static.031130.xyz/uploads/2025/05/31/1c20b4ea0b37e.webp)

经过我本地调试，发现 z-index 的设置确实没问题，但后面的元素为什么会透出来？谷歌搜索一番，找到了这篇文章

![](https://static.031130.xyz/uploads/2025/05/31/99845899e3524.webp)

> 给 el-table 加一行如下代码即可
>
> ```css
> .el-table__cell {
>     position: static !important;
> }
> ```

经本地调试确认，这一方案确实能解决问题，但为什么呢？这就涉及到 Stacking Context （层叠上下文）了。

## Stacking Context（层叠上下文）究竟是什么？

简单来说，Stacking Context 可以被类比成画布。在同一块画布上，z-index 值越高的元素就处于越上方，会覆盖掉 z-index 较低的元素，这也是为什么我最开始让检查 z-index 的设置是否有问题。但问题出在 Stacking Context 也是有上下顺序之分的。

现在假设我们有 A、B 两块画布，在 A 上有一个设置了 z-index 为 1145141919810 的元素。那这个元素具备非常高的优先级，理应出现在浏览器窗口的最上方。但如果 B 画布的优先级高于 A 画布，那么 B 元素上的所有元素都会优先显示（当了躺赢狗）。那么画布靠什么来决定优先级呢？

- **处于同级的 Stacking Context 之间靠 z-index 值来区分优先级**
- **对于 z-index 值相同的 Stacking Context，在 html 文档中位置靠后的元素拥有更高的优先级**

第二条规则也能解释为什么在上面的 demo 中，只有在表格中位置排在图片元素后面的元素出现了透出来的情况。

## 所以为什么 el-image 和 el-table 打架了？

这次的冲突主要是下面两个因素引起的

1. el-table 给每个 cell 都设置了 `position: relative` 的 css 属性，而 position 被设为 relative 时，当前元素就会生成一个 Stacking Context。

   ![image-20250531013029154](https://static.031130.xyz/uploads/2025/05/31/9df43b865b3c6.webp)

   所以我们这么一个有十个格子的表格，其实就生成了十个画布。而这其中每个画布 z-index 都为 1。根据刚才的规则，在图片格子后面的那些格子对应的 html 代码片段在整体的 html 文档中更靠后，所以他们的优先级都高于图片格子。

2. el-image 的预览功能所展开的遮罩层处于 el-image 标签内部

   ![](https://static.031130.xyz/uploads/2025/05/31/f18a2b54afd63.webp)

   上图中橙色部分是 el-image 在预览时提供的遮罩，可以看到 element-plus 组件的 image 预览的默认行为是将预览时所需要的遮罩层直接放在 \<el-image> \</el-image> 标签内部，这导致 el-image 的遮罩层被困在一个低优先级的 Stacking Context 中，后面的格子里的内容就是能凭借高优先级透过来。

## 所以解决方案是什么？

### 更改 position 值在这里确实是可行的

上面我谷歌搜到的将 el-table 中 cell 的 position 值强制设为 static 确实是有效的，因为 static 不会创建新的 Stacking Context，这样就不会有现在的问题。

### 将需要出现在最顶层的代码放置在优先级最大的位置是更常见的方案

但别的组件库在处理这个需求时，一般会将预览时提供的遮罩的 html 代码片段直接插入到 body 标签内部的最尾部，并设置一个相对比较大的 z-index 值，以确保这个遮罩层能够获得最高的优先级，以此能出现在屏幕的最上方。（像一些 dialog 对话框、popover 悬浮框也都是这个原理）。

事实上，element-plus 组件库也提供了这个功能

> **preview-teleported:** image-viewer 是否插入至 body 元素上。嵌套的父元素属性会发生修改时应该将此属性设置为 `true`

所以在使用 el-image 时传入一个 `:preview-teleported="true"` 是一个更普适的方案，因为我们并不能确保 el-image 的父元素除了 el-table 的 cell 以外还有什么其他的父元素会创建新的 Stacking Context。

## 参见

- [层叠上下文 - CSS：层叠样式表 | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Stacking_context)
- [彻底搞懂CSS层叠上下文、层叠等级、层叠顺序、z-index最近，在项目中遇到一个关于CSS中元素z-index属性的问 - 掘金](https://juejin.cn/post/6844903667175260174)
- [深入理解CSS中的层叠上下文和层叠顺序 «  张鑫旭-鑫空间-鑫生活](https://www.zhangxinxu.com/wordpress/2016/01/understand-css-stacking-context-order-z-index/)
- [Image 图片 | Element Plus](https://element-plus.org/zh-CN/component/image.html)
- [element ui e-image 和e-table一起使用显示问题_el-table el-image-CSDN博客](https://blog.csdn.net/qq_61402485/article/details/131202117)
