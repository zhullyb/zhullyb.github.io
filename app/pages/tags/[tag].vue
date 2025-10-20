<template>
	<DefaultLayout :title="`Tag: ${route.params.tag}`">
		<div v-for="post in Posts" :key="post.path" class="post-item">
			<p class="date">{{ post.date?.split(' ')[0] }}</p>

			<p>
				<NuxtLink :to="getUrlByPost(post)">{{ post.title }}</NuxtLink>
			</p>
		</div>
	</DefaultLayout>
</template>

<script lang="ts" setup>
	import type { Post } from '~/types/post'

	const route = useRoute()
	const tag = decodeURIComponent(route.params.tag as string)

	// 使用 LIKE 查询 JSON 数组,添加引号确保精确匹配标签
	// tags 在数据库中存储为 JSON 格式: ["Github","Github Action","CI/CD"]
	// 使用 %"Github"% 可以精确匹配 "Github"，避免匹配到 "Github Action"
	const { data } = await useAsyncData(`tag-${route.params.tag}`, () =>
		queryCollection('posts')
			.where('tags', 'LIKE', `%"${tag}"%`)
			.order('date', 'DESC')
			.select('title', 'date', 'path', 'tags')
			.all()
	)

	const Posts = data as Ref<Post[]>

	if (!Posts.value || Posts.value.length === 0) {
		throw createError({ statusCode: 404, statusMessage: 'Tag not found', fatal: true })
	}
</script>

<style lang="less" scoped>
	.post-item {
		margin-bottom: 20px;
	}

	.date {
		color: #666;
		font-size: 0.9em;
	}
</style>
