---
title: Nuxt Content v3 中数组字段的筛选困境与性能优化
date: 2025-10-20 21:52:59
sticky:
tags:
- Nuxt
- Nuxt Content
- JavaScript
---

Nuxt Content 是 Nuxt 生态中用于处理 Markdown、YAML 等内容的强大模块。最近，我在使用 **Nuxt v4 + Nuxt Content v3** 重构博客（原为 Hexo）时，遇到了一个棘手的问题：v3 版本的默认查询 API **并未直接提供**对数组字段进行“包含”（`$contains`）操作的支持。

例如，这是我的正在写的这篇博客的 Front Matter：

```markdown
---
title: Nuxt Content v3 中数组字段的筛选困境
date: 2025-10-20 21:52:59
sticky:
tags:
- Nuxt
- Nuxt Content
- JavaScript
---
```

我的目标是创建一个 **Tag 页面**，列出所有包含特定 Tag（例如 'Nuxt'）的文章。

## v2 的便捷与 v3 的限制

在 Nuxt Content v2 中，数据基于文件系统存储，查询方式是对文件内容的抽象，模拟了类似 **MongoDB 的 JSON 文档查询**语法。我们可以轻松地使用 `$contains` 方法获取所有包含 “Nuxt” 标签的文章：

```typescript
const tag = decodeURIComponent(route.params.tag as string)

const articles = await queryContent('posts')
  .where({ tags: { $contains: tag } })  // ✅ v2 中的 MongoDB Style 查询
  .find()
```

但在使用 **Nuxt Content v3 的 `queryCollection` API** 时，我们很自然地会尝试使用 `.where()` 方法进行筛选：

```typescript
const tag = decodeURIComponent(route.params.tag as string)

const { data } = await useAsyncData(`tag-${tag}`, () =>
    queryCollection('posts')
        .where(tag, 'in', 'tags')  // ❌ 这样会报错，因为第一次参数必须是字段名
        .order('date', 'DESC')
        .select('title', 'date', 'path', 'tags')
        .all()
)
```

遗憾的是，这样是行不通的。`.where()` 的方法签名要求字段名必须作为首个参数传入：`where(field: keyof Collection | string, operator: SqlOperator, value?: unknown)`。

由于 Nuxt Content v3 **底层采用 SQLite 作为本地数据库**，所有查询都必须遵循类 SQL 语法。如果设计时未提供针对数组字段的内置操作符（例如 `$contains` 的 SQL 等价形式），最终的解决方案往往会显得比较“别扭”。

## 初版实现：牺牲性能的“全量拉取”

本着“尽快重构，后续优化”的思路，我写出了以下代码：

```typescript
// 初版实现：全量拉取后使用 JS 筛选
const allPosts = (
    await useAsyncData(`tag-${route.params.tag}`, () =>
        queryCollection('posts')
            .order('date', 'DESC')
            .select('title', 'date', 'path', 'tags')
            .all()
    )
).data as Ref<Post[]>

const Posts = computed(() => {
    return allPosts.value.filter(post =>
        typeof post.tags?.map === 'function'
            ? post.tags?.includes(decodeURIComponent(route.params.tag as string))
            : false
    )
})
```

这种方法虽然满足了需求，但也带来了明显的性能代价：**_payload.json 文件体积的膨胀。**

在 Nuxt 项目中，`_payload.json` 用于存储 `useAsyncData` 的结果等动态数据。在全量拉取的方案下，**每一个 Tag 页面** 都会加载包含所有文章信息的 `_payload.json`，造成数据冗余。很多 Tag 页面仅需一两篇文章的数据，却被迫加载了全部文章信息，严重影响了性能。

![tags 目录占据了 2.9MiB，是所有目录中最大的](https://static.031130.xyz/uploads/2025/10/20/a748878c03c64.webp)

![_payload.json](https://static.031130.xyz/uploads/2025/10/20/8ef786d873da1.webp)

## 讨巧方案：利用 SQLite 的存储特性进行优化

为了减少 `useAsyncData` 返回的查询结果，我查阅了 Nuxt Content 的 GitHub Discussions，发现[在 v3.alpha.8 版本时就有人提出了一种“巧妙”的解决方案](https://github.com/nuxt/content/discussions/2955)。

由于 Nuxt Content v3 使用 SQLite 数据库，原本在 Front Matter 中定义的 **`tags` 数组（通过 `z.array()` 定义）最终会以 JSON 字符串的形式存储**在数据库中（具体格式可在 `.nuxt/content/sql_dump.txt` 文件中查看）。

![sql_dump.txt](https://static.031130.xyz/uploads/2025/10/20/b70036c55bb29.webp)

这意味着我们可以利用 SQLite 的**字符串操作**特性，通过 **`LIKE` 动词配合通配符**来完成数组包含的筛选，本质上是查询 JSON 字符串是否包含特定子串：

```typescript
const tag = decodeURIComponent(route.params.tag as string)

const { data } = await useAsyncData(`tag-${route.params.tag}`, () =>
    queryCollection('posts')
        .where('tags', 'LIKE', `%"${tag}"%`)
        .order('date', 'DESC')
        .select('title', 'date', 'path', 'tags')
        .all()
)
```

下面是优化后重新生成的文件占用，体积减小还是非常显著的

- tags 目录体积: 2.9MiB -> 1.4MiB
- 单个 _payload.json 的体积: 23.1KiB -> 1.01 KiB

通过这种方法，我们成功将查询逻辑下推到了数据库层，避免了不必要的全量数据传输，显著降低了单个目录中 `_payload.json` 的体积，实现了性能优化。

![tags 目录体积下降](https://static.031130.xyz/uploads/2025/10/20/007e72e7b476d.webp)

![_payload.json](https://static.031130.xyz/uploads/2025/10/20/17ba3ccbbdf9e.webp)

## 参见

[queryCollection - Nuxt Content](https://content.nuxt.com/docs/utils/query-collection#wherefield-keyof-collection-string-operator-sqloperator-value-unknown)

[How do you query `z.array()` fields (e.g. tags) in the latest nuxt-content module (v3.alpha.8) · nuxt/content · Discussion #2955](https://github.com/nuxt/content/discussions/2955)
