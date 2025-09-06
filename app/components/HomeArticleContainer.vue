<template>
    <div>
        <div v-for="post in posts" :key="post.path" class="post-item">
            <h2>
                <NuxtLink :to="getUrlByPost(post)">{{ post.title }}</NuxtLink>
            </h2>
            <p class="date">{{ post.date }}</p>
            <p class="description">{{ post.description }}</p>
        </div>
        <Pagination :currentPage="page" :totalPages="pageCount" />
    </div>
</template>

<script setup lang="ts">
import type { Post } from '~/types/post'

const route = useRoute()
const page = route.params.page ? parseInt(route.params.page as string) || 1 : 1

const pageSize = 10

const posts = await useAsyncData(`index-page-${page}`, () =>
    queryCollection('posts')
        .order('date', 'DESC')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .select('title', 'date', 'path', 'description', 'tags')
        .all()
).data as Ref<Post[]>

const total = await useAsyncData('posts-total', () =>
    queryCollection('posts')
        .count()
).data as Ref<number>

const pageCount = Math.max(1, Math.ceil((total.value ?? 0) / pageSize))

if (posts.value && posts.value.length === 0 && page > 1) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}
</script>

<style lang="scss" scoped>
.post-item {
    margin-bottom: 20px;
}

.date {
    color: #666;
    font-size: 0.9em;
}

.description {
    margin-top: 10px;
}
</style>
