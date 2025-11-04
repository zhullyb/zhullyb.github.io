<template>
	<!-- 如果是 mermaid 代码块，使用 Mermaid 组件渲染 -->
	<Mermaid v-if="language === 'mermaid'" :code="code || ''" />
	<!-- 否则使用默认的 pre 渲染 -->
	<pre v-else :class="$props.class"><slot /></pre>
</template>

<script setup lang="ts">
// ProsePre 组件会包裹 ProseCode 组件
// 我们需要检查内部的 code 元素的 language 属性
const props = defineProps<{
	class?: string
	code?: string
	language?: string
	filename?: string
	highlights?: number[]
	meta?: string
}>()
</script>
