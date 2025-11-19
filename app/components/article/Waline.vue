<template>
	<div id="waline" ref="walineRef">
		<ClientOnly>
			<WalineClient v-if="walineVisible" v-bind="walineProps" />
			<div v-else>Waline Loading...</div>
		</ClientOnly>
	</div>
</template>

<script lang="ts" setup>
	import blogConfig from '~~/blog.config'
	const WalineClient = defineAsyncComponent(() =>
		import('@waline/client/component').then(module => module.Waline)
	)

	import '@waline/client/style'

	const route = useRoute()
  const { locale } = useI18n()

	const walineProps = computed(
		() =>
			({
				...blogConfig.waline,
        lang: locale.value === 'zh' ? 'zh-CN' : 'en',
				path: (route.path.endsWith('/') ? route.path : route.path + '/').replace('/en/', '/')
			}) as any
	)

  const { targetRef: walineRef, isVisible: walineVisible } = useLazyLoad({
    rootMargin: '200px',
    threshold: 0
  })
</script>

<style lang="less">
	#waline {
		--waline-theme-color: #3f72af;
		--waline-active-color: #173f70;

		.wl-panel {
			border-radius: 0;
			margin: 0;

      .dark-mode({
        border-color: @dark-border-color;
      });
		}

		.wl-btn {
			border-radius: 0;
		}
	}
</style>
