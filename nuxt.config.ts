import blogConfig from './blog.config'

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
				},
				{
					rel: 'alternate',
					type: 'application/atom+xml',
					title: `${blogConfig.title} Atom Feed`,
					href: `${blogConfig.url.replace(/\/$/, '')}/rss.xml`
				}
			],
			script: [
				// umami 统计脚本
				{
					src: '/js/u.js',
					defer: true,
					'data-website-id': '5346b89b-f4bf-4593-971d-1f41a1118bc1'
				},
				// Aegis SDK
				{
					src: 'https://tam.cdn-go.cn/aegis-sdk/latest/aegis.min.js'
				},
				{
					innerHTML: `
						if (typeof Aegis === 'function') {
							var aegis = new Aegis({
								id: 'qVpxoSLlkdylxWwEdn',
								reportApiSpeed: true,
								reportAssetSpeed: true,
								spa: true,
								hostUrl: 'https://rumt-zh.com'
							});
						}
					`
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
	content: {
		build: {
			markdown: {
				highlight: {
					theme: {
						default: 'one-light',
						dark: 'one-dark-pro'
					}
				}
			}
		}
	},
	nitro: {
		prerender: {
			routes: [
				'/rss.xml', // RSS 订阅
				'/search/sections.json', // 搜索结果
				'/tags/Vue.js', // 带有 . 的标签页，必须显式列出
				...Object.keys(blogConfig.urlRedirects) // 预渲染所有需要重定向的页面
			]
		}
	},
	modules: ['@nuxtjs/seo', '@nuxt/content'],
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
	experimental: {
		defaults: {
			nuxtLink: {
				trailingSlash: 'append'
			}
		}
	}
})
