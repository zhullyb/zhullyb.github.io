<template>
	<footer ref="footerRef" :style="footerStyle">
		<div class="footer-mask"></div>
		<!-- 可在此处添加 footer 内容 -->
		<div class="footer-content">
			<div class="social">
				<NuxtLink class="social-icons" to="https://github.com/zhullyb/">
					<F7LogoGithub />
				</NuxtLink>
				<a
					class="social-icons"
					:href="locale === 'en' ? '/en/rss.xml' : '/rss.xml'"
					target="_blank"
					rel="noopener noreferrer"
				>
					<F7LogoRss />
				</a>
				<NuxtLinkLocale class="social-icons" to="/donate/">
					<BxsDonateHeart />
				</NuxtLinkLocale>
				<a class="social-icons" href="mailto:zhullyb@outlook.com">
					<IcOutlineMailOutline />
				</a>
			</div>
			<div class="center-y" style="gap: 4px; font-weight: 600">
				<TdesignCopyright style="font-size: 0.9em" />
				2020 - 2025 zhullyb
			</div>
			<div class="center-y" style="gap: 8px; font-weight: 600">
				Proudly Powered by
				<NuxtLink to="https://nuxt.com/" class="center-y">
					<LogosNuxt style="fill: white" />
				</NuxtLink>
			</div>
			<NodeSupport style="margin-top: 12px" />
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
	const { locale } = useI18n()

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
		font-size: 16px;
	}

	.footer-content {
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
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

	.social {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 12px;

		&-icons {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 48px;
			width: 48px;
			border-radius: 50%;
			background-color: rgba(255, 255, 255, 0.1);
			cursor: pointer;

			&:hover {
				background-color: rgba(255, 255, 255, 0.2);
			}

			svg {
				width: 20px;
				height: 20px;
				fill: white;
			}
		}
	}
</style>
