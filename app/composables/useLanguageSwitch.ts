export const useLanguageSwitch = () => {
  const { locale } = useI18n()
  const route = useRoute()
  const localePath = useLocalePath()

  const toggleLang = async () => {
    const newLocale = locale.value === 'zh' ? 'en' : 'zh'

    // 1. 检查是否是文章详情页
    if (route.params.year && route.params.month && route.params.day && route.params.slug) {
      const { year, month, day, slug } = route.params
      const contentPath = `/${year}/${month}/${day}/${slug}`

      try {
        const count = await queryCollection('posts')
          .path(contentPath)
          .where('lang', '=', newLocale === 'zh' ? 'zh-CN' : 'en')
          .count()

        if (count === 0) {
          alert(newLocale === 'en' ? 'English version not available' : '暂无中文版本')
          return
        }
      } catch (e) {
        console.error('Failed to check article existence:', e)
      }
    }

    // 2. 检查是否是标签页
    if (route.params.tag) {
      const tag = decodeURIComponent(route.params.tag as string)
      try {
        const count = await queryCollection('posts')
          .where('lang', '=', newLocale === 'zh' ? 'zh-CN' : 'en')
          .where('tags', 'LIKE', `%"${tag}"%`)
          .count()

        if (count === 0) {
          alert(newLocale === 'en' ? 'No articles with this tag in English' : '该标签下暂无中文文章')
          return
        }
      } catch (e) {
        console.error('Failed to check tag existence:', e)
      }
    }

    let newPath = localePath(route.fullPath, newLocale)

    // 3. 检查是否是归档页的分页 (archives/page/[page])
    if (route.path.includes('/archives/page/')) {
      newPath = localePath('/archives', newLocale)
    }
    // 4. 检查是否是普通分页页 (/page/[page])
    else if (route.path.startsWith(localePath('/page/', locale.value))) {
      // navigateTo(localePath('/', newLocale))
      // return
      newPath = localePath('/', newLocale)
    }

    navigateTo(newPath.endsWith('/') ? newPath : newPath + '/')
  }

  return {
    toggleLang
  }
}
