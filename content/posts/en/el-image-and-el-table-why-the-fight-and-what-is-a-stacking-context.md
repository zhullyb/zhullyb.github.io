---
title: Why Do el-image and el-table Clash? What Is a Stacking Context?
date: 2025-05-31 00:29:40
sticky:
tags:
- Vue.js
- JavaScript
- CSS
- HTML
- Web

---

This happened during the internal development of Jinghong’s image hosting service. A freshman reported that `el-image` and `el-table` were “clashing.”

![Screenshot](https://static.031130.xyz/uploads/2025/05/31/c6674f6f13955.webp)

Demo iframe:

[demo](https://static.031130.xyz/demo/el-image-el-table-conflict.html)

<iframe src="https://static.031130.xyz/demo/el-image-el-table-conflict.html" width="100%" height="500" allowfullscreen loading="lazy"></iframe>

When I saw that the table behind was showing through the `el-image` preview overlay, my first reaction was to ask the student to check whether the `z-index` was correct—specifically whether the `el-image` mask overlay had a higher `z-index` than the table.

![](https://static.031130.xyz/uploads/2025/05/31/1c20b4ea0b37e.webp)

After testing locally, I confirmed that the `z-index` was indeed set correctly. So why were the elements behind showing through? A quick Google search led me to this article:

![](https://static.031130.xyz/uploads/2025/05/31/99845899e3524.webp)

> Simply add the following CSS to `el-table`:
>
> ```css
> .el-table__cell {
>     position: static !important;
> }
> ```

Testing locally confirmed that this solution works. But why? This is where **Stacking Context** comes into play.

## What Exactly Is a Stacking Context?

Simply put, a Stacking Context is like a canvas. On the same canvas, elements with higher `z-index` values appear on top of those with lower values, which is why I initially suggested checking `z-index`. But the catch is that **Stacking Contexts themselves have a hierarchy**.

Imagine we have two canvases, A and B. On A, there’s an element with `z-index: 1145141919810`. This element has a very high priority and should appear at the very top of the browser window. But if canvas B has higher priority than canvas A, all elements on B will be displayed above A (essentially “winning by default”). So how is a canvas’s priority determined?

- **Between sibling Stacking Contexts, priority is determined by `z-index`.**
- **For Stacking Contexts with the same `z-index`, elements appearing later in the HTML document have higher priority.**

The second rule explains why in the demo, only elements that come after the image cell in the table are showing through.

## So Why Do `el-image` and `el-table` Clash?

This conflict is mainly caused by two factors:

1. `el-table` sets `position: relative` for each cell. When `position` is set to `relative`, the element creates a new Stacking Context.

   ![image-20250531013029154](https://static.031130.xyz/uploads/2025/05/31/9df43b865b3c6.webp)

   So a table with ten cells actually generates ten canvases, each with `z-index: 1`. According to the rules above, table cells that appear later in the HTML document have higher priority than the earlier image cell.

2. The overlay used by `el-image`’s preview feature is placed **inside the `el-image` element itself**.

   ![](https://static.031130.xyz/uploads/2025/05/31/f18a2b54afd63.webp)

   The orange area in the image above is the overlay used during preview. The default behavior of Element Plus is to insert the preview overlay inside the `<el-image>` tag. This traps the overlay inside a low-priority Stacking Context, allowing content from later table cells to appear on top.

## So What’s the Solution?

### Changing the `position` value works

The solution found online, forcing `position: static` on table cells, works because `static` does **not** create a new Stacking Context, avoiding the current problem.

### Placing top-layer elements in the highest-priority context is more common

Other component libraries usually handle this by inserting the overlay directly into the `body` element and giving it a high `z-index`. This ensures it always appears on top of the screen (same principle used for dialogs, popovers, etc.).

In fact, Element Plus supports this feature:

> **preview-teleported:** Determines whether the image viewer overlay is inserted into the `body`. Should be set to `true` if the parent element may modify its properties.

So using `:preview-teleported="true"` with `el-image` is a more robust approach, because we cannot guarantee that the parent of `el-image` (besides `el-table` cells) won’t create another Stacking Context.

## References

- [Stacking Context - CSS | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Stacking_context)
- [Completely Understand CSS Stacking Contexts, Levels, Order, and z-index](https://juejin.cn/post/6844903667175260174)
- [Deep Dive into CSS Stacking Context and Stacking Order](https://www.zhangxinxu.com/wordpress/2016/01/understand-css-stacking-context-order-z-index/)
- [Image | Element Plus](https://element-plus.org/zh-CN/component/image.html)
- [el-image and el-table display issue](https://blog.csdn.net/qq_61402485/article/details/131202117)
