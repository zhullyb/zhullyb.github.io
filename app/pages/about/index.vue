<script setup lang="ts">
	const route = useRoute()

	const { data: page } = await useAsyncData('page-' + route.path, () => {
		return queryCollection('others').path('/others/about').first()
	})

	useHead({
		link: [
			{
				rel: 'stylesheet',
				href: 'https://s4.zstatic.net/ajax/libs/github-markdown-css/5.8.1/github-markdown.min.css'
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
