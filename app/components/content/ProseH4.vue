<template>

	<h4 :id="id" class="prose-heading prose-h4">
		 <slot /> <a :href="`#${id}`" class="heading-anchor" aria-label="链接到此标题"
			> <span class="anchor-icon">#</span> </a
		>
	</h4>

</template>

<script setup lang="ts">
defineProps({
	id: { type: String, required: true }
})
</script>

<style lang="less" scoped>
@import './prose-heading.less';

.prose-h4 {
	font-size: 1.25rem;
	font-weight: 600;
	line-height: 1.4;
	margin: 1.25rem 0 0.625rem 0;
}
</style>

