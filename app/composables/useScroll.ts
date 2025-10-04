import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 监听页面滚动状态的 composable
 * @returns isScrolled - 页面是否已滚动
 */
export function useScroll() {
	const isScrolled = ref(false)
	let ticking = false

	const handleScroll = () => {
		if (!ticking) {
			window.requestAnimationFrame(() => {
				isScrolled.value = window.scrollY > 0
				ticking = false
			})
			ticking = true
		}
	}

	onMounted(() => {
		handleScroll()
		window.addEventListener('scroll', handleScroll)
	})

	onUnmounted(() => {
		window.removeEventListener('scroll', handleScroll)
	})

	return {
		isScrolled
	}
}
