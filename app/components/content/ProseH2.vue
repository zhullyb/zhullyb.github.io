<template>

	<h2 :id="id" class="prose-heading prose-h2">
		 <slot /> <a :href="`#${id}`" class="heading-anchor" aria-label="链接到此标题"
			> <span class="anchor-icon">#</span> </a
		>
	</h2>

</template>

<script setup lang="ts">
defineProps({
	id: { type: String, required: true }
})
</script>

<style lang="less" scoped>
@import './prose-heading.less';

.prose-h2 {
	font-size: 1.875rem;
	font-weight: 600;
	line-height: 1.3;
	margin: 1.75rem 0 0.875rem 0;
}
</style>

