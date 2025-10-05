<template>
	<DefaultLayout title="标签">
		<div class="text-center tagcloud">
			<template v-if="tagCloudData.length">
				<NuxtLink
					v-for="tag in tagCloudData"
					class="tag"
					:key="tag.name"
					:to="`/tags/${encodeURIComponent(tag.name)}`"
					:style="tag.style"
				>
					{{ tag.name }}
				</NuxtLink>
			</template>
			<p v-else>Loading tags...</p>
		</div>
	</DefaultLayout>
</template>

<script lang="ts" setup>
	import type { Post } from '~/types/post'

	const posts = (
		await useAsyncData('tags-posts', () => queryCollection('posts').select('tags').all())
	).data as Ref<Post[]>

	const maxFontSize = 40
	const minFontSize = 20
	const startColor = '#bbbbee'
	const endColor = '#337ab7'

	const tagCloudData = computed(() => {
		const tagCountMap: Record<string, number> = {}
		let maxCount = 0
		let minCount = Infinity
		posts.value.forEach(post => {
			if (typeof post.tags?.forEach !== 'function') {
				return
			}
			post.tags?.forEach(tag => {
				if (tag in tagCountMap) {
					tagCountMap[tag]! += 1
				} else {
					tagCountMap[tag] = 1
				}
			})
		})

		// 遍历一次 tagCountMap
		Object.keys(tagCountMap).forEach(tag => {
			maxCount = Math.max(maxCount, tagCountMap[tag]!)
			minCount = Math.min(minCount, tagCountMap[tag]!)
		})

		const tags = Object.keys(tagCountMap).map(tag => {
			const count = tagCountMap[tag]!
			const percentage =
				maxCount === minCount ? 1.0 : (count - minCount) / (maxCount - minCount)
			const fontSize = minFontSize + percentage * (maxFontSize - minFontSize)
			const color = interpolateColor(startColor, endColor, percentage)
			return {
				name: tag,
				count: tagCountMap[tag]!,
				style: {
					fontSize: `${fontSize.toFixed(2)}px`,
					color
				}
			}
		})

		tags.sort((a, b) => a.name.localeCompare(b.name, 'en-US'))
		return tags
	})
</script>

<style lang="less" scoped>
	.tagcloud {
		margin: 0 auto;
		line-height: 50px;
	}

	.tag {
		display: inline-block;
		margin: 5px 10px;
		text-decoration: none;
		transition:
			color 0.1s,
			transform 0.1s;

		&:hover {
			color: @active-blue !important;
			transform: scale(1.1);
		}
	}
</style>
