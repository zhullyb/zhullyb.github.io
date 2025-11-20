<template>
	<DefaultLayout :title="`${$t('tag')}: ${route.params.tag}`">
		<div v-for="post in Posts" :key="post.path" class="post-item">
			<p class="date">{{ post.date?.split(' ')[0] }}</p>

			<p>
				<NuxtLinkLocale :to="post.path">{{ post.title }}</NuxtLinkLocale>
			</p>
		</div>
	</DefaultLayout>
</template>

<script lang="ts" setup>
	import type { Post } from '~/types/post'

	const route = useRoute()
	const { locale } = useI18n()
	const tag = decodeURIComponent(route.params.tag as string)
	const contentLang = computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en'))

	// 使用 LIKE 查询 JSON 数组,添加引号确保精确匹配标签
	// tags 在数据库中存储为 JSON 格式: ["Github","Github Action","CI/CD"]
	// 使用 %"Github"% 可以精确匹配 "Github"，避免匹配到 "Github Action"
	const { data } = await useAsyncData(`tag-${route.params.tag}-${locale.value}`, () =>
		queryCollection('posts')
			.where('lang', '=', contentLang.value)
			.where('tags', 'LIKE', `%"${tag}"%`)
			.order('date', 'DESC')
			.select('title', 'date', 'path', 'tags')
			.all()
	)

	const Posts = data as Ref<Post[]>

	const { t } = useI18n()

	if (!Posts.value || Posts.value.length === 0) {
		throw createError({ statusCode: 404, statusMessage: t('tag_not_found'), fatal: true })
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
