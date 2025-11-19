---
title: Vue Markdown 渲染优化实战(上)：从暴力刷新、分块更新到 Morphdom 的华丽变身
date: 2025-07-12 20:48:56
sticky:
tags:
- Vue.js
- Markdown
- JavaScript
- Web
- HTML
---

## 需求背景

在最近接手的 AI 需求中，需要实现一个类似 ChatGPT 的对话交互界面。其核心流程是：后端通过 SSE（Server-Sent  Events）协议，持续地将 AI 生成的 Markdown 格式文本片段推送到前端。前端负责动态接收并拼接这些 Markdown  片段，最终将拼接完成的 Markdown 文本实时渲染并显示在用户界面上。

Markdown 渲染并不是什么罕见的需求，尤其是在 LLM 相关落地产品满天飞的当下。不同于 React 生态拥有一个 14k+ star 的著名第三方库——[react-markdown](https://github.com/remarkjs/react-markdown)，Vue 这边似乎暂时还没有一个仍在活跃维护的、star 数量不低（起码得 2k+ 吧？）的 markdown 渲染库。[cloudacy/vue-markdown-render](https://github.com/cloudacy/vue-markdown-render#readme) 最后一次发版在一年前，但截止本文写作时间只有 103 个 star；[miaolz123/vue-markdown](https://github.com/miaolz123/vue-markdown) 有 2k star，但最后一次 commit 已经是 7 年前了；[zhaoxuhui1122/vue-markdown](https://github.com/zhaoxuhui1122/vue-markdown) 更是 archived 状态。

## 第一版方案：简单粗暴的 v-html

简单调研了一圈，发现 Vue 生态里确实缺少一个能打的 Markdown 渲染库。既然没有现成的轮子，那咱就自己造一个！

根据大部分文章以及 LLM 的推荐，我们首先采用 markdown-it 这个第三方库将 markdown 转换为 html 字符串，再通过 v-html 传入。

**PS:** 我们这里假设 Markdown 内容是可信的（比如由我们自己的 AI 生成）。如果内容来自用户输入，一定要使用 `DOMPurify` 这类库来防止 XSS 攻击，避免给网站“开天窗”哦！

示例代码如下：

```vue
<template>
  <div v-html="renderedHtml"></div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import MarkdownIt from 'markdown-it';

const markdownContent = ref('');
const md = new MarkdownIt();

const renderedHtml = computed(() => md.render(markdownContent.value))

onMounted(() => {
  // markdownContent.value = await fetch() ...
})
</script>
```

## 进化版：给 Markdown 分块更新

上述方案虽然能实现基础渲染，但在实时更新场景下存在明显缺陷：**每次接收到新的 Markdown 片段，整个文档都会触发全量重渲染**。即使只有最后一行是新增内容，整个文档的 DOM 也会被完全替换。这导致两个核心问题：

1. **性能顶不住：**Markdown 内容增长时，`markdown-it` 解析和 DOM 重建的开销呈线性上升。
2. **交互状态丢失：**全量刷新会把用户当前的操作状态冲掉。最明显的就是，如果你选中了某段文字，一刷新，选中状态就没了！

为了解决这两个问题，[我们在网上找到了分块渲染的方案](https://juejin.cn/post/7480900772386734143) —— 把 Markdown 按两个连续的换行符 (`\n\n`) 切成一块一块的。这样每次更新，只重新渲染最后一块新的，前面的老块直接复用缓存。好处很明显：

- 用户如果选中了前面块里的文字，下次更新时选中状态不会丢（因为前面的块没动）。
- 需要重新渲染的 DOM 变少了，性能自然就上来了。

代码调整后像这样：

```vue
<template>
  <div>
    <div
      v-for="(block, idx) in renderedBlocks"
      :key="idx"
      v-html="block"
      class="markdown-block"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import MarkdownIt from 'markdown-it'

const markdownContent = ref('')
const md = new MarkdownIt()

const renderedBlocks = ref([])
const blockCache = ref([])

watch(
  markdownContent,
  (newContent, oldContent) => {
    const blocks = newContent.split(/\n{2,}/)
    // 只重新渲染最后一个块，其余用缓存
    // 处理块减少、块增多的场景
    blockCache.value.length = blocks.length
    for (let i = 0; i < blocks.length; i++) {
      // 只渲染最后一个，或新块
      if (i === blocks.length - 1 || !blockCache.value[i]) {
        blockCache.value[i] = md.render(blocks[i] || '')
      }
      // 其余块直接复用
    }
    renderedBlocks.value = blockCache.value.slice()
  },
  { immediate: true }
)

onMounted(() => {
  // markdownContent.value = await fetch() ...
})
</script>
```

## 终极武器：用 morphdom 实现精准更新

分块渲染虽然解决了大部分问题，但遇到 Markdown 列表就有点力不从心了。因为 Markdown 语法里，列表项之间通常只有一个换行符，整个列表会被当成一个大块。想象一下一个几百项的列表，哪怕只更新最后一项，整个列表块也要全部重来，前面的问题又回来了。

### morphdom 是何方神圣？

`morphdom` 是一个仅 5KB（gzip 后）的 JavaScript 库，核心功能是：**接收两个 DOM 节点（或 HTML 字符串），计算出最小化的 DOM 操作，将第一个节点 “变形” 为第二个节点，而非直接替换**。

其工作原理类似虚拟 DOM 的 Diff 算法，但**直接操作真实 DOM**：

1. 对比新旧 DOM 的标签名、属性、文本内容等；
2. 仅对差异部分执行增 / 删 / 改操作（如修改文本、更新属性、移动节点位置）；
3. 未变化的 DOM 节点会被完整保留，包括其事件监听、滚动位置、选中状态等。

Markdown 把列表当整体，但生成的 HTML 里，每个列表项 (`<li>`) 都是独立的！`morphdom` 在更新后面的列表项时，能保证前面的列表项纹丝不动，状态自然就保住了。

这不就是我们梦寐以求的效果吗？在 Markdown 实时更新的同时，最大程度留住用户的操作状态，还能省掉一堆不必要的 DOM 操作！

### 示例代码

```vue
<template>
  <div ref="markdownContainer" class="markdown-container">
    <div id="md-root"></div>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue';
import MarkdownIt from 'markdown-it';
import morphdom from 'morphdom';

const markdownContent = ref('');
const markdownContainer = ref(null);
const md = new MarkdownIt();

const render = () => {
  if (!markdownContainer.value.querySelector('#md-root')) return;

  const newHtml = `<div id="md-root">` + md.render(markdownContent.value) + `</div>`

  morphdom(markdownContainer.value, newHtml, {
    childrenOnly: true
  });
}

watch(markdownContent, () => {
    render()
});

onMounted(async () => {
  // 等待 Dom 被挂载上
  await nextTick()
  render()
})
</script>

```

### 眼见为实：Demo 对比

下面这个 iframe 里放了个对比 Demo，展示了不同方案的效果差异。

**小技巧：** 如果你用的是 Chrome、Edge 这类 Chromium 内核的浏览器，打开开发者工具 (DevTools)，找到“渲染”(Rendering) 标签页，勾选「突出显示重绘区域(Paint flashing)」。这样你就能直观看到每次更新时，哪些部分被重新绘制了——重绘区域越少，性能越好！

![](https://static.031130.xyz/uploads/2025/07/12/d5721c40fb076.webp)

<iframe src="https://static.031130.xyz/demo/morphdom-vs-markdown-chunk.html" width="100%" height="500" allowfullscreen loading="lazy"></iframe>

## 阶段性成果

从最开始的“暴力全量刷新”，到“聪明点的分块更新”，再到如今“精准手术刀般的 `morphdom` 更新”，我们一步步把那些不必要的渲染开销给砍掉了，最终搞出了一个既快又能留住用户状态的 Markdown 实时渲染方案。

不过，用 `morphdom` 这个第三方库来直接操作 Vue 组件里的 DOM，总觉得有点...不够“Vue”？它虽然解决了核心的性能和状态问题，但在 Vue 的世界里这么玩，多少有点旁门左道的意思。

**下篇预告：** 在下一篇文章里，咱们就来聊聊，在 Vue 的世界里，有没有更优雅、更“原生”的方案来搞定 Markdown 的精准更新？敬请期待！
