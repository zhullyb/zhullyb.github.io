<template>
	<div>
		<div v-for="post in posts" :key="post.path" class="post-item">
			<p class="date">{{ post.date?.split(' ')[0] }}</p>

			<p>
				<NuxtLink :to="post.path" prefetchOn="interaction">{{ post.title }}</NuxtLink>
			</p>
		</div>
		<Pagination :currentPage="page" :totalPages="pageCount" :urlPrefix="`/archives`" />
	</div>
</template>

<script setup lang="ts">
	import type { Post } from '~/types/post'

	const route = useRoute()
  const { locale } = useI18n()
	const page = route.params.page ? parseInt(route.params.page as string) || 1 : 1

	const pageSize = 10
  const contentLang = computed(() => locale.value === 'zh' ? 'zh-CN' : 'en')

	const posts = (
		await useAsyncData(`index-page-${page}-${locale.value}`, () =>
			queryCollection('posts')
        .where('lang', '=', contentLang.value)
				.order('date', 'DESC')
				.skip((page - 1) * pageSize)
				.limit(pageSize)
				.select('title', 'date', 'path', 'tags')
				.all()
		)
	).data as Ref<Post[]>

	const total = (await useAsyncData(`posts-nums-total-${locale.value}`, () => queryCollection('posts').where('lang', '=', contentLang.value).count()))
		.data as Ref<number>

	const pageCount = Math.max(1, Math.ceil((total.value ?? 0) / pageSize))

	if (posts.value && posts.value.length === 0 && page > 1) {
		throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
	}
</script>

<style lang="less" scoped>
	.post-item {
		margin-bottom: 20px;
	}

	.date {
		color: #666;
		font-size: 0.9em;

		.dark-mode({
      color: #aaa;
    });
	}
</style>
