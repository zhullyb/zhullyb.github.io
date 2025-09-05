<template>
    <DefaultLayout :title="post?.title">
        <ContentRenderer v-if="post" :value="post" class="markdown-body" />
        <div v-if="prevPost || nextPost" class="post-nav">
            <div class="post-nav-item prev" v-if="prevPost" @click="navigateTo(getPostUrl(prevPost))">
                上一篇：{{ prevPost.title }}
            </div>
            <div class="post-nav-item next" v-if="nextPost" @click="navigateTo(getPostUrl(nextPost))">
                下一篇：{{ nextPost.title }}
            </div>
        </div>
    </DefaultLayout>
</template>

<script setup lang="ts">
const route = useRoute();
const { year, month, day, slug } = route.params;

const { data: post } = await useAsyncData(`post-${year}-${month}-${day}-${slug}`, () => 
    queryCollection('posts')
        .path(`/posts/${slug}`)
        .first()
);

if (!post.value) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true });
}

const { data: surroundingPosts } = await useAsyncData(`surround-${year}-${month}-${day}-${slug}`, () => 
    queryCollectionItemSurroundings('posts', post.value!.path, {
        before: 1,
        after: 1,
        fields: ['title', 'path']
    }).order('date', 'DESC')
);

const prevPost = computed(() => surroundingPosts.value?.[0] || null);
const nextPost = computed(() => surroundingPosts.value?.[1] || null);


const getPostUrl = (post: any) => {
    const newDate = new Date(post.date)
    const year = newDate.getFullYear()
    const month = String(newDate.getMonth() + 1).padStart(2, '0')
    const day = String(newDate.getDate()).padStart(2, '0')
    return `/${year}/${month}/${day}/${post.path.split('/').pop()}`
}
</script>

<style lang="scss" scoped>
.post-nav {
    margin-top: 2em;
    display: flex;
}

.post-nav-item {
    cursor: pointer;
    display: inline-block;
    transition: background-color 0.3s, color 0.3s;

    &:hover {
        color: #30a9de;
    }

    &.prev {
        margin-right: auto;
        text-align: left;
    }

    &.next {
        margin-left: auto;
        text-align: right;
    }
}
</style>