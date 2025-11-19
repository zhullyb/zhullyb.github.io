---
title: Array Field Filtering Challenges and Performance Optimization in Nuxt Content v3
date: 2025-10-20 21:52:59
sticky:
tags:
- Nuxt
- Nuxt Content
- JavaScript
---

Nuxt Content is a powerful module in the Nuxt ecosystem for handling Markdown, YAML, and other content types. Recently, while migrating my blog from Hexo to **Nuxt v4 + Nuxt Content v3**, I encountered a tricky issue: the v3 default query API **does not directly provide** support for "contains" (`$contains`) operations on array fields.

For example, here's the Front Matter of the blog post I'm currently writing:

```markdown
---
title: Array Field Filtering Challenges in Nuxt Content v3
date: 2025-10-20 21:52:59
sticky:
tags:
- Nuxt
- Nuxt Content
- JavaScript
---
```

My goal was to create a **Tag page** that lists all articles containing a specific tag (e.g., 'Nuxt').

## The Convenience of v2 and the Limitations of v3

In Nuxt Content v2, data was stored based on the file system, and the query approach abstracted file content with a syntax similar to **MongoDB's JSON document queries**. We could easily use the `$contains` method to retrieve all articles with the "Nuxt" tag:

```typescript
const tag = decodeURIComponent(route.params.tag as string)

const articles = await queryContent('posts')
  .where({ tags: { $contains: tag } })  // ✅ MongoDB-style queries in v2
  .find()
```

However, when using **Nuxt Content v3's `queryCollection` API**, we naturally try to use the `.where()` method for filtering:

```typescript
const tag = decodeURIComponent(route.params.tag as string)

const { data } = await useAsyncData(`tag-${tag}`, () =>
    queryCollection('posts')
        .where(tag, 'in', 'tags')  // ❌ This will error because the first parameter must be a field name
        .order('date', 'DESC')
        .select('title', 'date', 'path', 'tags')
        .all()
)
```

Unfortunately, this approach doesn't work. The `.where()` method signature requires the field name as the first parameter: `where(field: keyof Collection | string, operator: SqlOperator, value?: unknown)`.

Since Nuxt Content v3 **uses SQLite as its underlying local database**, all queries must follow SQL-like syntax. If the design doesn't provide built-in operators for array fields (such as an SQL equivalent of `$contains`), the eventual solution often feels somewhat "awkward."

## Initial Implementation: Sacrificing Performance with "Fetch All"

Following a "migrate quickly, optimize later" approach, I wrote the following code:

```typescript
// Initial implementation: fetch all and filter with JS
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

While this method met the requirements, it came with obvious performance costs: **bloated `_payload.json` file sizes.**

In Nuxt projects, `_payload.json` stores dynamic data such as `useAsyncData` results. With the fetch-all approach, **every Tag page** loads a `_payload.json` containing information for all articles, causing data redundancy. Many tag pages only need data for one or two articles but are forced to load information for all articles, severely impacting performance.

![The tags directory occupies 2.9MiB, the largest of all directories](https://static.031130.xyz/uploads/2025/10/20/a748878c03c64.webp)

![_payload.json](https://static.031130.xyz/uploads/2025/10/20/8ef786d873da1.webp)

## A Clever Solution: Leveraging SQLite's Storage Characteristics for Optimization

To reduce the query results returned by `useAsyncData`, I searched through Nuxt Content's GitHub Discussions and found [a "clever" solution proposed during v3.alpha.8](https://github.com/nuxt/content/discussions/2955).

Since Nuxt Content v3 uses an SQLite database, the **`tags` array originally defined in Front Matter (via `z.array()`) is ultimately stored as a JSON string** in the database (you can view the exact format in the `.nuxt/content/sql_dump.txt` file).

![sql_dump.txt](https://static.031130.xyz/uploads/2025/10/20/b70036c55bb29.webp)

This means we can leverage SQLite's **string operation** features by using the **`LIKE` operator with wildcards** to perform array containment filtering, essentially querying whether the JSON string contains a specific substring:

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

Below are the file sizes after optimization and regeneration - the reduction is quite significant:

- Tags directory size: 2.9MiB → 1.4MiB
- Individual _payload.json size: 23.1KiB → 1.01 KiB

Through this method, we successfully pushed the query logic down to the database layer, avoided unnecessary full data transfers, significantly reduced the size of `_payload.json` in individual directories, and achieved performance optimization.

![Tags directory size reduction](https://static.031130.xyz/uploads/2025/10/20/007e72e7b476d.webp)

![_payload.json](https://static.031130.xyz/uploads/2025/10/20/17ba3ccbbdf9e.webp)

## See Also

[queryCollection - Nuxt Content](https://content.nuxt.com/docs/utils/query-collection#wherefield-keyof-collection-string-operator-sqloperator-value-unknown)

[How do you query `z.array()` fields (e.g. tags) in the latest nuxt-content module (v3.alpha.8) · nuxt/content · Discussion #2955](https://github.com/nuxt/content/discussions/2955)
