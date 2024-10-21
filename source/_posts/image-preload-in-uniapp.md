---
title: uniapp 中的图片预加载
date: 2024-04-01 05:31:25
sticky:
execrpt:
tags:
- uniapp
- Vue.js
---

最近在做微信小程序的时候遇到了图片资源过大无法正常打包的问题，没什么太好的方法，只能是使用图床托管这些图片资源。但部分图片的体积实在太大，即使是采用了境内 cdn 的图床，即使是采用 webp 对图片进行了压缩，部分图片都需要小几秒去把图片加载出来，这导致的用户体验就不是很好了，因此我们需要实现图片预加载的功能。

***

在 [uniapp 的官方文档](https://uniapp.dcloud.net.cn/api/preload-page.html#preloadpage)中，我找到了 `uni.preloadPage(OBJECT)` 方法。很可惜，这个方法并不支持微信小程序，自然不能完成被预加载页面的图片资源预加载。

***

经过搜索，在[一篇奇奇怪怪的文章](https://frontend.mimiwuqi.com/qianduan/202517.html)中提到：

> 在UniApp中，图片预加载可以通过使用`uni.getImageInfo`方法来实现。这个方法可以获取图片的信息，包括宽度、高度等。可以在应用启动时就开始加载图片，以提高后续图片显示的速度。

很遗憾，经过实测，提前使用 `getImageInfo()` 方法并不能实现图片的预加载。`getImageInfo()` 获取时的 Type 是 xhr，而后续图片加载时的 Type 为 webp，图片会被重复下载，并没有实现预加载的作用。

![下载测试](https://static.031130.xyz/uploads/2024/08/12/6609d97bc4f7f.webp)

上图中，蓝色部分是 `getImageInfo()` 的网络请求，红色部分是真正的图片加载请求，可谓是一点用都没有，该加载慢还是加载慢。

***

那有没有什么办法能够实现预加载呢？我没找到优雅的方法，选择在应用的首页创建一个 `display: none` 的 view 将所有的图片先加载一遍。

```vue
<template>
    <view style="display: none;">
        <image
            v-for="image in imageToPreload"
            :src="image"
        />
    </view>
</template>
<script setup lang="ts">
const imageToPreload = [
    "https://http.cat/100",
    "https://http.cat/200",
    "https://http.cat/300",
    "https://http.cat/400",
    "https://http.cat/500"
]
</script>
```

![下载测试](https://static.031130.xyz/uploads/2024/08/12/6609db8a213da.webp)

可以看到，红色部分的资源在 size 那一栏变成了 `(disk cache)`，加载时间也明显降低，虽然方法不优雅，但起码实现了图片资源的预加载。
