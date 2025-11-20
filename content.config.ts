import { defineContentConfig, defineCollection, z } from '@nuxt/content'

const articleSchema = z.object({
	title: z.string(),
	description: z.string().max(100).optional(),
	date: z
		.string()
		.transform(str => new Date(str))
		.optional(),
	sticky: z.boolean().optional(),
	tags: z.array(z.string()).optional(),
	rawbody: z.string(),
	lang: z.string().optional()
})

export default defineContentConfig({
	collections: {
		posts: defineCollection({
			type: 'page',
			source: 'posts/**/*.md',
			schema: articleSchema
		}),
		others: defineCollection({
			type: 'page',
			source: 'others/**/*.md',
      schema: z.object({
        title: z.string(),
        lang: z.string().optional()
      })
		})
	}
})
