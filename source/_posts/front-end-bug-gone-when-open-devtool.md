---
title: 前端中的量子力学——一打开 F12 就消失的 Bug
date: 2025-06-08 01:22:13
sticky:
index_img: https://static.031130.xyz/uploads/2025/06/08/2798756067653.webp
tags:
- Web
- HTML
- CSS
- JavaScript
- Debug
---

## 前端「量子态」现象的首次观测

这事说来也邪乎，半个月前吃着火锅唱着歌，在工位上嘎嘎写码，发现一个诡异的 bug。作为如假包换的人类程序员，写出 bug 是再正常不过的事情了，但这 bug 邪门就邪门在我一打开 F12 的 DevTools 观察相关的 dom 结构，这 bug 就自动消失了；再把 DevTools 一关，Ctrl + F5 一刷新页面，Bug 又出现了。

下面是使用 iframe 引入的 [demo](https://static.031130.xyz/demo/scroll-jump-bug.html)

<iframe src="https://static.031130.xyz/demo/scroll-jump-bug.html" width="100%" height="500" allowfullscreen></iframe>

![“观测”指南](https://static.031130.xyz/uploads/2025/06/08/65620d31fce6f.webp)

这 Bug 给我整得脑瓜子嗡嗡的，我又不是物理学家，写个前端怎么量子力学的观察者效应都给我整出来了（？

> **观测者效应**（Observer effect），是指“观测”这种行为对被观测对象造成一定影响的效应。
>
> 在量子力学实验中，如果要测算一个电子所处的速度，就要用两个光子隔一段时间去撞击这个电子，但第一个光子就已经把这个电子撞飞了，便改变了电子的原有速度，我们便无法测出真正准确的速度（不确定原理）。时间流逝的快慢也会受到观测者的影响，用很高的频率去观测粒子的衰变，反而使得粒子长时间不衰变。
>
> ——wikipedia

## 量子迷雾❌浏览器机制✅

这里先稍微解释一下 demo 中的代码片段:

```javascript
if (scrollIndex >= groupLength) {
  setTimeout(() => {
    wrapper.style.transition = "none";
    scrollIndex = 0;
    wrapper.style.transform = `translateY(-${crollIndex * itemHeight}px)`;

    requestAnimationFrame(() => {
      wrapper.style.transition = "transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)";
    });
  }, 500);
}
```

我这边拿到的需求是需要写一个无限滚动的轮播标题列表，每次展示三个，2 秒后标题列表整体上移，原本的第一个标题就移出可视范围了，下面会新补充一个新的标题列表。（可能解释的不清楚，但各位应该都看过上面的 demo 了）

当列表滚动到最底部的时候，我先取消 transition 过渡动画效果，趁机将整体列表平移到上一次可视范围内出现相同的三个标题的位置，再把 transition 过渡动画的效果加回来，这样就能在视觉上造成无限滚动的效果。

但问题就出在明明把 transition 属性取消了，但这一次平移仍然触发了过渡动画效果。

说实话，这是我短暂的码农生涯当中最绝望的一次，一方面是遇到的 bug 过于逆天以至于说出去都可能没人信，一方面是遇上这种问题是完全不能指望搜索引擎能给出什么解决方案的——毕竟我自己都不知道该怎么组织关键词进行搜索。

![这是小麦茶，带我入坑前端的学长](https://static.031130.xyz/uploads/2025/06/08/475a61b332454.webp)

于是抱着试一试的心态，把相关代码喂给 ChatGPT-4o 看看能不能问出个所以然来。

> 你描述的现象——“**滚动第九次时列表出现突兀的自下而上跳动**，而**打开 F12 时不会出现问题**”——**几乎可以确定是由于浏览器在某些渲染状态下跳过了某些帧（帧率波动）或者定时器精度的问题导致动画突变**。
>
> 这种问题多半发生在“使用 `setInterval` 控制动画”和“切换样式（transition）时机不当”所引起的 **过渡跳帧问题**，而打开 DevTools 会 **强制刷新帧或提高定时器精度**，从而**掩盖了这个问题**。

## 太好了，是 requestAnimationFrame，我们有救了

> **`window.requestAnimationFrame()`** 方法会告诉浏览器你希望执行一个动画。它要求浏览器在下一次重绘之前，调用用户提供的回调函数。
>
> ——MDN

这是 GPT 给出的方案，非常有效

```diff
if (scrollIndex >= groupLength) {
  setTimeout(() => {
    wrapper.style.transition = "none";
    scrollIndex = 0;
    wrapper.style.transform = `translateY(-${crollIndex * itemHeight}px)`;

    requestAnimationFrame(() => {
+      requestAnimationFrame(() => {
         wrapper.style.transition = "transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)";
+      });
    });
  }, 500);
}
```

如果觉得嵌套两层 requestAnimationFrame 比较难理解，那下面的代码是等效的

```javascript
if (scrollIndex >= groupLength) {
  setTimeout(() => {
    scrollIndex = 0;

    requestAnimationFrame(() => {
      // 第一帧
      wrapper.style.transition = "none";
      wrapper.style.transform = `translateY(-${crollIndex * itemHeight}px)`;
      // 第二帧
      requestAnimationFrame(() => {
        wrapper.style.transition = "transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)";
      });
    });
  }, 500);
}
```

总之，我们需要杜绝浏览器将设置 transform 偏移值（瞬移列表位置）与恢复 transition 动画两件事合并到同一帧里去，而两层嵌套的 requestAnimationFrame 方法能很好的解决这个问题

<iframe src="https://static.031130.xyz/demo/scroll-jump-bug-fixed.html" width="100%" height="500" allowfullscreen></iframe>

## 驯服量子态：前端开发者的新技能

就这样，通过使用两层`requestAnimationFrame`，我们成功驯服了这个"量子态"的bug。现在无论是否打开F12，它都会乖乖地按照我们的预期滚动，不再玩消失的把戏。

看来，在前端的世界里，我们不仅要懂JavaScript，~~还得懂点量子力学~~。下次再遇到这种"一观测就消失"的bug，不妨试试这个"量子纠缠解决方案"——双重`requestAnimationFrame`，没准就能让bug从"量子态"坍缩成"稳定态"呢！

当然，如果你有更神奇的 debug 经历，欢迎分享你的经历——毕竟，在代码的宇宙里，我们永远不知道下一个bug会以怎样的形态出现。也许，这就是编程的乐趣（？）所在吧！

> 本文由 ChatGPT 与 DeepSeek 协助撰写，但 bug 是真人真事（泪）。

## 参见

- [观测者效应 - 维基百科，自由的百科全书](https://zh.wikipedia.org/wiki/%E8%A7%82%E6%B5%8B%E8%80%85%E6%95%88%E5%BA%94)
- [Window：requestAnimationFrame() 方法 - Web API | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestAnimationFrame)
- [网页性能管理详解 - 阮一峰的网络日志](https://www.ruanyifeng.com/blog/2015/09/web-page-performance-in-depth.html)
