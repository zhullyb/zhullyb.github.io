<template>
	<div>
		<Header :background="background" :title="title" />
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
		<Footer :background="background" />
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
		return Math.floor(Math.random() * appConfig.backgrounds.length)
	})
	const background = computed(
		() =>
			appConfig.backgrounds[randomIndex.value ?? 0] as {
				backgroundColor: string
				backgroundImage: string
			}
	)

	useHead({
		title: props.title || $t('title')
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
