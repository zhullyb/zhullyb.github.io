<template>
	<div>
		<Header :banner-img="bannerImg" :title="title" />
		<div class="content-wrapper">
			<div class="before-main side">
				<slot name="BeforeMain" />
			</div>
			<main>
				<slot />
			</main>
			<div class="after-main side">
				<slot name="AfterMain" />
			</div>
		</div>
		<Footer :banner-img="bannerImg" />
	</div>
</template>

<script setup lang="ts">
	const route = useRoute()
	const props = defineProps({
		title: {
			default: ''
		}
	})
	const appConfig = useAppConfig()
	const { data: randomIndex } = useAsyncData('randomIndex' + route.path, async () => {
		return Math.floor(Math.random() * appConfig.imgs.length)
	})
	const bannerImg = computed(() => appConfig.imgs[randomIndex.value ?? 0] as string)

	useHead({
		title: props.title || appConfig.title,
		link: [
			{
				rel: 'preload',
				as: 'image',
				href: bannerImg.value,
				fetchpriority: 'high'
			}
		]
	})
</script>

<style lang="less" scoped>
	.content-wrapper {
		margin-top: 40px;
		margin-bottom: 40px;

		.tablet-up({
      display: flex;
      justify-content: space-around;

      .side {
        width: 20%;
      }
    });

		.tablet-down({
      margin: 30px;
    });
	}

	main {
		min-height: calc(40vh - 120px);
		width: 50%;

		.desktop-down({
      width: 75%;
    });

		.tablet-down({
      width: unset;
    });
	}
</style>
