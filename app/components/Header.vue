<template>
    <header :class="{ 'scrolled': isScrolled, 'show-mobile-menu': showMobileMenu }">
        <div class="header-container">
            <div class="header">
                <a href="/" class="header-title">{{ appConfig.title }}</a>
                <nav>
                    <div class="pc-nav">
                        <NuxtLink v-for="item in appConfig.nav.items" :key="item.link" :to="item.link">{{ item.text }}</NuxtLink>
                    </div>
                    <div class="mobile-nav" @click="toggleMobileMenu">
                        <div class="container">
                            <div class="mobile-nav-item" v-for="_ in 3"></div>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
        <div v-if="showMobileMenu" class="mobile-menu-dropdown">
            <NuxtLink v-for="item in appConfig.nav.items" :key="item.link" :to="item.link" @click="closeMobileMenu">{{ item.text }}</NuxtLink>
        </div>
    </header>
    <div class="banner" :style="bannerStyle">
        <div class="mask">
            <div class="title-container">
                <div class="title">
                    <h1>{{ realTitle }}</h1>
                    <p v-if="slogan">{{ slogan }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'

const appConfig = useAppConfig()
const route = useRoute()
const slogan = computed(() => {
    if (route.path === '/' || route.path.startsWith('/page/')) {
        return appConfig.slogan
    }
    return null
})

const props = defineProps({
    bannerImg: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: ''
    }
})
const realTitle = computed(() => props.title || appConfig.title)
const bannerStyle = {
    background: `url(${props.bannerImg}) center center / cover no-repeat`,
}

import { ref, onMounted, onUnmounted } from 'vue'
const isScrolled = ref(false)
let ticking = false
const handleScroll = () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            isScrolled.value = window.scrollY > 0
            ticking = false
        })
        ticking = true
    }
}
onMounted(() => {
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    document.addEventListener('click', closeMobileMenu)
})
onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    document.removeEventListener('click', closeMobileMenu)
})

// 移动端菜单控制
const showMobileMenu = ref(false)

function toggleMobileMenu(e: MouseEvent) {
    e.stopPropagation()
    showMobileMenu.value = !showMobileMenu.value
}

function closeMobileMenu() {
    showMobileMenu.value = false
}
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
    height: fit-content;
    position: fixed;
    top: 0;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1;
    user-select: none;

    &.scrolled {
        background-color: rgba(60, 70, 88, 0.7);
        backdrop-filter: blur(3px);
        padding-top: 16px;
        padding-bottom: 16px;
    }

    &.show-mobile-menu {
        background-color: rgba(60, 70, 88, 0.7);
        backdrop-filter: blur(3px);
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

    .pc-nav{
        .tablet-down({
            display: none;
        });
    }

    .mobile-nav{
        display: none;
        margin-right: 16px;
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
    padding-top: 56px;
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.7);
    margin: auto auto auto 0;

    .tablet-down({
        text-align: center;
        margin: auto;
    });
}

a {
    color: white;
    text-decoration: none;
    margin-left: 16px;
    margin-right: 16px;
}
</style>