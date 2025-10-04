<template>

	<h1 :id="id" class="prose-heading prose-h1">
		 <slot /> <a :href="`#${id}`" class="heading-anchor" aria-label="链接到此标题"
			> <span class="anchor-icon">#</span> </a
		>
	</h1>

</template>

<script setup lang="ts">
defineProps({
	id: { type: String, required: true }
})
</script>

<style lang="less" scoped>
@import './prose-heading.less';

.prose-h1 {
	font-size: 2.25rem;
	font-weight: 700;
	line-height: 1.2;
	margin: 2rem 0 1rem 0;
}
</style>

