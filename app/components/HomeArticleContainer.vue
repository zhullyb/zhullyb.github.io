<template>
    <div>
        <div v-for="post in posts" :key="post.path" class="post-item">
            <h2>
                <NuxtLink :to="getPostUrl(post)">{{ post.title }}</NuxtLink>
            </h2>
            <p class="date">{{ post.date }}</p>
            <p class="description">{{ post.description }}</p>
        </div>
        <Pagination :currentPage="page" :totalPages="pageCount" />
    </div>
</template>

<script setup lang="ts">
const route = useRoute()
const page = route.params.page ? parseInt(route.params.page as string) || 1 : 1

const pageSize = 10

const { data: posts } = await useAsyncData(`index-page-${page}`, () =>
    queryCollection('posts')
        .order('date', 'DESC')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .select('title', 'date', 'path', 'description', 'tags')
        .all()
)

const { data: total } = await useAsyncData('posts-total', () =>
    queryCollection('posts')
        .count()
)

const pageCount = Math.max(1, Math.ceil((total.value ?? 0) / pageSize))

const getPostUrl = (post: any) => {
    const newDate = new Date(post.date)
    const year = newDate.getFullYear()
    const month = String(newDate.getMonth() + 1).padStart(2, '0')
    const day = String(newDate.getDate()).padStart(2, '0')
    return `/${year}/${month}/${day}/${post.path.split('/').pop()}`
}

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
