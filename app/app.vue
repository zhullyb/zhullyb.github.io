<template>
  <NuxtRouteAnnouncer />
  <NuxtPage />
</template>

<style lang="less">
.markdown-body {
    h2,
    h3,
    h4,
    h5,
    h6 {
      & > a {
        color: unset;
      }

      scroll-margin-top: @header-height + 20px;
    }
}
</style>