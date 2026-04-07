<script setup lang="ts">
  const appConfig = useAppConfig()
  const route = useRoute()
  const { locale } = useI18n()

  const { data: page } = await useAsyncData(`page-${route.path}-${locale.value}`, () => {
    return queryCollection('others')
      .path('/about')
      .where('lang', '=', locale.value === 'zh' ? 'zh-CN' : 'en')
      .first()
  })

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
