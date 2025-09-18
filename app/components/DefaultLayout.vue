
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
</script>

<style lang="scss" scoped>
main {
  width: 50%;
  margin: 40px auto;
}
</style>