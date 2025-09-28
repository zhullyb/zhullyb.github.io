<template>
    <DefaultLayout :title="post?.title">
        <ContentRenderer v-if="post" :value="post" class="markdown-body" />
        <div v-if="prevPost || nextPost" class="post-nav">
            <div class="post-nav-item prev" v-if="prevPost" @click="navigateTo(getUrlByPost(prevPost))">
                上一篇：{{ prevPost.title }}
            </div>
            <div class="post-nav-item next" v-if="nextPost" @click="navigateTo(getUrlByPost(nextPost))">
                下一篇：{{ nextPost.title }}
            </div>
        </div>
    </DefaultLayout>
</template>

<script setup lang="ts">
import type { Post } from '~/types/post'
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

const surroundingPosts = (await useAsyncData(`surround-${year}-${month}-${day}-${slug}`, () => 
    queryCollectionItemSurroundings('posts', post.value!.path, {
        before: 1,
        after: 1,
        fields: ['title', 'path', 'date']
    }).order('date', 'DESC')
)).data as unknown as Ref<Post[]>;

const prevPost = computed(() => surroundingPosts.value?.[0] || null);
const nextPost = computed(() => surroundingPosts.value?.[1] || null);

useHead({
    meta: [
        { name: 'description', content: post.value?.description || '' },
        { name: 'keywords', content: (()=>{
            if (Array.isArray(post.value?.tags)){
                return post.value?.tags.join(',') || ''
            }
            if (typeof post.value?.tags === 'string'){
                return post.value?.tags || ''
            }
            return ''
        })() }
    ]
})
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