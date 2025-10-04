<template>

	<div>

		<div v-for="post in posts" :key="post.path" class="post-item">
			 <NuxtLink :to="getUrlByPost(post)" class="post-link"></NuxtLink>
			<h2 class="title"> {{ post.title }} </h2>
			 <span class="description">{{ post.description }}</span
			>
			<div class="post-meta">
				 <span class="date">{{ post.date?.split(' ')[0] }}</span
				> <NuxtLink
					class="tags"
					v-for="tag in toNormalTags(post.tags)"
					:key="tag"
					:to="`/tags/${encodeURIComponent(tag)}`"
					>{{ '#' + tag }}</NuxtLink
				>
			</div>

		</div>
		 <Pagination :currentPage="page" :totalPages="pageCount" />
	</div>

</template>

<script setup lang="ts">
import type { Post } from '~/types/post'

const route = useRoute()
const page = route.params.page ? parseInt(route.params.page as string) || 1 : 1

const pageSize = 10

const posts = (
	await useAsyncData(`index-page-${page}`, () =>
		queryCollection('posts')
			.order('date', 'DESC')
			.skip((page - 1) * pageSize)
			.limit(pageSize)
			.select('title', 'date', 'path', 'description', 'tags')
			.all()
	)
).data as Ref<Post[]>

const total = (await useAsyncData('posts-total', () => queryCollection('posts').count()))
	.data as Ref<number>

const pageCount = Math.max(1, Math.ceil((total.value ?? 0) / pageSize))

if (posts.value && posts.value.length === 0 && page > 1) {
	throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}
</script>

<style lang="less" scoped>
.post-item {
    position: relative;
    margin-bottom: 20px;

    .desktop-up({
        padding: 20px;
        transition: box-shadow 0.2s;
        
        &:hover {
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
    });
}

.post-link {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
}

.title {
    margin-bottom: 5px;
    font-size: 20px;
    font-weight: bold;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;

    .tablet-down({
        -webkit-line-clamp: 2;
        border-bottom: none;
        padding-bottom: 2px;
    });

    a {
        color: #333;
        text-decoration: none;
    }
}

.post-meta {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;

    * + * {
        margin-left: 5px;
    }

    .date {
        color: #666;
        font-size: 0.9em;
    }

    .tags {
        position: relative;
        z-index: 2;
        color: #666;
        text-decoration: none;
        
        &:hover {
            color: @active-blue;
        }
    }
}


.description {
    color: #333;
    text-decoration: none;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
}
</style>

