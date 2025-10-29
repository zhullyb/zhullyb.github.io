<template>
	<footer :style="footerStyle">
		<div class="footer-mask"></div>
		<!-- 可在此处添加 footer 内容 -->
		<div class="footer-content">©2020 - 2025 By zhullyb</div>
	</footer>
</template>

<script setup lang="ts">
	const props = defineProps<{ bannerImg: string }>()
	const footerStyle = {
		background: `url(${props.bannerImg}) center bottom / cover no-repeat`,
		minHeight: '120px',
		color: 'white'
	}
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
