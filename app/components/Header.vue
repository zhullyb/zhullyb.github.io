<template>
    <header :class="{ 'scrolled': isScrolled }">
        <div class="header-container">
            <div class="header-pc">
                <NuxtLink to="/" class="header-title">{{ appConfig.title }}</NuxtLink>
                <div>
                    <NuxtLink v-for="item in appConfig.nav.items" :key="item.link" :to="item.link">{{ item.text }}</NuxtLink>
                </div>
            </div>
            <div class="header-mobile">
                <div>
                    <span>菜单</span>
                </div>
            </div>
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
    if (route.path === '/') {
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
    window.addEventListener('scroll', handleScroll)
})
onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="scss" scoped>

header {
    width: 100%;
    display: flex;
    justify-content: center;
    padding-top: 20px;
    padding-bottom: 16px;
    height: fit-content;
    position: fixed;
    top: 0;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);


    &.scrolled {
        background-color: rgba(60, 70, 88, 0.7);
        padding-top: 16px;
        padding-bottom: 16px;
    }
}

.header-container {
    color: white;

    .header-title {
        font-weight: bold;
        text-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    }
}

.header-pc {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
}

a {
    color: white;
    text-decoration: none;
    margin-left: 16px;
    margin-right: 16px;
}

@media (min-width: 768px) {
    .header-container {
        min-width: 70%;
    }

    .header-mobile {
        display: none;
    }

    .title-container {
        width: 50vw;
    }

    .title {
        margin: auto auto auto 0;
    }
}

@media (max-width: 768px) {
    .header-container {
        width: 90%;
    }

    .header-pc {
        display: none;
    }

    .title {
        text-align: center;
    }
}
</style>