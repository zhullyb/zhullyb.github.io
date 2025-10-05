<template>
	<span class="prose-img-wrapper">
		<img
			:src="src"
			:alt="alt"
			:title="title"
			:width="width"
			:height="height"
			loading="lazy"
			class="prose-img"
			@click="openPreview"
			style="cursor: zoom-in"
		/>
		<span v-if="alt" class="prose-img-caption">{{ alt }}</span>
		<teleport to="body">
			<div
				v-if="preview"
				class="prose-img-preview-mask"
				@click.self="closePreview"
				@wheel.prevent="onWheel"
			>
				<img
					:src="src"
					:alt="alt"
					class="prose-img-preview-img"
					:style="previewImgStyle"
					@dblclick="resetScale"
				/>
				<button class="prose-img-preview-close" @click="closePreview" aria-label="关闭预览">
					×
				</button>
				<div v-if="scale !== 1" class="prose-img-preview-scale-indicator">
					{{ (scale * 100).toFixed(0) }}%
				</div>
			</div>
		</teleport>
	</span>
</template>

<script setup lang="ts">
	import { ref, onMounted, onBeforeUnmount } from 'vue'

	const props = defineProps({
		src: { type: String, required: true },
		alt: { type: String, default: '' },
		title: { type: String, default: '' },
		width: { type: [String, Number], default: undefined },
		height: { type: [String, Number], default: undefined }
	})

	const preview = ref(false)
	const scale = ref(1)
	const minScale = 0.5
	const maxScale = 4

	const previewImgStyle = computed(() => ({
		transform: `scale(${scale.value})`,
		transition: 'transform 0.15s',
		cursor: scale.value !== 1 ? 'zoom-out' : 'zoom-in'
	}))

	function openPreview() {
		preview.value = true
		scale.value = 1
		document.body.style.overflow = 'hidden'
	}

	function closePreview() {
		preview.value = false
		document.body.style.overflow = ''
	}

	function onWheel(e: WheelEvent) {
		if (!preview.value) return
		const delta = e.deltaY
		let next = scale.value
		if (delta < 0) {
			next *= 1.1
		} else {
			next /= 1.1
		}
		next = Math.max(minScale, Math.min(maxScale, next))
		scale.value = Number(next.toFixed(2))
	}

	function resetScale() {
		scale.value = 1
	}

	function handleKeydown(e: KeyboardEvent) {
		if (preview.value && (e.key === 'Escape' || e.key === 'Esc')) {
			closePreview()
		}
	}

	onMounted(() => {
		window.addEventListener('keydown', handleKeydown)
	})
	onBeforeUnmount(() => {
		window.removeEventListener('keydown', handleKeydown)
		document.body.style.overflow = ''
	})
</script>

<style scoped>
	.prose-img-wrapper {
		display: inline-block;
		position: relative;
	}
	.prose-img {
		max-width: 100%;
		border-radius: 4px;
		transition: box-shadow 0.2s;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
	}
	.prose-img:hover {
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
	}
	.prose-img-caption {
		display: block;
		text-align: center;
		font-size: 0.875rem;
		color: #666;
		margin-top: 0.25rem;
		font-style: italic;
	}
	.prose-img-preview-mask {
		position: fixed;
		z-index: 9999;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.85);
		display: flex;
		align-items: center;
		justify-content: center;
		animation: fadeIn 0.2s;
	}
	.prose-img-preview-img {
		max-width: 90vw;
		max-height: 90vh;
		border-radius: 8px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
		background: #fff;
		user-select: none;
		will-change: transform;
	}
	.prose-img-preview-scale-indicator {
		position: absolute;
		left: 50%;
		bottom: 32px;
		transform: translateX(-50%);
		color: #fff;
		background: rgba(0, 0, 0, 0.5);
		border-radius: 4px;
		padding: 2px 10px;
		font-size: 1rem;
		pointer-events: none;
		user-select: none;
		z-index: 10001;
	}
	.prose-img-preview-close {
		position: absolute;
		top: 32px;
		right: 48px;
		font-size: 2.5rem;
		color: #fff;
		background: none;
		border: none;
		cursor: pointer;
		z-index: 10000;
		line-height: 1;
		padding: 0 0.5rem;
		transition: color 0.2s;
	}
	.prose-img-preview-close:hover {
		color: #ffb3b3;
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
