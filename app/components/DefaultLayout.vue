
<template>
  <div>
    <Header :banner-img="bannerImg" :title="title" />
    <main>
      <slot />
    </main>
    <Footer :banner-img="bannerImg" />
  </div>
</template>


<script setup lang="ts">
const route = useRoute()
const props = defineProps({
  title: {
    default: ''
  }
})
const appConfig = useAppConfig()
const { data: randomIndex } = useAsyncData('randomIndex' + route.path, async () => {
  return Math.floor(Math.random() * appConfig.imgs.length)
})
const bannerImg = computed(() => appConfig.imgs[randomIndex.value ?? 0] as string)

useHead({
  title: props.title || appConfig.title
})
</script>

<style lang="less" scoped>
main {
  min-height: calc(40vh - 120px);
  margin: 64px auto 40px;

  width: 50%;
  .desktop-down({
    width: 75%;
  });
  
  .tablet-down({
    width: unset;
    margin: 30px;
  });
}
</style>