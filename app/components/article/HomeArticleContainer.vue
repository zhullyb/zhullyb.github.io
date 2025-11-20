<template>
	<div>
		<template v-for="(post, index) in processedPosts" :key="post.path">
			<div class="post-item">
				<NuxtLinkLocale class="title" :to="post.path">{{ post.title }}</NuxtLinkLocale>
				<NuxtLinkLocale class="description" :to="post.path">{{
					post.excerpt
				}}</NuxtLinkLocale>
				<div class="post-meta">
					<MaterialSymbolsCalendarMonthRounded />
					<span class="date">{{ post.date?.split(' ')[0] }}</span>
					<IonPricetagsOutline style="font-size: 0.9em" />
					<NuxtLink
						class="tags"
						v-for="tag in post.tags"
						:key="tag"
						:to="`${localePath('/tags')}/${encodeURIComponent(tag)}`"
						prefetchOn="interaction"
						>{{ '#' + tag }}</NuxtLink
					>
				</div>
			</div>
		</template>
		<Pagination :currentPage="page" :totalPages="pageCount" />
	</div>
</template>

<script setup lang="ts">
	import type { Post } from '~/types/post'
	import { processExcerpt } from '~/utils/extractExcerpt'

	const route = useRoute()
	const { locale } = useI18n()
	const localePath = useLocalePath()
	const page = route.params.page ? parseInt(route.params.page as string) || 1 : 1

	const pageSize = 10
	const contentLang = computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en'))

	const posts = (
		await useAsyncData(`index-page-${page}-${locale.value}`, () =>
			queryCollection('posts')
				.where('lang', '=', contentLang.value)
				.order('date', 'DESC')
				.skip((page - 1) * pageSize)
				.limit(pageSize)
				.select('title', 'date', 'path', 'tags', 'body')
				.all()
		)
	).data as Ref<Post[]>

	const processedPosts = computed(() => {
		if (!posts.value) return []
		return posts.value.map(post => ({
			...post,
			excerpt: processExcerpt((post as any).body, 400)
		}))
	})

	const total = (
		await useAsyncData(`posts-total-${locale.value}`, () =>
			queryCollection('posts').where('lang', '=', contentLang.value).count()
		)
	).data as Ref<number>

	const pageCount = Math.max(1, Math.ceil((total.value ?? 0) / pageSize))

	if (posts.value && posts.value.length === 0 && page > 1) {
		throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
	}

	useHead({
		title: '竹林里有冰的博客',
		titleTemplate: '%s' // 首页不加 siteName
	})
</script>

<style lang="less" scoped>
	.post-item {
		position: relative;
		margin-bottom: 30px;

		.desktop-up({
      margin-bottom: 40px;
    });
	}

	.title {
		font-size: 1.5rem;
		font-weight: bold;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		word-break: break-word;
		margin-top: 8px;
		margin-bottom: 8px;

		.tablet-down({
        font-size: 20px;
        -webkit-line-clamp: 2;
        border-bottom: none;
        padding-bottom: 2px;
    });

		.desktop-up({
      &:hover {
        color: @active-blue;
      }
      transition: color 0.3s;
    });
	}

	.description {
		text-decoration: none;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		overflow: hidden;
		text-overflow: ellipsis;
		word-break: break-word;
		color: #333;
		margin-top: 8px;
		margin-bottom: 6px;

		.dark-mode({
      color: #ccc;
    });

		.desktop-up({
      &:hover {
        color: @active-blue;
      }
      transition: color 0.3s;
    });
	}

	.post-meta {
		overflow: hidden;
		text-overflow: ellipsis;
		word-break: break-word;
		white-space: nowrap;
    color: #666;

    .dark-mode({
      color: #aaa;
    });

		* {
			vertical-align: middle;
		}

		svg {
			margin-right: 3px;
		}

		.date {
			margin-right: 8px;
		}

		.tags {
			text-decoration: none;

			.desktop-up({
        &:hover {
          color: @active-blue;
        }
        transition: color 0.3s;
      });
		}

		.tags + .tags {
			margin-left: 5px;
		}
	}
</style>
