<template>
    <header :class="{ 'scrolled': isScrolled, 'show-mobile-menu': showMobileMenu }">
        <div class="header-container">
            <div class="header">
                <a href="/" class="header-title">{{ appConfig.title }}</a>
                <HeaderNav 
                    :nav-items="appConfig.nav.items" 
                    @toggle="toggleMobileMenu"
                />
            </div>
        </div>
        <div v-if="showMobileMenu" class="mobile-menu-dropdown">
            <NuxtLink 
                v-for="item in appConfig.nav.items" 
                :key="item.link" 
                :to="item.link" 
                @click="closeMobileMenu"
            >
                {{ item.text }}
            </NuxtLink>
        </div>
    </header>
    <Banner 
        :banner-img="bannerImg" 
        :title="realTitle" 
        :slogan="slogan"
    />
</template>

<script setup lang="ts">
const appConfig = useAppConfig()
const route = useRoute()

// 计算 slogan 和标题
const slogan = computed(() => {
    if (route.path === '/' || route.path.startsWith('/page/')) {
        return appConfig.slogan
    }
    return null
})

interface Props {
    bannerImg: string
    title?: string
}

const props = withDefaults(defineProps<Props>(), {
    title: ''
})

const realTitle = computed(() => props.title || appConfig.title)

// 使用 composables
const { isScrolled } = useScroll()
const { showMobileMenu, toggleMobileMenu, closeMobileMenu } = useMobileMenu()
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
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1;
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

    .tablet-down({
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
</style>