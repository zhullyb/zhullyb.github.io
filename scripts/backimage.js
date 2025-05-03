const script2inject = `
<script>
    const imgs = [
        "https://static.031130.xyz/uploads/2024/08/12/62f373292129a.webp",
        "https://static.031130.xyz/uploads/2024/08/12/62f3732b562d8.webp",
        "https://static.031130.xyz/uploads/2024/08/12/62f3732d6ebe2.webp",
        "https://static.031130.xyz/uploads/2024/08/12/62f3732f6b225.webp",
        "https://static.031130.xyz/uploads/2024/08/12/62f37332b1c8b.webp",
        "https://static.031130.xyz/uploads/2024/08/12/62f37338661d8.webp",
        "https://static.031130.xyz/uploads/2024/08/12/62f3733c35741.webp",
        "https://static.031130.xyz/uploads/2024/08/12/62f3733deca7f.webp",
        "https://static.031130.xyz/uploads/2024/08/12/62f373406909e.webp",
        "https://static.031130.xyz/uploads/2024/08/12/62f373423b6c0.webp",
        "https://static.031130.xyz/uploads/2024/08/12/62f37343c5254.webp",
        "https://static.031130.xyz/uploads/2024/08/12/62f37345532e7.webp",
        "https://static.031130.xyz/uploads/2024/08/12/62f373479efcf.webp",
        "https://static.031130.xyz/uploads/2024/08/12/62f3734a2de90.webp",
        "https://static.031130.xyz/uploads/2024/08/12/62f3734bea5a7.webp",
        "https://static.031130.xyz/uploads/2024/08/12/62f3734dc3404.webp",
        "https://static.031130.xyz/uploads/2024/08/12/62f3734fe20d3.webp",
        "https://static.031130.xyz/uploads/2024/08/12/62f37351bae52.webp",
        "https://static.031130.xyz/uploads/2024/08/12/62f373539bd9f.webp",
        "https://static.031130.xyz/uploads/2024/08/12/62f37354f1ec7.webp",
        "https://static.031130.xyz/uploads/2024/08/12/62f373569f4ef.webp",
        "https://static.031130.xyz/uploads/2024/08/12/62f3735851795.webp",
        "https://static.031130.xyz/uploads/2024/08/12/62f37359a2c36.webp",
        "https://static.031130.xyz/uploads/2024/08/12/5fd959de5f180.webp",
        "https://static.031130.xyz/uploads/2024/08/12/1ef8787039f53.webp",
        "https://static.031130.xyz/uploads/2024/08/12/fb261297a3570.webp",
        "https://static.031130.xyz/uploads/2024/08/12/62f374ea7b242.webp",
        "https://static.031130.xyz/uploads/2024/08/12/62f374ec8c14d.webp",
        "https://static.031130.xyz/uploads/2024/08/12/6609df9b83ecd.webp",
        "https://static.031130.xyz/uploads/2025/05/04/e1aa9e18bebb1.webp"
    ]

    const luck_img = imgs[Math.floor(Math.random() * imgs.length)]
    const banner = document.getElementById('banner')
    banner.style.background = "url(" + luck_img + ") center center / cover no-repeat"
</script>
`

hexo.extend.injector.register('body_end', script2inject, 'default');