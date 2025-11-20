<template>
	<header :class="{ scrolled: isScrolled, 'show-mobile-menu': showMobileMenu }">
		<div class="header-container">
			<div class="header">
				<NuxtLinkLocale :to="'/'" class="header-title">{{ $t('title') }}</NuxtLinkLocale>
				<div class="header-right">
					<HeaderNav :nav-items="appConfig.nav.items" @toggle="toggleMobileMenu" />
					<NuxtLink
						v-if="targetPath"
						:to="targetPath"
						class="lang-switch"
						aria-label="Switch Language"
					>
						<span class="lang-switch__label">{{ locale === 'zh' ? 'En' : '中' }}</span>
					</NuxtLink>
					<button
						v-else
						type="button"
						class="lang-switch"
						@click="handleMissingTranslation"
						aria-label="Switch Language"
					>
						<span class="lang-switch__label">{{ locale === 'zh' ? 'En' : '中' }}</span>
					</button>
					<button
						type="button"
						class="search-trigger"
						@click="openSearch"
						aria-label="Search"
					>
						<IcBaselineSearch />
						<span class="search-trigger__label">{{ $t('search') }}</span>
					</button>
				</div>
			</div>
		</div>

		<div v-if="showMobileMenu" class="mobile-menu-dropdown">
			<NuxtLinkLocale
				v-for="item in appConfig.nav.items"
				:key="item.link"
				:to="item.link"
				@click="closeMobileMenu"
			>
				{{ $t(item.text) }}
			</NuxtLinkLocale>
			<a @click.prevent="openSearch">
				<IcBaselineSearch />
			</a>
		</div>
	</header>
	<Banner :background="background" :title="realTitle" :slogan="slogan" />
	<SearchOverlay v-model="showSearch" />
</template>

<script setup lang="ts">
	const appConfig = useAppConfig()
	const route = useRoute()
	const { locale } = useI18n()

	const { targetPath, targetLocale } = useLanguageSwitch()

	const handleMissingTranslation = () => {
		alert(targetLocale.value === 'en' ? 'English version not available' : '暂无中文版本')
	}

	// 计算 slogan 和标题
	const slogan = computed(() => {
		if (route.path === '/' || route.path.startsWith('/page/')) {
			return appConfig.slogan
		}
		return null
	})

	interface Props {
		title?: string
		background: {
			backgroundColor: string
			backgroundImage: string
		}
	}

	const props = withDefaults(defineProps<Props>(), {
		title: ''
	})

	const realTitle = computed(() => props.title || $t('title'))

	// 使用 composables
	const { isScrolled } = useScroll()
	const { showMobileMenu, toggleMobileMenu, closeMobileMenu } = useMobileMenu()

	const showSearch = ref(false)

	const openSearch = () => {
		closeMobileMenu()
		showSearch.value = true
	}

	watch(
		() => route.fullPath,
		() => {
			showSearch.value = false
		}
	)
</script>

<style lang="less" scoped>
	header {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 20px;
		padding-bottom: 16px;
		height: @header-height + 4px;
		position: fixed;
		top: 0;
		transition:
			background-color 0.3s ease,
			height 0.3s ease,
			padding-top 0.3s ease,
			backdrop-filter 0.3s ease;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		z-index: 2;
		user-select: none;

		&.scrolled {
			background-color: rgba(60, 70, 88, 0.7);
			backdrop-filter: blur(3px);
			height: @header-height;
			padding-top: 16px;
			padding-bottom: 16px;
		}

		&.show-mobile-menu {
			background-color: rgba(60, 70, 88, 0.7);
			backdrop-filter: blur(3px);
			height: fit-content;
		}
	}

	.header-container {
		color: white;
		min-width: 70%;

		.desktop-down({
      padding-left: 16px;
      padding-right: 16px;
      min-width: 100%;
    });

		.header-title {
			font-weight: bold;
			text-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
		}
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.mobile-menu-dropdown {
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		width: 100%;
		padding: 8px 0;

		a {
			color: white;
			padding: 12px 24px;
			text-align: center;
			text-decoration: none;
			font-size: 18px;
			font-weight: 500;
		}
	}

	a {
		color: white;
		text-decoration: none;
	}

	.lang-switch {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 6px 12px;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.3);
		background: rgba(255, 255, 255, 0.1);
		color: white;
		cursor: pointer;
		font-size: 14px;
		transition:
			background 0.2s ease,
			border-color 0.2s ease;

		&:hover {
			border-color: rgba(255, 255, 255, 0.6);
			background: rgba(255, 255, 255, 0.2);
		}
	}

	.search-trigger {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.3);
		background: rgba(255, 255, 255, 0.1);
		color: white;
		cursor: pointer;
		font-size: 14px;
		transition:
			background 0.2s ease,
			border-color 0.2s ease;

		&:hover {
			border-color: rgba(255, 255, 255, 0.6);
			background: rgba(255, 255, 255, 0.2);
		}

		span[aria-hidden='true'] {
			font-size: 16px;
			line-height: 1;
		}

    .desktop-down({
      display: none;
    });
	}
</style>
