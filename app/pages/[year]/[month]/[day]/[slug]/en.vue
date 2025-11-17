<template>
	<DefaultLayout :title="post?.title">
		<ContentRenderer v-if="post" :value="post" tag="article" class="markdown-body" />
    <hr class="article-end-hr" />
		<template #AfterMain>
			<aside>
				<TableOfContents :body="post?.body" />
			</aside>
		</template>
	</DefaultLayout>
</template>

<script setup lang="ts">
	const route = useRoute()
	const { year, month, day, slug } = route.params

	const { data: post } = await useAsyncData(`post-${year}-${month}-${day}-${slug}-en`, () =>
		queryCollection('posts').path(`/${year}/${month}/${day}/${slug}-en`).first()
	)

	if (!post.value) {
		throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true })
	}

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
    ],
    htmlAttrs: {
      lang: 'en'
    }
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
