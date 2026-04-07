<template>
  <div class="footer-content">
    <div class="social">
      <a
        class="social-icons"
        href="https://github.com/zhullyb/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Github"
      >
        <F7LogoGithub />
      </a>
      <a
        class="social-icons"
        href="https://zone.liolok.com/@zhullyb"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Mastodon"
      >
        <MdiMastodon />
      </a>
      <a
        class="social-icons"
        :href="rssLink"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="RSS"
      >
        <F7LogoRss />
      </a>
      <NuxtLinkLocale class="social-icons" to="/donate/" aria-label="Donate">
        <BxsDonateHeart />
      </NuxtLinkLocale>
      <a class="social-icons" href="mailto:zhullyb@outlook.com" aria-label="Email">
        <IcOutlineMailOutline />
      </a>
    </div>
    <div class="center-y" style="gap: 4px; font-weight: 600">
      <TdesignCopyright style="font-size: 0.9em" />
      {{ copyrightText }}
    </div>
    <div class="center-y" style="gap: 8px; font-weight: 600">
      Proudly Powered by
      <NuxtLink to="https://nuxt.com/" class="center-y" aria-label="Nuxt">
        <LogosNuxt style="fill: white" />
      </NuxtLink>
    </div>
    <NodeSupport style="margin-top: 12px" />
    <template v-if="showNodeSupport">
      <iframe
        v-show="false"
        title="NodeSupport Sponsorship"
        frameborder="0"
        src="https://support.nodeget.com/page/promotion?id=61"
      ></iframe>
    </template>
  </div>
</template>

<script setup lang="ts">
  import NodeSupport from '~/components/custom/NodeSupport.vue'

  defineProps<{
    showNodeSupport: boolean
  }>()

  const { locale } = useI18n()

  const rssLink = computed(() => (locale.value === 'en' ? '/en/rss.xml' : '/rss.xml'))
  const copyrightText = computed(() => {
    const currentYear = new Date().getFullYear()

    return currentYear <= 2020 ? '2020 zhullyb' : `2020 - ${currentYear} zhullyb`
  })
</script>

<style lang="less" scoped>
  .footer-content {
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 20px;
  }

  .social {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;

    &-icons {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 48px;
      width: 48px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.1);
      cursor: pointer;

      &:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }

      svg {
        width: 20px;
        height: 20px;
        fill: white;
      }
    }
  }
</style>
