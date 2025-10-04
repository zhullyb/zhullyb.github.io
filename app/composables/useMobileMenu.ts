import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 管理移动端菜单状态的 composable
 * @returns showMobileMenu - 菜单是否显示
 * @returns toggleMobileMenu - 切换菜单显示状态
 * @returns closeMobileMenu - 关闭菜单
 */
export function useMobileMenu() {
	const showMobileMenu = ref(false)

	const toggleMobileMenu = (e: MouseEvent) => {
		e.stopPropagation()
		showMobileMenu.value = !showMobileMenu.value
	}

	const closeMobileMenu = () => {
		showMobileMenu.value = false
	}

	onMounted(() => {
		document.addEventListener('click', closeMobileMenu)
	})

	onUnmounted(() => {
		document.removeEventListener('click', closeMobileMenu)
	})

	return {
		showMobileMenu,
		toggleMobileMenu,
		closeMobileMenu
	}
}
