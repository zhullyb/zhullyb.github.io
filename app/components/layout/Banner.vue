<template>

	<div class="banner" :style="bannerStyle">

		<div class="mask">

			<div class="title-container">

				<div class="title">

					<h1>{{ title }}</h1>

					<p v-if="slogan">{{ slogan }}</p>

				</div>

			</div>

		</div>

	</div>

</template>

<script setup lang="ts">
interface Props {
	bannerImg: string
	title: string
	slogan?: string | null
}

const props = defineProps<Props>()

const bannerStyle = computed(() => ({
	background: `url(${props.bannerImg}) center center / cover no-repeat`
}))
</script>

<style lang="less" scoped>
.banner {
    height: 60vh;
    width: 100%;
}

.mask {
    background: rgba(0, 0, 0, 0.1);
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.title-container {
    margin: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: white;
    width: 50%;

    .tablet-down({
        width: 80%;
    });
}

.title {
    h1 {
        font-size: 32px;
        font-weight: bold;
        margin: 0;
    }

    p {
        font-size: 16px;
        margin: 8px 0;
        font-weight: 300;
    }

    color: white;
    padding-top: @header-height;
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.7);
    margin: auto auto auto 0;

    .tablet-down({
        text-align: center;
        margin: auto;
    });
}
</style>

