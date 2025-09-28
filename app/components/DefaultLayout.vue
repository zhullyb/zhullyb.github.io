
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
const props = defineProps({
  title: {
    default: ''
  }
})
const appConfig = useAppConfig()
const randomIndex = Math.floor(Math.random() * appConfig.imgs.length)
const bannerImg = appConfig.imgs[randomIndex] as string

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