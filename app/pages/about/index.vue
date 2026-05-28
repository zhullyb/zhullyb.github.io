<script setup lang="ts">
  const appConfig = useAppConfig()
  const { locale } = useI18n()

  // 使用静态 key + locale，避免依赖 route.path（在 SSR/client 间因尾斜杠不同而不一致）
  const { data: page } = await useAsyncData(
    `page-about-${locale.value}`,
    () => {
      return queryCollection('others')
        .path('/about')
        .where('lang', '=', locale.value === 'zh' ? 'zh-CN' : 'en')
        .first()
    }
  )

  useHead({
    link: [
      {
        rel: 'stylesheet',
        href: appConfig.assets.markdownStylesheet
      }
    ]
  })
</script>

<template>
  <DefaultLayout :title="page?.title">
    <ContentRenderer v-if="page" :value="page" tag="article" class="markdown-body" />
  </DefaultLayout>
</template>

<style lang="less" scoped>
  @import '~/assets/styles/github-markdown-rewrite.less';
</style>
