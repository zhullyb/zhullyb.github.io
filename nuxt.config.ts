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
			meta: [
				{
					name: 'description',
					content: blogConfig.description
				}
			]
		}
	},
	nitro: {
		prerender: {
			routes: ['/rss.xml', '/search/sections.json']
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
	}
})
