/**
 * 全站客户端尾斜杠规范化中间件
 *
 * 背景：
 *   - 站点策略是所有页面 URL 以 `/` 结尾（与 site.trailingSlash: true、
 *     nuxtLink.trailingSlash: 'append' 配合，便于 SEO/canonical/sitemap）。
 *   - 但本项目是 SSG（部署在 Vercel + Caddy 两个站点），无法依赖单一 host
 *     的 server-side 301。该中间件在客户端兜底，把用户手动输入或外部跳来的
 *     无尾斜杠 URL 在 SPA 导航层做一次规范化。
 *
 * 不解决什么：
 *   - 这里 **不** 修复 SSR 与 client 之间 `route.path` 因为 Nitro prerender
 *     归一化造成的差异（那个差异由 useAsyncData 的 key 改用 route.name + params
 *     来规避）。客户端 middleware 无法改写已经生成在 HTML 里的 payload key。
 *
 * 行为：
 *   - 仅 client 端生效，跳过根路径、跳过看起来是文件的路径（含 .），跳过
 *     query/hash 单独的场景。
 */
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return
  if (to.path === '/' || to.path.endsWith('/')) return
  // 避免对静态资源 / 带后缀的 URL 做重定向
  const lastSegment = to.path.slice(to.path.lastIndexOf('/') + 1)
  if (lastSegment.includes('.')) return

  return navigateTo(
    { path: to.path + '/', query: to.query, hash: to.hash },
    { replace: true }
  )
})
