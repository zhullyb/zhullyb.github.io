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

	const allPosts = (
		await useAsyncData(`tag-${route.params.tag}`, () =>
			queryCollection('posts')
				.order('date', 'DESC')
				.select('title', 'date', 'path', 'tags')
				.all()
		)
	).data as Ref<Post[]>

	const Posts = computed(() => {
		return allPosts.value.filter(post =>
			typeof post.tags?.map === 'function'
				? post.tags?.includes(decodeURIComponent(route.params.tag as string))
				: false
		)
	})

	if (Posts.value.length === 0) {
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
