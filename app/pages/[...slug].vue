<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData('page-' + route.path, () => {
  return queryCollection('others').path(route.path).first()
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}
</script>

<template>
  <DefaultLayout :title="page?.title">
    <ContentRenderer
      v-if="page"
      :value="page"
      class="markdown-body"
    />
  </DefaultLayout>
</template>