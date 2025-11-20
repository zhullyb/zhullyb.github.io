<template>
	<nav>
		<!-- PC 端导航 -->
		<div class="pc-nav">
			<NuxtLinkLocale v-for="item in navItems" :key="item.link" :to="item.link">
				{{ $t(item.text) }}
			</NuxtLinkLocale>
		</div>
		<!-- 移动端汉堡菜单图标 -->
		<div class="mobile-nav" @click="onToggle">
			<div class="container">
				<div class="mobile-nav-item" v-for="_ in 3" :key="_"></div>
			</div>
		</div>
	</nav>
</template>

<script setup lang="ts">
	interface NavItem {
		text: string
		link: string
	}

	interface Props {
		navItems: NavItem[]
	}

	defineProps<Props>()

	const emit = defineEmits<{
		toggle: [e: MouseEvent]
	}>()

	const onToggle = (e: MouseEvent) => {
		emit('toggle', e)
	}
</script>

<style lang="less" scoped>
	.pc-nav {
		.tablet-down({
    display: none;
  });
	}

	.mobile-nav {
		display: none;
		cursor: pointer;

		.tablet-down({
    display: flex;
    align-items: center;
    justify-content: center;
  });

		.container {
			width: 25px;
			height: 20px;
			margin: 0 auto;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
		}

		&-item {
			width: 100%;
			height: 2px;
			background: white;
			border-radius: 2px;
			flex-shrink: 0;
			margin: 2.5px 0;
		}
	}

	a {
		color: white;
		text-decoration: none;
		margin-left: 16px;
		margin-right: 16px;
	}
</style>
