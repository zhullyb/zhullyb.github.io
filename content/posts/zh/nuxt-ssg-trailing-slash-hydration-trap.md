---
title: Nuxt SSG 博客的尾斜杠到底怎么加？
date: 2026-05-28
tags:
- Nuxt
- Vue.js
- Front-End
- SSG
---

本站是用 Nuxt v4 + Nuxt Content v3 + i18n 搭出来的纯 SSG 博客。开站时随手定了一个看似无关紧要的策略——**所有页面 URL 以 `/` 结尾**。

听起来一行配置就该完事的事，做下来才发现 Nuxt 在尾斜杠这件事上**至今没有一个统一的官方开关**（[nuxt/nuxt#15462](https://github.com/nuxt/nuxt/issues/15462) 这个 issue 从 2022 年挂到现在），整套策略最后是靠**六个不同层面**拼出来的。这篇就把站点里所有跟 trailing slash 相关的配置完整盘一遍，留作给自己和后人的备忘。

## 为什么要尾斜杠

简单提一句动机：

- 同一篇文章 `/2026/05/28/foo` 和 `/2026/05/28/foo/` 在搜索引擎眼里**理论上是两个 URL**，要么你给一个 canonical，要么干脆只允许一种形态；
- SSG 产物里"目录形态"更自然——`about/index.html` 比 `about.html` 更便于嵌套子页面、也更符合直觉；
- 风格上，我个人更喜欢看 URL 末尾那个斜杠。
- 在我的博客重构前使用的 hexo 框架就是这样的，我希望保留原有 URL 不变。

确定了"全部带斜杠"这个目标，下面要做的事就是**让站点的每一个发出 URL 的地方、每一个接收 URL 的地方、每一个用 URL 做 key 的地方都遵守这条约定**。

## Layer 1：SEO 层

最先想到的是 SEO，所以 `@nuxtjs/seo` 的配置里：

```ts
// nuxt.config.ts
site: {
  trailingSlash: true,
}
```

这个开关**只影响** canonical link、sitemap.xml、robots.txt、OpenGraph URL 等 SEO 模块生成的 URL。它不会改你页面里实际渲染出来的 `<a href>`，也不会拦截入站请求。但既然它是"对外发布我自己的 URL 形态"，配上就对了。

## Layer 2：出站链接

第二层是页面里 `<NuxtLink>` 渲染出来的 `href`。Nuxt 4 提供了 experimental 配置：

```ts
// nuxt.config.ts
experimental: {
  defaults: {
    nuxtLink: { trailingSlash: 'append' }
  }
}
```

打开以后，全站任何 `<NuxtLink to="/about">` 渲染出来都是 `href="/about/"`，**不管你 `to` 写没写斜杠**。

需要注意的边界：

- 这个配置**不影响** `router.push('/about')` 这种代码侧的导航，所以代码里手动 push 时还得自己拼。本站基本走 `localePath()` + `NuxtLinkLocale`，绕过了这个雷区。
- `localePath('/tags')` 拼出来的 `/tags`，外面再手动 `+ '/' + tagName` 的话，最后一段不带 `/`，**但** NuxtLink 的 `'append'` 会兜底再补一次。比如：

  ```vue
  <NuxtLink :to="`${localePath('/tags')}/${encodeURIComponent(tag)}`">
  ```

  实际渲染出来的 href 是 `/tags/Foo/`。

## Layer 3：硬编码的链接

虽然有了 `'append'` 兜底，但项目里还是把所有硬编码的链接都直接写成带斜杠的形式，作为第二道防线：

```vue
<!-- FooterContent.vue -->
<NuxtLinkLocale to="/donate/" aria-label="Donate">
```

```ts
// Pagination.vue
function getPageUrl(page: number) {
  if (page < 1 || page > props.totalPages) return '#'
  return page === 1 ? `${props.urlPrefix}/` : `${props.urlPrefix}/page/${page}/`
}
```

养成这个习惯有个好处：将来如果 Nuxt 把 `experimental.defaults.nuxtLink.trailingSlash` 又改名了或者拿掉了（experimental API 嘛，懂的都懂），站点也不会因为这个一夜暴毙。

## Layer 4：Prerender 产物落地形态

SSG 阶段是 Nitro 在干活。它有个**默认开启**的配置叫 `prerender.autoSubfolderIndex`——会把 prerender 出来的每个页面落到 `<path>/index.html`，而不是 `<path>.html`。

```
.output/public/
├── about/
│   ├── index.html
│   └── _payload.json
├── 2026/
│   └── 05/
│       └── 28/
│           └── nuxt-ssg-trailing-slash-hydration-trap/
│               ├── index.html
│               └── _payload.json
└── ...
```

这一步意味着，无论是 Vercel 这种 serverless 平台，还是 Nginx / Caddy，请求 `/about` 和 `/about/` 两种形态，**静态文件服务器都能 fallback 到同一份 `about/index.html`**——所以"用户输错斜杠也能开页"这件事根本不需要应用层兜底。

> 顺便：本站还显式列了几条 prerender route：
>
> ```ts
> nitro: {
>   prerender: {
>     routes: [
>       '/rss.xml',
>       '/en/rss.xml',
>       '/search/sections.json',
>       '/tags/Vue.js',     // 带 . 的标签页，crawler 不会自动跟进
>       ...Object.keys(blogConfig.redirects)
>     ]
>   }
> }
> ```
>
> 这些是 crawler 抓不到、必须显式喂的，跟尾斜杠没直接关系，但放在这里作为完整的 nitro 配置一并列出。

## Layer 5：入站 URL 规范化（纯前端）

到这里 SEO、出站链接、产物落地都齐了，但**有一类场景还没覆盖**——用户手敲一个没斜杠的 URL（或者外部跳转过来），地址栏里挂着 `/about`，需要不需要把它改写成 `/about/`？

经典做法是 HTTP 301。但本站是**双平台部署（Vercel + Caddy）**，301 就得两份规则，能避免就避免。而且 Vercel 是把 SSG 产物放在 CDN 上的，301 写在 `vercel.json` 里也算半个绑定方案，不够纯粹。

所以这一层走**纯前端**：一个全局 client middleware。

```ts
// app/middleware/trailing-slash.global.ts
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return
  if (to.path === '/' || to.path.endsWith('/')) return

  // 跳过 favicon.ico、rss.xml 这类带后缀的资源路径
  const lastSegment = to.path.slice(to.path.lastIndexOf('/') + 1)
  if (lastSegment.includes('.')) return

  return navigateTo(
    { path: to.path + '/', query: to.query, hash: to.hash },
    { replace: true }
  )
})
```

几个细节：

- **`import.meta.server` 直接 return。** SSG prerender 阶段 Nitro 自己已经归一化了；如果在 server 端再 `navigateTo`，可能在产物里写出非预期的 30x 跳转。
- **`replace: true`** 让浏览器**替换**当前 history 条目，不会留一条"刚刚那个没斜杠的版本"的返回栈。
- **排除带 `.` 的路径**，避免误把静态资源也加上斜杠。

这层做完后，全链路 0 个 HTTP 301，配置上也不绑任何一家部署平台。

## Layer 6：`useAsyncData` 的 key（隐藏的雷区）

前五层做完，URL 的形态已经全部规范化，但还有一层非常隐蔽的地方需要照顾——**`useAsyncData` 的 key**。

很容易写出这种代码：

```ts
const { data } = useAsyncData(
  `randomIndex${route.path}`,  // ← 雷
  async () => ...
)
```

问题是 `route.path` 在 SSR / client / prerender / SPA 导航这四种上下文里**不一定一致**。一旦 key 在 SSR 时算出 `randomIndex/about`、客户端水合时算出 `randomIndex/about/`，payload 命中失败，整个 `useAsyncData` 在客户端会**重跑一遍**，对应组件直接退化成 CSR。

本站的处理是：**所有 `useAsyncData` 的 key 都不沾 `route.path`**，要带路由信息就用 `route.name` + `route.params`：

```ts
const route = useRoute()
const routeKey = `${String(route.name ?? 'unknown')}-${JSON.stringify(route.params)}`

const { data: randomIndex } = useAsyncData(
  `randomIndex-${routeKey}`,
  async () => Math.floor(Math.random() * appConfig.appearance.backgrounds.length)
)
```

`route.name` 是 vue-router 内部的路由名（i18n 自动生成的形如 `about___zh`），`route.params` 是动态段，**两者在任何上下文都一致**。最终构建出来的 `_payload.json` key 形如 `randomIndex-about___zh-{}`，跟尾斜杠完全脱钩。

## 整体回顾

整个站点的尾斜杠策略可以一句话总结：

> Prerender 时让 Nitro 落到 `xxx/index.html`，SEO 由 `site.trailingSlash` 负责对外发布形态，出站链接由 `nuxtLink.trailingSlash: 'append'` 自动补斜杠（+ 硬编码做第二道防线），入站直链由全局 client middleware 兜底，`useAsyncData` 的 key 一律不依赖 `route.path` —— **全链路 0 个 HTTP 301**。

对照表：

| 层 | 配置/代码 | 解决什么 |
|---|---|---|
| SEO | `site.trailingSlash: true` | canonical / sitemap / OG URL |
| 出站链接 | `nuxtLink.trailingSlash: 'append'` | `<NuxtLink>` 渲染出来的 href |
| 硬编码 | `to="/donate/"` 这种 | 兜底 + 风格统一 |
| 产物落地 | `nitro.prerender.autoSubfolderIndex`（默认） | 让 `/about` 和 `/about/` 命中同一文件 |
| 入站 URL | global client middleware | 用户输错 / 外链跳转的地址栏规范化 |
| 数据层 | `useAsyncData` 的 key 用 `route.name + params` | 避免两端 key 错位导致水合崩盘 |

## 小插曲：这套方案是怎么来的

说起来这套配置并不是我开站时一次性想清楚的，最后两层（client middleware 和 `useAsyncData` 的 key）其实是前几天 debug 一个怪现象时被迫补上去的。

那天我打开自己博客的 [/about/](/about/) 页，注意到一个怪事——背景图每次进来都"啪"地换一张。F12 一看，控制台挂着 Vue 的 `Hydration completed but contains mismatches.`。

![控制台报错](https://static.031130.xyz/uploads/2026/05/28/e1dab1bdd0721.webp)

明明 SSG 出来的纯静态产物，HTML 里 `<div id="__nuxt">` 都齐齐整整，凭什么客户端不认账？

`useAsyncData` 是怎么命中 payload 的——key 一致就读 payload，不一致就重跑 fetch。那只能是 key 不一致。把构建产物的 `_payload.json` 抠出来看：

```json
{"randomIndex/about": ...}
```

key 是 `randomIndex/about`，**没有尾斜杠**。可这个文件本身在 `.output/public/about/_payload.json`，浏览器访问的 URL 是 `/about/`，客户端 `route.path` 拼出来的 key 是 `randomIndex/about/`——**多了一个斜杠**。

`Math.random()` 在客户端重跑，DOM 与服务端渲染对不上，水合崩盘，整页 re-render。

罪魁祸首就是 `route.path` 在 SSR / client 两端因为 Nitro prerender 的归一化时机而不一致。修起来不难——`useAsyncData` 的 key 改用 `route.name + params`，跟路径解耦就完了。

修完才想起来，地址栏里那个没斜杠的 URL 还在挂着，于是又顺手把 client middleware 也加上，把"用户输错斜杠"这条路径也一并接住。

完了发现这是个值得正经写一篇下来留底的事——所以才有了这篇文章。
