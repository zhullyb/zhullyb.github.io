<script setup lang="ts">
	const route = useRoute()

	const { data: page } = await useAsyncData('page-' + route.path, () => {
		return queryCollection('others').path(route.path).first()
	})

	if (!page.value) {
		throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
	}

  useHead({
    link: [
      {
        rel: 'stylesheet',
        href: 'https://static.031130.xyz/res/github-markdown.css'
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
