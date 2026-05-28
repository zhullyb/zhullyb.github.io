<template>
  <div>
    <Header :background="background" :title="title" />
    <div class="content-wrapper">
      <div class="before-main side">
        <slot name="BeforeMain" />
      </div>
      <main>
        <slot />
      </main>
      <div class="after-main side">
        <slot name="AfterMain" />
      </div>
    </div>
    <Footer :background="background" />
  </div>
</template>

<script setup lang="ts">
  const route = useRoute()
  const appConfig = useAppConfig()
  const siteTitle = useLocalizedConfigValue(appConfig.site.title)

  const props = defineProps({
    title: {
      default: ''
    }
  })
  // 使用 route.name + params 作为 key，避免 route.path 在 SSR(/about) 与 client(/about/)
  // 之间因尾斜杠不一致导致 useAsyncData payload 命中失败、Math.random() 在客户端重跑、
  // 进而触发 hydration mismatch（看起来像“重加载”）。route.name 与 params 由 vue-router
  // 路由 record 决定，SSR/Client 完全一致，且与 i18n 前缀无关。
  const routeKey = `${String(route.name ?? 'unknown')}-${JSON.stringify(route.params)}`
  const { data: randomIndex } = useAsyncData(
    `randomIndex-${routeKey}`,
    async () => {
      return Math.floor(Math.random() * appConfig.appearance.backgrounds.length)
    }
  )
  const background = computed(
    () =>
      appConfig.appearance.backgrounds[randomIndex.value ?? 0] as {
        backgroundColor: string
        backgroundImage: string
      }
  )

  useHead(() => ({
    title: props.title || siteTitle.value
  }))
</script>

<style lang="less" scoped>
  .content-wrapper {
    margin-top: 40px;
    margin-bottom: 40px;

    .desktop-up({
      display: flex;
      justify-content: space-around;

      .side {
        width: 20%;
      }
    });

    .desktop-down({
      margin: 30px;
    });
  }

  main {
    min-height: calc(40vh - 120px);
    width: 50%;

    .desktop-down({
      width: unset;
    });
  }
</style>
