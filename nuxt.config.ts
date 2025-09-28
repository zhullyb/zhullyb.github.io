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
          href: '/github-markdown.css'
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
    '@nuxt/content',
  ],
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
