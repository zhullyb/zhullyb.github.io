<template>
	<DefaultLayout :title="post?.title">
		<ContentRenderer v-if="post" :value="post" tag="article" class="markdown-body" />
    <hr class="article-end-hr" />
    <div class="tags">
      <NuxtLink
        v-for="tag in post?.tags"
        :key="tag"
        :to="`/tags/${encodeURIComponent(tag)}`"
        prefetchOn="interaction"
      >#{{ tag }}</NuxtLink>
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
			{ name: 'keywords', content: post.value?.tags?.join(',') || '' }
		],
    link: [
      {
        rel: 'stylesheet',
        href: 'https://static.031130.xyz/res/github-markdown.css'
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
    a {
      margin-left: 0.2rem;
      &:hover {
        color: @active-blue;
      }
    }
  }
</style>
