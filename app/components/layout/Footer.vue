<template>
  <footer ref="footerRef" :style="footerStyle">
    <div class="footer-mask"></div>
    <div class="footer-content">
      <div class="social">
        <a
          v-if="footerConfig.social.github"
          class="social-icons"
          :href="footerConfig.social.github"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Github"
        >
          <F7LogoGithub />
        </a>
        <a
          v-if="footerConfig.social.mastodon"
          class="social-icons"
          :href="footerConfig.social.mastodon"
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
        <NuxtLinkLocale v-if="donatePath" class="social-icons" :to="donatePath" aria-label="Donate">
          <BxsDonateHeart />
        </NuxtLinkLocale>
        <a
          v-if="footerConfig.social.email"
          class="social-icons"
          :href="`mailto:${footerConfig.social.email}`"
          aria-label="Email"
        >
          <IcOutlineMailOutline />
        </a>
      </div>
      <div class="center-y" style="gap: 4px; font-weight: 600">
        <TdesignCopyright style="font-size: 0.9em" />
        {{ copyrightText }}
      </div>
      <div class="center-y" style="gap: 8px; font-weight: 600">
        Proudly Powered by
        <NuxtLink
          :to="footerConfig.poweredBy.url"
          class="center-y"
          :aria-label="footerConfig.poweredBy.name"
        >
          <LogosNuxt v-if="footerConfig.poweredBy.name === 'Nuxt'" style="fill: white" />
          <span v-else>{{ footerConfig.poweredBy.name }}</span>
        </NuxtLink>
      </div>
      <NodeSupport
        v-if="footerConfig.nodeSupport.enabled"
        :config="footerConfig.nodeSupport"
        style="margin-top: 12px"
      />
      <template v-if="showNodeSupport && footerConfig.nodeSupport.enabled">
        <iframe
          v-show="false"
          title="NodeSupport Sponsorship"
          frameborder="0"
          :src="footerConfig.nodeSupport.promotionUrl"
        ></iframe>
      </template>
    </div>
  </footer>
</template>

<script setup lang="ts">
  const appConfig = useAppConfig()
  const { locale } = useI18n()

  const props = defineProps<{
    background: {
      backgroundColor: string
      backgroundImage: string
    }
  }>()

  const footerConfig = appConfig.footer
  const donatePath = appConfig.pages.donate.path
  const footerStyle = computed(() => ({
    minHeight: '120px',
    ...props.background
  }))
  const rssLink = computed(() => (locale.value === 'en' ? '/en/rss.xml' : '/rss.xml'))
  const copyrightText = computed(() => {
    const currentYear = new Date().getFullYear()
    const { startYear, owner } = footerConfig.copyright

    return startYear >= currentYear
      ? `${startYear} ${owner}`
      : `${startYear} - ${currentYear} ${owner}`
  })

  const { targetRef: footerRef, isVisible: showNodeSupport } = useLazyLoad({
    rootMargin: '100px', // 提前100px开始加载
    threshold: 0.1
  })
</script>

<style lang="less" scoped>
  footer {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    color: white;
  }

  .footer-content {
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 20px;
  }

  .footer-mask {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5));

    .dark-mode({
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8));
    });
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
