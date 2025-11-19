import blogConfig from './blog.config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	app: {
		head: {
			title: blogConfig.title,
			link: [
				{
					rel: 'preconnect',
					href: 'https://static.031130.xyz',
					crossorigin: ''
				},
				{
					rel: 'prefetch',
					as: 'style',
					href: 'https://s4.zstatic.net/ajax/libs/github-markdown-css/5.8.1/github-markdown.min.css'
				},
        {
          rel: 'alternate',
          type: 'application/rss+xml',
          title: `${blogConfig.title} RSS Feed (Chinese)`,
          href: `${blogConfig.url.replace(/\/$/, '')}/rss.xml`
        },
				{
					rel: 'alternate',
					type: 'application/atom+xml',
					title: `${blogConfig.title} Atom Feed (English)`,
					href: `${blogConfig.url.replace(/\/$/, '')}/en/rss.xml`
				}
			],
			script: [
				// umami 统计脚本
				{
					src: '/js/u.js',
					defer: true,
					'data-website-id': '5346b89b-f4bf-4593-971d-1f41a1118bc1'
				}
				// Aegis SDK - 使用 defer 异步加载
				// {
				// 	src: 'https://tam.cdn-go.cn/aegis-sdk/latest/aegis.min.js',
				// 	defer: true
				// },
				// {
				// 	innerHTML: `
				// 		window.addEventListener('load', function() {
				// 			if (typeof Aegis === 'function') {
				// 				var aegis = new Aegis({
				// 					id: 'qVpxoSLlkdylxWwEdn',
				// 					reportApiSpeed: true,
				// 					reportAssetSpeed: true,
				// 					spa: true,
				// 					hostUrl: 'https://rumt-zh.com'
				// 				});
				// 			}
				// 		});
				// 	`,
				// 	defer: true
				// }
			],
			meta: [
				{
					name: 'description',
					content: blogConfig.description
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
				...Object.keys(blogConfig.urlRedirects) // 预渲染所有需要重定向的页面
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
		}
	],
	linkChecker: {
		skipInspections: ['no-non-ascii-chars', 'no-uppercase-chars', 'absolute-site-urls']
	},
	site: {
		url: blogConfig.url,
		name: blogConfig.title,
		description: blogConfig.description,
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
			const { content } = ctx
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
      // 根据文件路径判断语言
      if (ctx.file.path.includes('/posts/en/')) {
        content.lang = 'en'
      } else if (ctx.file.path.includes('/posts/zh/')) {
        content.lang = 'zh-CN'
      } else if (!content.lang) {
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
		}
	},
	sitemap: {
		exclude: [
			...Object.keys(blogConfig.urlRedirects),
			...Object.keys(blogConfig.urlRedirects).map(i => encodeURI(i))
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
