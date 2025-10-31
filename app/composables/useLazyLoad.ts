export const useLazyLoad = (options?: { rootMargin?: string; threshold?: number }) => {
	const targetRef = ref<HTMLElement | null>(null)
	const isVisible = ref(false)

	onMounted(() => {
		if (!targetRef.value) return

		const observer = new IntersectionObserver(
			entries => {
				entries.forEach(entry => {
					if (entry.isIntersecting && !isVisible.value) {
						isVisible.value = true
						observer.disconnect()
					}
				})
			},
			{
				rootMargin: options?.rootMargin ?? '100px',
				threshold: options?.threshold ?? 0.1
			}
		)

		observer.observe(targetRef.value)

		onBeforeUnmount(() => {
			observer.disconnect()
		})
	})

	return {
		targetRef,
		isVisible
	}
}
