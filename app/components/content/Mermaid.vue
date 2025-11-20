<template>
	<div class="mermaid-wrapper">
		<div
			ref="mermaidContainer"
			class="mermaid-container"
			:class="{ 'mermaid-loaded': mermiadLoaded }"
		></div>
		<pre v-if="!mermiadLoaded" :class="[props.class, 'mermaid-placeholder']">{{
			props.code
		}}</pre>
	</div>
</template>

<script setup lang="ts">
	import { ref, onMounted } from 'vue'
	import mermaid from 'mermaid'

	const props = defineProps<{
		code: string
		class?: string
	}>()

	const mermaidContainer = ref<HTMLElement | null>(null)
	const mermiadLoaded = ref(false)

	onMounted(async () => {
		if (!mermaidContainer.value) return

		// 初始化 mermaid
		mermaid.initialize({
			startOnLoad: false,
			theme: 'default',
			securityLevel: 'loose'
		})

		try {
			// 生成唯一 ID
			const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`

			// 渲染 mermaid 图表
			const { svg } = await mermaid.render(id, props.code)

			if (mermaidContainer.value) {
				mermaidContainer.value.innerHTML = svg
				mermiadLoaded.value = true
			}
		} catch (error) {
			console.error('Mermaid rendering error:', error)
			if (mermaidContainer.value) {
				mermaidContainer.value.innerHTML = `<pre class="mermaid-error">Mermaid rendering error: ${error}</pre>`
			}
		}
	})
</script>

<style scoped>
	.mermaid-wrapper {
		display: block;
	}

	.mermaid-container {
		display: flex;
		justify-content: center;
		margin: 1.5em 0;
		overflow-x: auto;
		opacity: 0;
		transform: translateY(10px);
		transition:
			opacity 0.4s ease-out,
			transform 0.4s ease-out;
	}

	.mermaid-container.mermaid-loaded {
		opacity: 1;
		transform: translateY(0);
	}

	.mermaid-placeholder {
		opacity: 1;
		transform: translateY(0);
		transition:
			opacity 0.3s ease-out,
			transform 0.3s ease-out;
	}

	.mermaid-error {
		color: #d32f2f;
		background-color: #ffebee;
		padding: 1em;
		border-radius: 4px;
		border-left: 4px solid #d32f2f;
	}
</style>
