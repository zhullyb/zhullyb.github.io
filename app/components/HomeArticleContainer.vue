<template>
    <div>
        <div v-for="post in posts" :key="post.path" class="post-item">
            <h2 class="title">
                <NuxtLink :to="getUrlByPost(post)">{{ post.title }}</NuxtLink>
            </h2>
            <NuxtLink class="description" :to="getUrlByPost(post)">{{ post.description }}</NuxtLink>
            <div class="post-meta">
                <span class="date">{{ post.date?.split(" ")[0] }}</span>
                <NuxtLink class="tags" v-for="tag in toNormalTags(post.tags)" :key="tag" :to="`/tags/${encodeURIComponent(tag)}`">{{ '#' + tag }}</NuxtLink>
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

const posts = (await useAsyncData(`index-page-${page}`, () =>
    queryCollection('posts')
        .order('date', 'DESC')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .select('title', 'date', 'path', 'description', 'tags')
        .all()
)).data as Ref<Post[]>

const total = (await useAsyncData('posts-total', () =>
    queryCollection('posts')
        .count()
)).data as Ref<number>

const pageCount = Math.max(1, Math.ceil((total.value ?? 0) / pageSize))

if (posts.value && posts.value.length === 0 && page > 1) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}
</script>

<style lang="less" scoped>
.post-item {
    margin-bottom: 40px;
}

.title {
    margin-bottom: 5px;
    font-size: 1.5em;
    font-weight: bold;
    border-bottom: 1px solid #eee;
    padding-bottom: 5px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;

    a {
        color: #333;
        text-decoration: none;

        &:hover {
            color: @active-blue;
        }
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

    &:hover {
        color: @active-blue;
    }
}
</style>
