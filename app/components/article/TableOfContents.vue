<template>
	<nav v-if="headings.length > 0" class="toc">
		<div class="toc-title">目录</div>
		<ul class="toc-list">
			<li
				v-for="heading in headings"
				:key="heading.id"
				:class="[
					'toc-item',
					`toc-level-${heading.level}`,
					{ active: activeId === heading.id, collapsed: isCollapsed(heading) }
				]"
			>
				<a :href="`#${heading.id}`" @click.prevent="scrollToHeading(heading.id)">
					{{ heading.text }}
				</a>
			</li>
		</ul>
	</nav>
</template>

<script setup lang="ts">
	import { extractHeadings, type Heading } from '~/utils/extractHeadings'

	const props = defineProps<{
		body: any
	}>()

	const headings = computed(() => extractHeadings(props.body))
	const activeId = ref<string>('')

	// 判断标题是否应该被折叠
	const isCollapsed = (heading: Heading): boolean => {
		if (!activeId.value) return false

		const activeIndex = headings.value.findIndex(h => h.id === activeId.value)
		const currentIndex = headings.value.findIndex(h => h.id === heading.id)

		if (activeIndex === -1 || currentIndex === -1) return false

		const currentHeading = heading

		// 如果是当前激活的标题，不折叠
		if (currentHeading.id === activeId.value) return false

		// 如果是顶级标题（level 1-2），始终显示
		if (currentHeading.level <= 2) return false

		// 获取激活标题的所有祖先标题ID
		const getAncestorIds = (index: number): string[] => {
			const ancestors: string[] = []
			const targetHeading = headings.value[index]
			if (!targetHeading) return ancestors

			let currentLevel = targetHeading.level
			let searchIndex = index - 1

			// 向上查找所有祖先
			while (searchIndex >= 0) {
				const h = headings.value[searchIndex]
				if (!h) break

				// 如果找到更高级别的标题，它就是祖先
				if (h.level < currentLevel) {
					ancestors.push(h.id)
					currentLevel = h.level
					// 如果已经到顶级标题，停止查找
					if (h.level <= 1) break
				}
				searchIndex--
			}

			return ancestors
		}

		// 获取当前标题的直接父标题ID
		const getParentId = (index: number): string | null => {
			const targetHeading = headings.value[index]
			if (!targetHeading) return null

			let searchIndex = index - 1
			while (searchIndex >= 0) {
				const h = headings.value[searchIndex]
				if (!h) break
				if (h.level < targetHeading.level) {
					return h.id
				}
				searchIndex--
			}
			return null
		}

		// 获取激活标题的所有祖先
		const activeAncestors = getAncestorIds(activeIndex)

		// 检查当前标题是否是激活标题的祖先
		if (activeAncestors.includes(currentHeading.id)) {
			return false
		}

		// 检查当前标题的父标题是否在激活路径上
		const parentId = getParentId(currentIndex)
		if (!parentId) return false

		// 如果父标题是激活标题，显示
		if (parentId === activeId.value) return false

		// 如果父标题是激活标题的祖先，显示
		if (activeAncestors.includes(parentId)) {
			return false
		}

		// 否则折叠
		return true
	}

	// 滚动到指定标题
	const scrollToHeading = (id: string) => {
		const element = document.getElementById(id)
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' })
			// 更新 URL hash
			window.history.pushState(null, '', `#${id}`)
		}
	}

	// 更新激活的标题
	const updateActiveHeading = () => {
		// 获取所有标题元素
		const headingElements = headings.value
			.map(heading => ({
				id: heading.id,
				element: document.getElementById(heading.id)
			}))
			.filter(item => item.element !== null)

		if (headingElements.length === 0) return

		// 获取滚动位置
		const scrollY = window.scrollY

		// 找到当前最近的标题
		let activeHeading = headingElements[0]

		for (const item of headingElements) {
			const element = item.element!
			const rect = element.getBoundingClientRect()
			const elementTop = rect.top + scrollY

			// 如果标题在视口上方或刚进入视口上部，更新激活标题
			if (elementTop <= scrollY + 100) {
				activeHeading = item
			} else {
				break
			}
		}

		if (activeHeading) {
			activeId.value = activeHeading.id
		}
	}

	// 监听滚动
	onMounted(() => {
		// 初始化时设置激活标题
		updateActiveHeading()

		// 使用节流函数优化性能
		let ticking = false
		const handleScroll = () => {
			if (!ticking) {
				window.requestAnimationFrame(() => {
					updateActiveHeading()
					ticking = false
				})
				ticking = true
			}
		}

		window.addEventListener('scroll', handleScroll, { passive: true })

		// 清理
		onBeforeUnmount(() => {
			window.removeEventListener('scroll', handleScroll)
		})
	})
</script>

<style lang="less" scoped>
	.toc {
		max-height: calc(100vh - 120px);
		overflow-y: auto;
		padding: 1.25rem;
		background: #fafafa;
		border: 1px solid #e5e5e5;

		.dark-mode({
      background: @dark-second-color;
      border: 1px solid #444c5a;
    });

		.tablet-down({
			display: none;
		});
	}

	.toc-title {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: #333;
		border-bottom: 1px solid #e5e5e5;
		padding-bottom: 0.5rem;

		.dark-mode({
      color: #fff;
      border-bottom: 1px solid #444c5a;
    });
	}

	.toc-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.toc-item {
		margin: 0.3rem 0;
		line-height: 1.5;
		transition:
			max-height 0.25s ease,
			opacity 0.25s ease,
			margin 0.25s ease;
		max-height: 100px;
		opacity: 1;
		overflow: hidden;

		&.collapsed {
			max-height: 0;
			opacity: 0;
			margin: 0;
		}

		a {
			text-decoration: none;
			display: block;
			padding: 0.35rem 0.5rem;
			transition:
				color 0.2s,
				background-color 0.2s;
			font-size: 0.875rem;
			color: #666;
			.dark-mode({
        color: #ccc;
      });

			&:hover {
				color: @active-blue;
				background-color: rgba(59, 130, 246, 0.08);
			}
		}

		&.active a {
			color: @active-blue;
			font-weight: 500;
			background-color: rgba(59, 130, 246, 0.12);
		}

		// 不同层级的缩进
		&.toc-level-1 {
			padding-left: 0;

			a {
				font-weight: 500;
			}
		}

		&.toc-level-2 {
			padding-left: 0.75rem;
		}

		&.toc-level-3 {
			padding-left: 1.5rem;

			a {
				font-size: 0.85rem;
			}
		}

		&.toc-level-4 {
			padding-left: 2.25rem;

			a {
				font-size: 0.825rem;
			}
		}

		&.toc-level-5 {
			padding-left: 3rem;

			a {
				font-size: 0.8rem;
			}
		}

		&.toc-level-6 {
			padding-left: 3.75rem;

			a {
				font-size: 0.775rem;
			}
		}
	}

	// 滚动条样式
	.toc::-webkit-scrollbar {
		width: 5px;
	}

	.toc::-webkit-scrollbar-track {
		background: transparent;
	}

	.toc::-webkit-scrollbar-thumb {
		background: #d1d5db;

		&:hover {
			background: #9ca3af;
		}
	}
</style>
