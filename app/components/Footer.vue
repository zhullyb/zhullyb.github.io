<template>
	<footer :style="footerStyle">
		<!-- 可在此处添加 footer 内容 -->
        <div class="footer-mask"></div>
	</footer>
</template>

<script setup lang="ts">
const props = defineProps<{ bannerImg: string }>()
const footerStyle = {
	background: `url(${props.bannerImg}) center center / cover no-repeat`,
	minHeight: '120px',
	color: 'white',
}
</script>

<style scoped>
footer {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
    position: relative;
}

.footer-mask {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5))
}
</style>