import blogConfig from "./blog.config"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: blogConfig.title,
      htmlAttrs: { lang: 'zh-CN' },
      link: [
        {
          rel: 'stylesheet',
          href: 'https://static.031130.xyz/res/github-markdown.css'
        }
      ],
      meta: [
        {
          name: 'description',
          content: blogConfig.description
        }
      ]
    }
  },
  modules: [
    '@nuxtjs/seo',
    '@nuxt/content',
  ],
  components: [
    {
      path: '~/components/layout'
    },
    {
      path: '~/components/article'
    }
  ],
  linkChecker: {
    skipInspections: [
      'no-non-ascii-chars',
      'no-uppercase-chars',
      'trailing-slash',
      'absolute-site-urls'
    ]
  },
  site: {
    url: blogConfig.url,
    name: blogConfig.title,
    description: blogConfig.description,
    defaultLocale: 'zh-CN',
  },
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-04-03',
  css: [
    '@/assets/styles/main.less'
  ],
  vite: {
    css: {
      preprocessorOptions: {
        less: {
          additionalData: `@import "@/assets/styles/mixins.less";`
        }
      }
    }
  }
})
