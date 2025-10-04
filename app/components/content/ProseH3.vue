<template>

	<h3 :id="id" class="prose-heading prose-h3">
		 <slot /> <a :href="`#${id}`" class="heading-anchor" aria-label="链接到此标题"
			> <span class="anchor-icon">#</span> </a
		>
	</h3>

</template>

<script setup lang="ts">
defineProps({
	id: { type: String, required: true }
})
</script>

<style lang="less" scoped>
@import './prose-heading.less';

.prose-h3 {
	font-size: 1.5rem;
	font-weight: 600;
	line-height: 1.4;
	margin: 1.5rem 0 0.75rem 0;
}
</style>

