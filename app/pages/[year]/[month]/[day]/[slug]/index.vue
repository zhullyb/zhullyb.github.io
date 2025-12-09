<template>
	<DefaultLayout :title="post?.title">
		<ContentRenderer v-if="post" :value="post" tag="article" class="markdown-body" />
		<hr class="article-end-hr" />
		<div class="tags">
			<IonPricetagsOutline />
			<NuxtLink
				v-for="tag in post?.tags"
				:key="tag"
				:to="`${localePath('/tags')}/${encodeURIComponent(tag)}`"
				prefetchOn="interaction"
				>#{{ tag }}</NuxtLink
			>
		</div>
		<PostNavigation :prevPost="prevPost" :nextPost="nextPost" />
		<Waline />
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
	const { locale } = useI18n()
	const localePath = useLocalePath()
	const { year, month, day, slug } = route.params

	const contentPath = computed(() => {
		return `/${year}/${month}/${day}/${slug}`
	})

	const { data: post } = await useAsyncData(
		`post-${year}-${month}-${day}-${slug}-${locale.value}`,
		() =>
			queryCollection('posts')
				.path(contentPath.value)
				.where('lang', '=', locale.value === 'zh' ? 'zh-CN' : 'en')
        .select('title', 'date', 'path', 'tags', 'body', 'description')
				.first()
	)

	if (!post.value) {
		throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true })
	}

	const surroundingPosts = (
		await useAsyncData(`surround-${year}-${month}-${day}-${slug}-${locale.value}`, () =>
			queryCollectionItemSurroundings('posts', post.value!.path, {
				before: 1,
				after: 1,
				fields: ['title', 'path', 'date', 'lang']
			})
				.where('lang', '=', locale.value === 'zh' ? 'zh-CN' : 'en')
				.order('date', 'DESC')
		)
	).data as unknown as Ref<Post[]>

	const prevPost = computed(() => surroundingPosts.value?.[0] || null)
	const nextPost = computed(() => surroundingPosts.value?.[1] || null)

	useHead({
		meta: [
			{ name: 'description', content: post.value?.description || '' },
			{ name: 'keywords', content: post.value?.tags?.join(',') || '' }
		],
		link: [
			{
				rel: 'stylesheet',
				href: 'https://s4.zstatic.net/ajax/libs/github-markdown-css/5.8.1/github-markdown.min.css'
			}
		]
	})
</script>

<style lang="less" scoped>
	@import '~/assets/styles/github-markdown-rewrite.less';

	aside {
		position: sticky;
		top: @header-height + 20px;
	}

	:deep(#waline) {
		margin-top: 3rem;
	}

	.article-end-hr {
		margin: 1rem 0;
		border: none;
		border-top: 1px solid #e1e4e8;

		.dark-mode({
      border-color: #444c56;
    });
	}

	.tags {
		margin: 1rem 0;

		* {
			vertical-align: middle;
		}

		svg {
			font-size: 0.9em;
		}

		a {
      display: inline-block;
			margin-left: 0.2rem;
			&:hover {
				color: @active-blue;
			}
		}
	}
</style>
