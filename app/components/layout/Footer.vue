<template>
	<footer ref="footerRef" :style="footerStyle">
		<div class="footer-mask"></div>
		<!-- 可在此处添加 footer 内容 -->
		<div class="footer-content">
			<div>©2020 - 2025 By zhullyb</div>
      <NodeSupport />
      <template v-if="showNodeSupport">
        <iframe
          v-show="false"
          title="NodeSupport Sponsorship"
          frameborder="0"
          src="https://support.nodeget.com/page/promotion?id=61"
        ></iframe>
      </template>
		</div>
	</footer>
</template>

<script setup lang="ts">
	const props = defineProps<{
		background: {
			backgroundColor: string
			backgroundImage: string
		}
	}>()

	const footerStyle = computed(() => ({
		minHeight: '120px',
		...props.background
	}))

	const { targetRef: footerRef, isVisible: showNodeSupport } = useLazyLoad({
		rootMargin: '100px', // 提前100px开始加载
		threshold: 0.1
	})
</script>

<style lang="less" scoped>
	footer {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		color: white;
	}

	.footer-content {
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 20px;
	}

	.footer-mask {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5));
		.dark-mode({
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8));
    });
	}
</style>
