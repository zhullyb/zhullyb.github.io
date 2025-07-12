---
title: Vue Markdown 渲染优化实战（下）：告别 DOM 操作，拥抱 AST 与函数式渲染
date: 2025-07-13 00:01:35
sticky:
tags:
- Vue.js
- Markdown
- AST
- JavaScript
- Web
- unified
---

## 上回回顾：当 `morphdom` 遇上 Vue

在[上一篇文章](/2025/07/12/vue-markdown-render-improvement-1/)中，我们经历了一场 Markdown 渲染的性能优化之旅。从最原始的 `v-html` 全量刷新，到按块更新，最终我们请出了 `morphdom` 这个“终极武器”。它通过直接比对和操作真实 DOM，以最小的代价更新视图，完美解决了实时渲染中的性能瓶颈和交互状态丢失问题。

然而，一个根本性问题始终存在：在 Vue 的地盘里，绕过 Vue 的虚拟 DOM (Virtual DOM) 和 Diff 算法，直接用一个第三方库去“动刀”真实 DOM，总感觉有些“旁门左道”。这就像在一个精密的自动化工厂里，引入了一个老师傅拿着锤子和扳手进行手动修补。虽然活干得漂亮，但总觉得破坏了原有的工作流，不够“Vue”。

那么，有没有一种更优雅、更“原生”的方式，让我们既能享受精准更新的快感，又能完全融入 Vue 的生态体系呢？

带着这个问题，我询问了前端群里的伙伴们。

> 如果就要做一个渲染器，你这个思路不是最佳实践。每次更新时，你都生成全量的虚拟 HTML，然后再对 HTML 做减法来优化性能。然而，每次更新的增量部分是明确的，为什么不直接用这部分增量去做加法？增量部分通过 markdown-it 的库无法直接获取，但更好的做法是在这一步进行改造：先解析 Markdown 的结构，再利用 Vue 的动态渲染能力生成 DOM。这样，DOM 的复用就可以借助 Vue 自身的能力来实现。—— [j10c](https://site.j10c.cc/)

> 可以用 unified 结合 remark-parse 插件，将 markdown 字符串解析为 ast，然后根据 ast 使用 render func 进行渲染即可。—— bii & [nekomeowww](https://github.com/nekomeowww)

## 新思路：从“字符串转换”到“结构化渲染”

我们之前的方案，无论是 `v-html` 还是 `morphdom`，其核心思路都是：

`Markdown 字符串` -> `markdown-it` -> `HTML 字符串` -> `浏览器/morphdom` -> `DOM`

这条链路的问题在于，从 `HTML 字符串` 这一步开始，我们就丢失了 Markdown 的**原始结构信息**。我们得到的是一堆非结构化的文本，Vue 无法理解其内在逻辑，只能将其囫囵吞下。

而新的思路则是将流程改造为：

`Markdown 字符串` -> `AST (抽象语法树)` -> `Vue VNodes (虚拟节点)` -> `Vue` -> `DOM`

### 什么是 AST？

**AST (Abstract Syntax Tree)** ，即抽象语法树，是源代码或标记语言的结构化表示。它将一长串的文本，解析成一个层级分明的树状对象。对于 Markdown 来说，一个一级标题会变成一个 `type: 'heading', depth: 1` 的节点，一个段落会变成一个 `type: 'paragraph'` 的节点，而段落里的文字，则是 `paragraph` 节点的 `children`。

一旦我们将 Markdown 转换成 AST，就相当于拥有了整个文档的“结构图纸”。我们不再是面对一堆模糊的 HTML 字符串，而是面对一个清晰、可编程的 JavaScript 对象。

### 我们的新工具：unified 与 remark

为了实现 `Markdown -> AST` 的转换，我们引入 `unified` 生态。

- **[unified](https://github.com/unifiedjs/unified)**: 一个强大的内容处理引擎。你可以把它想象成一条流水线，原始文本是原料，通过添加不同的“插件”来对它进行解析、转换和序列化。
- **[remark-parse](https://github.com/remarkjs/remark)**: 一个 `unified` 插件，专门负责将 Markdown 文本解析成 AST（具体来说是 `mdast` 格式）。

## 第一步：将 Markdown 解析为 AST

首先，我们需要安装相关依赖：

```bash
npm install unified remark-parse
```

然后，我们可以轻松地将 Markdown 字符串转换为 AST：

```javascript
import { unified } from 'unified'
import remarkParse from 'remark-parse'

const markdownContent = '# Hello, AST!\n\nThis is a paragraph.'

// 创建一个处理器实例
const processor = unified().use(remarkParse)

// 解析 Markdown 内容
const ast = processor.parse(markdownContent)

console.log(JSON.stringify(ast, null, 2))
```

运行以上代码，我们将得到一个如下所示的 JSON 对象，这就是我们梦寐以求的 AST：

```json
{
  "type": "root",
  "children": [
    {
      "type": "heading",
      "depth": 1,
      "children": [
        {
          "type": "text",
          "value": "Hello, AST!",
          "position": { ... }
        }
      ],
      "position": { ... }
    },
    {
      "type": "paragraph",
      "children": [
        {
          "type": "text",
          "value": "This is a paragraph.",
          "position": { ... }
        }
      ],
      "position": { ... }
    }
  ],
  "position": { ... }
}
```

## 第二步：从 AST 到 Vue VNodes

拿到了 AST，下一步就是将这个“结构图纸”真正地“施工”成用户可见的界面。在 Vue 的世界里，描述 UI 的蓝图就是**虚拟节点 (VNode)**，而 `h()` 函数（即 hyperscript）就是创建 VNode 的画笔。

我们的任务是编写一个渲染函数，它能够递归地遍历 AST，并为每一种节点类型（`heading`, `paragraph`, `text` 等）生成对应的 VNode。

下面是一个简单的渲染函数实现：

```javascript
function renderAst(node) {
  if (!node) return null
  switch (node.type) {
    case 'root':
      return h('div', {}, node.children.map(renderAst))
    case 'paragraph':
      return h('p', {}, node.children.map(renderAst))
    case 'text':
      return node.value
    case 'emphasis':
      return h('em', {}, node.children.map(renderAst))
    case 'strong':
      return h('strong', {}, node.children.map(renderAst))
    case 'inlineCode':
      return h('code', {}, node.value)
    case 'heading':
      return h('h' + node.depth, {}, node.children.map(renderAst))
    case 'code':
      return h('pre', {}, [h('code', {}, node.value)])
    case 'list':
      return h(node.ordered ? 'ol' : 'ul', {}, node.children.map(renderAst))
    case 'listItem':
      return h('li', {}, node.children.map(renderAst))
    case 'thematicBreak':
      return h('hr')
    case 'blockquote':
      return h('blockquote', {}, node.children.map(renderAst))
    case 'link':
      return h('a', { href: node.url, target: '_blank' }, node.children.map(renderAst))
    default:
      // 其它未实现类型
      return h('span', { }, `[${node.type}]`)
  }
}
```

## 第三步：封装 Vue 组件

整合上述逻辑，我们可以构建一个 Vue 组件。鉴于直接生成 VNode 的特性，采用函数式组件或显式 `render` 函数最为适宜。

```vue
<template>
  <component :is="VNodeTree" />
</template>

<script setup>
import { computed, h, shallowRef, watchEffect } from 'vue'
import { unified } from 'unified'
import remarkParse from 'remark-parse'

const props = defineProps({
  mdText: {
    type: String,
    default: ''
  }
})

const ast = shallowRef(null)
const parser = unified().use(remarkParse)

watchEffect(() => {
  ast.value = parser.parse(props.mdText)
})

// AST 渲染函数 (同上文 renderAst 函数)
function renderAst(node) { ... }

const VNodeTree = computed(() => renderAst(ast.value))

</script>
```

现在就可以像使用普通组件一样使用它了：

```vue
<template>
  <MarkdownRenderer :mdText="markdownContent" />
</template>

<script setup>
import { ref } from 'vue'
import MarkdownRenderer from './MarkdownRenderer.vue'

const markdownContent = ref('# Hello Vue\n\nThis is rendered via AST!')
</script>
```

## AST 方案的巨大优势

切换到 AST 赛道后，我们获得了前所未有的超能力：

1. **原生集成，性能卓越**：我们不再需要 `v-html` 的暴力刷新，也不再需要 `morphdom` 这样的“外援”。所有更新都交由 Vue 自己的 Diff 算法处理，这不仅性能极高，而且完全符合 Vue 的设计哲学，是真正的“自己人”。
2. **高度灵活性与可扩展性**：AST 作为可编程的 JavaScript 对象，为定制化处理提供了坚实基础：
   - **元素替换**：可将原生元素（如 `<h2>`）无缝替换为自定义 Vue 组件（如 `<FancyHeading>`），仅在 `renderAst` 函数中调整对应 `case` 逻辑即可。
   - **逻辑注入**：可便捷地为外部链接 `<a>` 添加 `target="_blank"` 与 `rel="noopener noreferrer"` 属性，或为图片 `<img>` 包裹懒加载组件，此类操作在 AST 层面易于实现。
   - **生态集成**：充分利用 `unified` 丰富的插件生态（如 `remark-gfm` 支持 GFM 语法，`remark-prism` 实现代码高亮），仅需在处理器链中引入相应插件（`.use(pluginName)`）。
3. **关注点分离**：解析逻辑（`remark`）、渲染逻辑（`renderAst`）和业务逻辑（Vue 组件）被清晰地分离开来，代码结构更清晰，维护性更强。
4. **类型安全与可预测性**：相较于操作字符串或原始 HTML，基于结构化 AST 的渲染逻辑更易于进行类型校验与逻辑推理。

## 结论：从功能实现到架构优化的演进

回顾优化历程：

- **v-html**：实现简单，但存在性能与安全性隐患。
- **分块更新**：缓解了部分性能问题，但方案存在局限性。
- **morphdom**：有效提升了性能与用户体验，但与 Vue 核心机制存在隔阂。
- **AST + 函数式渲染**：回归 Vue 原生范式，提供了性能、灵活性、可维护性俱佳的终极解决方案。

通过采用 AST，我们不仅解决了具体的技术挑战，更重要的是实现了思维范式的转变——从面向结果（HTML 字符串）的编程，转向面向过程与结构（AST）的编程。这使我们能够深入内容本质，从而实现对渲染流程的精确控制。

本次从“全量刷新”到“结构化渲染”的优化实践，不仅是一次性能提升的技术过程，更是一次深入理解现代前端工程化思想的系统性探索。最终实现的 Markdown 渲染方案，在性能、功能性与架构优雅性上均达到了较高水准。
