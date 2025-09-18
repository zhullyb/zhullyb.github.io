---
title: 2025年，前端如何使用 JS 将文本复制到剪切板？
date: 2025-04-21 19:48:05
description: 本文全面解析了2025年JavaScript实现文本复制到剪贴板的技术演进与最佳实践。从已被弃用但广泛兼容的document.execCommand方法，到现代、异步且功能更强的Clipboard API，文章详细对比了两种方案的优缺点、兼容性及适用场景，并深入探讨了历史方案如Flash时代的ZeroClipboard。同时，介绍了多个热门第三方库（如clipboard.js、copy-to-clipboard）和框架生态（如VueUse、React相关Hooks）的封装实现，帮助开发者根据项目需求选择优雅且兼容的解决方案。无论你是关注前沿技术还是需要向下兼容，这篇文章都将为你提供清晰的技术选型指导和代码示例。
sticky:
tags:
- JavaScript
---

## 基础原理

如果你尝试在搜索引擎上检索本文的标题，你搜到的文章大概会让你使用下面两个 API。<span class="heimu">我希望你用的搜索引擎不至于像某度一样灵车到 2025 年还在让你使用基于 Flash 的 ZeroClipboard 方案</span>

### [document.execCommand](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/execCommand)

2012 年不止有世界末日，还有 IE 10。随着 IE 10 在当年 9 月 4 日发布，execCommand 家族迎来了两个新的成员—— copy/cut 命令（此说法来自 [Chrome 的博客](https://developer.chrome.com/blog/cut-and-copy-commands)，而 [MDN 认为 IE 9 就已经支持了](https://web.archive.org/web/20160315042044/https://developer.mozilla.org/zh-CN/docs/Web/API/Document/execCommand)）。三年之后，随着 Google Chrome 在 2015 年 4 月 14 日的发布的 42 版本对 execCommand 的 copy/cut 跟进，越来越多的浏览器厂商开始在自家的浏览器中跟进这个实现标准。最终在 2016 年 9 月 13 日发布的 Safari 10 on IOS 后，WEB 开发者们总算获得了历史上第一个非 Flash 实现的 js 复制到剪切板的方案。

当 document.execCommand 的第一个参数为 copy 时，可以将用户选中的文本复制到剪切板。基于这个 API 实现，很快便有人研究出了当今 web 下最常见的 js 实现——先创建一个不可见的 dom，用 js 操作模拟用户选中文本，并调用 execCommand('copy') 将文本复制到用户的剪切板。大致的代码实现如下：

```javascript
// 来自「JS复制文字到剪贴板的坑及完整方案。」一文，本文结尾有跳转链接

const textArea = document.createElement("textArea");
textArea.value = val;
textArea.style.width = 0;
textArea.style.position = "fixed";
textArea.style.left = "-999px";
textArea.style.top = "10px";
textArea.setAttribute("readonly", "readonly");
document.body.appendChild(textArea);

textArea.select();
document.execCommand("copy");
document.body.removeChild(textArea);
```

尽管**这个 API 早已被 w3c 弃用**，在 MDN 被标注为 Deprecated，但这仍然是市面上最常见的方案。在编写本文的时候，我扒了扒 MDN 的英文原始页面在 archive.org 的存档及其在 Github 的变更记录，这个 API 在 [2020 年 1~2 月](https://web.archive.org/web/20200221235207/https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand)被首次标记为 Obsolete（过时的），在 [2021 年 1 月](https://github.com/mdn/content/commit/0c31e2bc4d6601a079bc57521e79529539c8cf68#diff-85ef9d1e72565f0ae2ffd8199d10b34c11c615aec5d116057ac2a33c21cc072f)被首次标记为 Deprecated（已弃用），并附上了红色 Section Background Color 提示开发者该 API 可能**随时无法正常工作**。但截至本文发布，所有的常用浏览器都保留着对该 API 的兼容，起码在 copy 命令下是这样的。

这个 API 被广泛应用在了太多站点，以至于移除对该 API 的支持将会导致大量的站点异常，我想各家浏览器内核在短期内恐怕都没有动力以丢失兼容性为代价去移除这个 API，这也意味着这个创建一个不可见的 dom 代替用户选中文本并执行 execCommand 复制到用户剪切板的（看似奇葩的）曲线救国方案已然在前端开发的历史上留下了浓墨重彩的一笔。

### [Clipboard.writeText()](https://developer.mozilla.org/zh-CN/docs/Web/API/Clipboard/writeText)

随着原生 JS 一步步被增强，开发者们总算补上了 Clipboard 这一块的拼图。2018 年 4 月 17 日，Chrome 66 率先迈出了这一步；同年 10 月 23 日，Firefox 跟进了 ClipBoard API 的实现。最终在 2020 年 3 月 24 日，随着 Apple 自家 Safari 13.4 的姗姗来迟，前端开发者门总算喘了口气，再一次得到了一个主流浏览器通用的复制方案。

**那么 execCommand 明明已经实现了纯 js 实现的复制文本到剪切板了，为什么我们还需要 Clipboard API ？或者说，这个特意去实现的 Clipboard API 到底有什么优势？**

1. 传统的 execCommand 方案在使用的时候通常需要创建一个临时的不可见的 DOM，放入文本、用 JS 选中文本、执行 copy 命令。我们暂且不说这种 hacky 的方式在代码编写时是多么不优雅，但一个使用 JS 去选中文本这个操作就会修改用户当前的文本选择状态，在某些时候导致一些用户体验的下降。
2. Clipboard API 是异步的，这意味着其在复制大量文本时不会阻塞主线程。
3. Clipboard API 提供了更多的能力，比如 `write()` 和 `read()` 允许对剪切板读写更复杂的数据，比如富文本或图片。
4. Clipboard API 具有更现代、更明确的权限控制—— write 操作需要由用户的主动操作来调用，read 操作则需要用户在浏览器 UI 上明确授予权限。这些权限控制给予了用户更大的控制权，因此，当 execCommand 退出历史的舞台后，WEB 的安全性将得到进一步提升。

不过在现阶段，`Clipboard.writeText()` 未必就能解决所有的问题。抛开旧版浏览器的兼容性问题不谈，`navigator.clipboard` **仅在通过 https 访问的页面中可用**（或是 localhost），如果你的项目部署在局域网，你试图通过 192.18.1.x 的 ip + port 直接访问，那么 `navigator.clipboard` 将会是 `undefined` 状态。

![](https://static.031130.xyz/uploads/2025/04/19/3437b1c022853.webp)

除此之外，**安卓原生的 Webview** 还有因为 Permissions API 没实现而**用不了** Clipboard API 的问题。

基于以上原因，很多网站现在都会优先尝试使用 `navigator.clipboard.writeText()`，失败后再转去使用 `execCommand('copy')`。大致的代码实现如下：

```javascript
// 来自「JS复制文字到剪贴板的坑及完整方案。」一文，本文结尾有跳转链接

const copyText = async val => {
  if (navigator.clipboard && navigator.permissions) {
    await navigator.clipboard.writeText(val);
  } else {
    const textArea = document.createElement("textArea");
    textArea.value = val;
    textArea.style.width = 0;
    textArea.style.position = "fixed";
    textArea.style.left = "-999px";
    textArea.style.top = "10px";
    textArea.setAttribute("readonly", "readonly");
    document.body.appendChild(textArea);

    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
};
```

### ~~Flash 方案（[ZeroClipboard](https://github.com/zeroclipboard/zeroclipboard)）~~

其实上面两个 API 差不多就把基础原理讲完了，不过我在查资料的时候发现，在 execCommand 方案之前，前端居然大多是依靠 Flash 来实现复制文本到剪切板的，这不得拿出来讲讲？

目前在 ZeroClipboard 的 Github 仓库能找到的最老的 tag 是 [v1.0.7](https://github.com/zeroclipboard/zeroclipboard/releases/tag/v1.0.7)，发布于 2012 年 6 月 9 日。我打赌这个项目不是第一个通过 Flash 实现复制文本到剪切板的，在此之前肯定有人使用 Flash 实现过这个功能，只是没单独拎出来作为一个库开源出来。

ZeroClipboard 通过创建一个透明的 Flash Movie 覆盖在触发按钮上，当用户点击按钮时，实际上点到的是 Flash Movie，随后 JavaScript 与 Flash Movie 通过 `ExternalInterface` 进行通信，将需要复制的文本传递给 Flash，再经 Flash 的 API 将文本写入用户的剪切板。

在当时的时代背景下，这是唯一一个能够跨浏览器实现复制文本到剪切板的方案（尽管并不是每台电脑都装有 Flash，尽管 IOS 并不支持 Flash），6.6k star 的 Github 仓库见证了那个各家浏览器抱着各家私有 API 的混沌时代，最终随着 execCommand 方案的崛起，ZeroClipboard 与 Flash 一同落幕。

### 其他不完美的方案

#### window.clipboardData.setData

该 API 主要在 2000 年 —2010 年前后被使用，仅适用于 IE 浏览器。Firefox 在这段时间里还不支持纯 js 实现的复制文本至浏览器的操作；Chrome 第一个版本在 2008 年才发布，尚未成为主流。

```javascript
window.clipboardData.setData("Text", text2copy);
```

#### 摆烂（prompt）

调 prompt 弹窗让用户自己复制。

```javascript
prompt('Press Ctrl + C, then Enter to copy to clipboard','copy me')
```

![](https://static.031130.xyz/uploads/2025/04/19/7f5310ca03c80.webp)

## 第三方库封装

由于 execCommand 的方案过于抽象，不够优雅，所以我们有一些现成的第三方库对复制到剪切板的代码进行了封装。

### [clipboard.js](https://github.com/zenorocha/clipboard.js/)

clipboard.js 是最负盛名的一款第三方库，截至本文完成时间，在 Github 共收获 34.1k 的 star。最早的一个 tag 版本发布于 2015 年 10 月 28 日，也就是 Firefox 支持 execCommand、PC 端三大浏览器巨头全面兼容的一个月后。

clipboard.js [仅使用 execCommand](https://github.com/zenorocha/clipboard.js/blob/master/src/common/command.js) 实现复制到剪切板的操作，项目的 owner 希望开发者自行使用 `ClipboardJS.isSupported()` 来判断用户的浏览器是否支持 execCommand 方案，并根据命令执行的返回值自行安排成功/失败后的动作。。

不过让我感到奇怪的是，clipboard.js 在实例化时会要求开发者传入一个 DOM 选择（或者是 HTML 元素/元素列表）。它一定要有一个实体的 html 元素，用设置事件监听器来触发复制操作，而不是提供一个 js 函数让开发者来调用——尽管这不是来自 execCommand 的限制。示例如下

```html
<!-- Target -->
<input id="foo" value="text2copy" />

<!-- Trigger -->
<button class="btn" data-clipboard-target="#foo"></button>

<script>
	new ClipboardJS('.btn');
</script>
```

对，就一行 js 就能给所有带有 btn class 的 dom 加上监听器。或许这就是为什么这个仓库能获得 34.1k star 的原因，在 2015 年那个大多数人还在用三件套写前端的时代，clipboard.js 能够降低代码量，不用开发者自行设置监听器。

clipboard.js 当然也提供了很多高级选项来满足不同开发者的需求，比如允许你通过传入一个 function 来获取你需要让用户复制的文本而，或是通过 Event 监听器来反馈是否复制成功，总之灵活性是够用的。

### [copy-to-clipboard](https://github.com/sudodoki/copy-to-clipboard)

同样是一款[利用 execCommand](https://github.com/sudodoki/copy-to-clipboard/blob/main/index.js#L79) 的第三方库，虽然只有 1.3k star。第一个 tag 版本发布于 2015 年的 5 月 24 日，比 clipboard.js 还要早。相比起 clipboard.js，copy-to-clipboard 不依赖 html 元素，可以直接在 js 中被调用，我个人是比较喜欢这个的。在 vue/react 等现代化的前端框架中，我们一般不直接操作 dom，因此并不是很适合使用 clipboard.js，这个 copy-to-clipboard 就挺好的。此外，除了 execCommand 与方案，copy-to-clipboard 还对老版本的 IE 浏览器针对性的适配了 `window.clipboardData.setData` 的方案，并且在两者都失败时会调用 prompt 窗口让用户自主复制实现最终的兜底。

示例如下:

```javascript
import copy from 'copy-to-clipboard';

copy('Text');
```

相比起 clipboard.js 的使用思路是更加直观了，可惜生不逢时，不如 clipboard.js 出名（也可能有取名的原因在里面）。

### [VueUse - useClipboard](https://vueuse.org/core/useClipboard/)

VueUse 实现的这个 useClipboard 是令我最为满意的一个。useClipboard 充分考虑了浏览器的兼容性，在检测到满足 navigator.clipboard 的使用条件时**优先使用 `navigator.clipboard.writeText()`** ，在不支持 navigator.clipboard 或者 `navigator.clipboard.writeText()` **复制失败时转去使用 execCommand 实现的 legacyCopy**，并且借助 Vue3 中的 Composables 实现了一个 1.5 秒后自动恢复初始状态的 copied 变量，算是很有心了。

```vue
const { text, copy, copied, isSupported } = useClipboard({ source })
</script>

<template>
  <div v-if="isSupported">
    <button @click="copy(source)">
      <!-- by default, `copied` will be reset in 1.5s -->
      <span v-if="!copied">Copy</span>
      <span v-else>Copied!</span>
    </button>
    <p>Current copied: <code>{{ text || 'none' }}</code></p>
  </div>
  <p v-else>
    Your browser does not support Clipboard API
  </p>
</template>
```

### React 相关生态

React 这边不像 VueUse 一家独大，出现了很多可用的 hooks 库，那就全都过一遍

#### [react-use - useCopyToClipboard](https://github.com/streamich/react-use) 

react-use 是我能搜到的目前最大的 React Hooks 库，42.9k star。采用的复制方案是直接依赖上面介绍过的 [copy-to-clipboard](https://github.com/sudodoki/copy-to-clipboard)，也就是 execCommand 方案。

```jsx
const Demo = () => {
  const [text, setText] = React.useState('');
  const [state, copyToClipboard] = useCopyToClipboard();

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button type="button" onClick={() => copyToClipboard(text)}>copy text</button>
      {state.error
        ? <p>Unable to copy value: {state.error.message}</p>
        : state.value && <p>Copied {state.value}</p>}
    </div>
  )
}
```

#### [Ant Design - Typography](https://ant.design/components/typography-cn#typography-demo-copyable)

ahooks 是[小麦茶](https://site.j10ccc.xyz/)第一个报出来的 react hooks 库，由 Ant Design 原班人马维护。不过其在仓库中并没有对剪贴板的封装，因此在小麦茶的建议下我跑去翻了 Ant Design 中的 Typography 对复制能力的实现。和上面的 react-use 一样，都是直接用 [copy-to-clipboard](https://github.com/sudodoki/copy-to-clipboard)，属于 execCommand 方案。

#### [usehooks - useCopyToClipboard](https://usehooks.com/usecopytoclipboard)

这个库是我问 llm 知道的，现在有 10.5k star。非常逆天的一点在于它的所有逻辑代码都是在 index.js 这样一个单文件里实现的，属实是看不懂了。会先采用 `navigator.clipboard.writeText()` 尝试写入，失败后再换用 execCommand 的方案。hooks 的用法和上面的 react-use 大差不差。

#### [usehooks-ts - useCopyToClipboard](https://usehooks-ts.com/react-hook/use-copy-to-clipboard)

不知道是不是为了解决上面那玩意儿不支持 ts 才开的库。只使用 `navigator.clipboard.writeText()` 尝试写入剪切板，失败后直接 `console.warn` 报错，没有 fallback 方案。

## 结语

从结果上来看，VueUse 的封装无疑是最令我满意的。优先尝试性能最好的 Clipboard API，再尝试 execCommand 作为回落，同时辅以多个响应式变量帮助开发，但又不擅作主张地使用 prompt 作为保底，最大程度地把操作空间留给开发者。

站在 2025 年的节点回望，前端剪切板操作技术的演进轨迹清晰可见：从早期依赖 Flash 的脆弱方案，到 execCommand 的曲线救国，最终迈向标准化 Clipboard API 的优雅实现。这段历程不仅是技术迭代的缩影，更折射出前端开发中独特的「妥协艺术」。

在未来的很长一段时间里，或许我们还是会在「优雅实现」与「向下兼容」之间寻找平衡点、在浏览器沙箱里戴着镣铐跳芭蕾，但那些为兼容性而生的临时方案，终将成为见证前端进化史的珍贵注脚。

## 参见

- [JS复制文字到剪贴板的坑及完整方案。](https://liruifengv.com/posts/copy-text/)
- [ZeroClipboard 学习笔记 | 囧克斯](https://jiongks.name/blog/zeroclipboard-intro)
- [Cut and copy commands  |  Blog  |  Chrome for Developers](https://developer.chrome.com/blog/cut-and-copy-commands)
- [execCommand method (Internet Explorer) | Microsoft Learn](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/ms536419(v=vs.85))
- [sudodoki/copy-to-clipboard](https://github.com/sudodoki/copy-to-clipboard)
- [zenorocha/clipboard.js](https://github.com/zenorocha/clipboard.js/)
- [useClipboard | VueUse](https://vueuse.org/core/useClipboard/)
- [Side-effects / useCopyToClipboard - Docs ⋅ Storybook](https://streamich.github.io/react-use/?path=/story/side-effects-usecopytoclipboard--docs)
- [document.execCommand - Web API | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/execCommand)
- [Clipboard.writeText() - Web API | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Clipboard/writeText)
- [Onclick Select All and Copy to Clipboard? - JavaScript - SitePoint Forums | Web Development & Design Community](https://www.sitepoint.com/community/t/onclick-select-all-and-copy-to-clipboard/3837/2)
- [How would I implement 'copy url to clipboard' from a link or button using javascript or dojo without flash - Stack Overflow](https://stackoverflow.com/questions/16526814/how-would-i-implement-copy-url-to-clipboard-from-a-link-or-button-using-javasc)
