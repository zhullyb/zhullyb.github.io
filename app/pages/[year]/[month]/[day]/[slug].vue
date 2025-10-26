<template>
	<DefaultLayout :title="post?.title">
		<ContentRenderer v-if="post" :value="post" tag="article" class="markdown-body" />
		<PostNavigation :prevPost="prevPost" :nextPost="nextPost" />
		<template #AfterMain>
			<aside>
				<TableOfContents :body="post?.body" />
			</aside>
		</template>
	</DefaultLayout>
</template>

<script setup lang="ts">
	import type { Post } from '~/types/post'
	const route = useRoute()
	const { year, month, day, slug } = route.params

	const { data: post } = await useAsyncData(`post-${year}-${month}-${day}-${slug}`, () =>
		queryCollection('posts').path(`/${year}/${month}/${day}/${slug}`).first()
	)

	if (!post.value) {
		throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true })
	}

	const surroundingPosts = (
		await useAsyncData(`surround-${year}-${month}-${day}-${slug}`, () =>
			queryCollectionItemSurroundings('posts', post.value!.path, {
				before: 1,
				after: 1,
				fields: ['title', 'path', 'date']
			}).order('date', 'DESC')
		)
	).data as unknown as Ref<Post[]>

	const prevPost = computed(() => surroundingPosts.value?.[0] || null)
	const nextPost = computed(() => surroundingPosts.value?.[1] || null)

	useHead({
		meta: [
			{ name: 'description', content: post.value?.description || '' },
			{ name: 'keywords', content: toNormalTags(post.value?.tags)?.join(',') || '' }
		]
	})
</script>

<style lang="less" scoped>
	@import '~/assets/styles/github-markdown-rewrite.less';

	aside {
		position: sticky;
		top: @header-height + 20px;
	}
</style>
