<template>
	<h5 :id="id" class="prose-heading prose-h5">
		<slot />
		<a :href="`#${id}`" class="heading-anchor" aria-label="链接到此标题">
			<span class="anchor-icon">#</span>
		</a>
	</h5>
</template>

<script setup lang="ts">
defineProps({
	id: { type: String, required: true }
})
</script>

<style lang="less" scoped>
@import './prose-heading.less';

.prose-h5 {
	font-size: 1.125rem;
	font-weight: 600;
	line-height: 1.5;
	margin: 1rem 0 0.5rem 0;
}
</style>
