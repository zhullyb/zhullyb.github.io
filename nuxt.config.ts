import blogConfig from './blog.config'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'

const defaultLocale = blogConfig.site.defaultLocale
const defaultSiteTitle = blogConfig.site.title[defaultLocale]
const defaultSiteDescription = blogConfig.site.description[defaultLocale]
const siteUrl = blogConfig.site.url.replace(/\/$/, '')

const headLinks = [
  ...blogConfig.assets.preconnect.map(href => ({
    rel: 'preconnect',
    href,
    crossorigin: ''
  })),
  {
    rel: 'prefetch',
    as: 'style',
    href: blogConfig.assets.markdownStylesheet
  },
  {
    rel: 'alternate',
    type: 'application/rss+xml',
    title: `${blogConfig.site.title.zh} RSS Feed (Chinese)`,
    href: `${siteUrl}/rss.xml`
  },
  {
    rel: 'alternate',
    type: 'application/atom+xml',
    title: `${blogConfig.site.title.en} Atom Feed (English)`,
    href: `${siteUrl}/en/rss.xml`
  }
]

const headScripts = blogConfig.analytics.umami.enabled
  ? [
      {
        src: blogConfig.analytics.umami.scriptSrc,
        defer: true,
        'data-website-id': blogConfig.analytics.umami.websiteId
      }
    ]
  : []

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: defaultSiteTitle,
      link: headLinks,
      script: headScripts,
      meta: [
        {
          name: 'description',
          content: defaultSiteDescription
        }
      ]
    }
  },
  content: {
    experimental: { sqliteConnector: 'native' },
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'one-light',
            dark: 'one-dark-pro'
          },
          langs: [
            'json',
            'js',
            'ts',
            'html',
            'css',
            'vue',
            'shell',
            'mdc',
            'md',
            'yaml',
            'bash',
            'diff',
            'python',
            'xml',
            'nginx',
            'php',
            'powershell'
          ]
        }
      }
    }
  },
  nitro: {
    prerender: {
      routes: [
        '/rss.xml', // RSS 订阅
        '/en/rss.xml', // RSS 订阅 (English)
        '/search/sections.json', // 搜索结果
        '/tags/Vue.js', // 带有 . 的标签页，必须显式列出
        ...Object.keys(blogConfig.redirects) // 预渲染所有需要重定向的页面
      ]
    }
  },
  modules: ['@nuxtjs/i18n', '@nuxtjs/seo', '@nuxt/content'],
  i18n: {
    locales: [
      { code: 'zh', language: 'zh-CN', name: '简体中文', file: 'zh.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' }
    ],
    defaultLocale: 'zh',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: false,
    langDir: 'locales',
    vueI18n: './i18n.config.ts'
  },
  components: [
    {
      path: '~/components/layout'
    },
    {
      path: '~/components/article'
    },
    {
      path: '~/components/common'
    },
    {
      path: '~/components',
      pathPrefix: false
    }
  ],
  linkChecker: {
    skipInspections: ['no-non-ascii-chars', 'no-uppercase-chars', 'absolute-site-urls']
  },
  site: {
    url: blogConfig.site.url,
    name: defaultSiteTitle,
    description: defaultSiteDescription,
    defaultLocale: 'zh-CN',
    trailingSlash: true
  },
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4
  },
  compatibilityDate: '2024-04-03',
  css: ['@/assets/styles/main.less'],
  hooks: {
    'content:file:afterParse'(ctx: any) {
      const { content, file, collection } = ctx

      if (collection.name === 'posts') {
        if (content && content.date) {
          const date = new Date(content.date)
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const filename = content.path.split('/').pop() || 'untitled'
          content.path = `/${year}/${month}/${day}/${filename
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')}`
        }
      }
      if (collection.name === 'others') {
        content.path = '/' + content.path.split('/').slice(3).join('/')
      }
      // 根据文件路径判断语言
      if (file.path.includes('/en/')) {
        content.lang = 'en'
      } else if (file.path.includes('/zh/')) {
        content.lang = 'zh-CN'
      }
    }
  },
  vite: {
    css: {
      preprocessorOptions: {
        less: {
          additionalData: `@import "@/assets/styles/mixins.less";`
        }
      }
    },
    plugins: [
      Components({
        resolvers: [
          IconsResolver({
            prefix: '' // 可选，图标组件的前缀，默认为 'i'
          })
        ],
        dts: true // 生成类型声明文件
      }),
      Icons({
        compiler: 'vue3'
      })
    ]
  },
  sitemap: {
    exclude: [
      ...Object.keys(blogConfig.redirects),
      ...Object.keys(blogConfig.redirects).map(i => encodeURI(i))
    ],
    sitemaps: false
  },
  experimental: {
    defaults: {
      nuxtLink: {
        trailingSlash: 'append'
      }
    }
  }
})
