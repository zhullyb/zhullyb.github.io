---
title: "Vue Markdown Rendering Optimization in Practice (Part 2): Farewell to DOM Manipulation, Embrace AST and Functional Rendering"
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

## Recap: When `morphdom` Meets Vue

In [the previous article](/2025/07/12/vue-markdown-render-improvement-1/), we embarked on a performance optimization journey for Markdown rendering. From the most primitive full refresh with `v-html`, to block-by-block updates, we eventually brought out the "ultimate weapon" - `morphdom`. By directly comparing and manipulating the real DOM, it updates the view with minimal cost, perfectly solving the performance bottleneck and interaction state loss issues in real-time rendering.

However, a fundamental problem has always existed: in Vue's territory, bypassing Vue's Virtual DOM and Diff algorithm to let a third-party library directly "operate" on the real DOM always feels somewhat "unorthodox." It's like introducing an old master with a hammer and wrench for manual repairs in a precision automated factory. Although the job is done well, it always feels like it disrupts the original workflow and isn't "Vue" enough.

So, is there a more elegant, more "native" approach that allows us to enjoy precise updates while fully integrating with Vue's ecosystem?

With this question in mind, I consulted friends in frontend development groups.

> If you're building a renderer, your approach isn't the best practice. Each time you update, you generate the full virtual HTML, then optimize performance by subtracting from the HTML. However, the incremental part of each update is clear - why not directly use this incremental part for addition? The incremental part cannot be directly obtained through markdown-it, but a better approach is to transform at this step: first parse the Markdown structure, then use Vue's dynamic rendering capabilities to generate the DOM. This way, DOM reuse can leverage Vue's own abilities. — [j10c](https://site.j10c.cc/)

> You can use unified with the remark-parse plugin to parse markdown strings into AST, then render based on the AST using render functions. — bii & [nekomeowww](https://github.com/nekomeowww)

## New Approach: From "String Conversion" to "Structured Rendering"

Our previous solutions, whether `v-html` or `morphdom`, shared a core approach:

`Markdown String` -> `markdown-it` -> `HTML String` -> `Browser/morphdom` -> `DOM`

The problem with this pipeline is that starting from the `HTML String` step, we lose the **original structural information** of Markdown. We get a bunch of unstructured text that Vue cannot understand its internal logic and can only swallow it whole.

The new approach transforms the process into:

`Markdown String` -> `AST (Abstract Syntax Tree)` -> `Vue VNodes (Virtual Nodes)` -> `Vue` -> `DOM`

### What is AST?

**AST (Abstract Syntax Tree)** is a structured representation of source code or markup language. It parses a long string of text into a hierarchical tree-like object. For Markdown, a level-1 heading becomes a node with `type: 'heading', depth: 1`, a paragraph becomes a node with `type: 'paragraph'`, and the text within the paragraph becomes the `children` of the `paragraph` node.

Once we convert Markdown into an AST, we essentially have a "structural blueprint" of the entire document. We're no longer facing a pile of ambiguous HTML strings, but rather a clear, programmable JavaScript object.

### Our New Tools: unified and remark

To implement the `Markdown -> AST` conversion, we introduce the `unified` ecosystem.

- **[unified](https://github.com/unifiedjs/unified)**: A powerful content processing engine. Think of it as an assembly line where raw text is the raw material, and you process it through parsing, transformation, and serialization by adding different "plugins."
- **[remark-parse](https://github.com/remarkjs/remark)**: A `unified` plugin specifically responsible for parsing Markdown text into AST (specifically in [mdast](https://github.com/syntax-tree/mdast) format).

## Step 1: Parse Markdown into AST

First, we need to install the dependencies:

```bash
npm install unified remark-parse
```

Then, we can easily convert a Markdown string into an AST:

```javascript
import { unified } from 'unified'
import remarkParse from 'remark-parse'

const markdownContent = '# Hello, AST!\n\nThis is a paragraph.'

// Create a processor instance
const processor = unified().use(remarkParse)

// Parse Markdown content
const ast = processor.parse(markdownContent)

console.log(JSON.stringify(ast, null, 2))
```

Running the above code will give us a JSON object like the following, which is our coveted AST:

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

## Step 2: From AST to Vue VNodes

Having obtained the AST, the next step is to actually "construct" this "structural blueprint" into a user-visible interface. In Vue's world, the blueprint for describing UI is the Virtual Node (VNode), and the `h()` function (i.e., hyperscript) is the brush for creating VNodes.

Our task is to write a render function that can recursively traverse the AST and generate corresponding VNodes for each node type (`heading`, `paragraph`, `text`, etc.).

Here's a simple render function implementation:

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
      // Other unimplemented types
      return h('span', { }, `[${node.type}]`)
  }
}
```

## Step 3: Encapsulate Vue Component

Integrating the above logic, we can build a Vue component. Given the characteristic of directly generating VNodes, using a functional component or explicit `render` function is most appropriate.

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

// AST render function (same as renderAst function above)
function renderAst(node) { ... }

const VNodeTree = computed(() => renderAst(ast.value))

</script>
```

Now it can be used like a regular component:

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

## Huge Advantages of the AST Approach

After switching to the AST track, we gained unprecedented superpowers:

1. **Native Integration, Excellent Performance**: We no longer need the brute force refresh of `v-html`, nor do we need "external help" like `morphdom`. All updates are handled by Vue's own Diff algorithm, which is not only highly performant but also fully aligned with Vue's design philosophy - truly "one of our own."

2. **High Flexibility and Extensibility**: AST, as a programmable JavaScript object, provides a solid foundation for customized processing:
   - **Element Replacement**: Native elements (like `<h2>`) can be seamlessly replaced with custom Vue components (like `<FancyHeading>`), only requiring adjustments to the corresponding `case` logic in the `renderAst` function.
   - **Logic Injection**: Attributes like `target="_blank"` and `rel="noopener noreferrer"` can be conveniently added to external links `<a>`, or lazy-load components can wrap images `<img>` - such operations are easy to implement at the AST level.
   - **Ecosystem Integration**: Fully leverage `unified`'s rich plugin ecosystem (such as `remark-gfm` for GFM syntax support, `remark-prism` for code highlighting), only requiring the introduction of corresponding plugins in the processor chain (`.use(pluginName)`).

3. **Separation of Concerns**: Parsing logic (`remark`), rendering logic (`renderAst`), and business logic (Vue components) are clearly separated, resulting in clearer code structure and stronger maintainability.

4. **Type Safety and Predictability**: Compared to manipulating strings or raw HTML, rendering logic based on structured AST is easier to type-check and reason about.

## Conclusion: Evolution from Functional Implementation to Architectural Optimization

Reviewing the optimization journey:

- **v-html**: Simple implementation, but with performance and security concerns.
- **Block updates**: Alleviated some performance issues, but the solution had limitations.
- **morphdom**: Effectively improved performance and user experience, but existed in isolation from Vue's core mechanisms.
- **AST + Functional Rendering**: Returns to Vue's native paradigm, providing an ultimate solution with excellent performance, flexibility, and maintainability.

By adopting AST, we not only solved specific technical challenges but, more importantly, achieved a paradigm shift - from result-oriented programming (HTML strings) to process and structure-oriented programming (AST). This enables us to dive deep into the essence of content, thereby achieving precise control over the rendering process.

This optimization practice from "full refresh" to "structured rendering" is not only a technical process of performance improvement but also a systematic exploration of deeply understanding modern frontend engineering thinking. The final Markdown rendering solution achieved high standards in performance, functionality, and architectural elegance.
