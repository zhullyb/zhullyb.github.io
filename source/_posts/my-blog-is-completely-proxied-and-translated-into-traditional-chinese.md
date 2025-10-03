---
title: 我的博客被完整地反向代理，并自动翻译成了繁体中文
date: 2024-07-18 11:22:37
sticky: 99
index_img: https://r2-reverse.5435486.xyz/uploads/2024/08/12/66ab4ffa4eda3.webp
tags:
- Blog
- Network
- Cloudflare
- waline
- umami
---

## 2024.08.20更新

我将境外的 Github Pages 解析停了，所有流量全部指向我的 HK 的 vps。

访问对方站点 /?about/ 时，在我服务器 /about/ 收到了一个奇怪的请求，访问对方别的路径时也会在我服务器的对应路径收到请求，UA 伪装成了 Google 家的爬虫:

![caddy 日志](https://r2-reverse.5435486.xyz/uploads/2024/08/20/82e8dc389f081.webp)

（关于为什么有 Mozilla 字段，可以参见 [《是的，所有现代浏览器都假装自己是火狐》](https://imbearchild.cyou/archives/2024/04/yes-browser-are-faking-to-be-firefox/)）

这个 ip 的归属地是新加坡 Cogent，合理怀疑是对方的源站 IP（也有可能只是对方用于请求的爬虫 ip）。直接通过 ip 访问对方站点，发现是 lnmp 的安装成功提示:

![ip 访问](https://r2-reverse.5435486.xyz/uploads/2024/08/20/4d181fd0bcc11.webp)

我注意到对方站点在 html 结尾处加了如下字段

![这里是直接请求的 archive 存档，所以有 archive 前缀](https://r2-reverse.5435486.xyz/uploads/2024/08/20/057a829ec9e4a.webp)

```html
<!-- freevslinks --><div style="display:none"><a href="http://www.xxfseo.com/?time=1721267439">xxfseo.com</a></div><!-- /freevslinks -->
```

![官网](https://r2-reverse.5435486.xyz/uploads/2024/08/20/b0449632623b2.webp)

似乎是专业产生互联网垃圾的组织。

我目前已经屏蔽了来自 `154.39.149.128` 这个 ip 的访问请求，对方的站点暂时性崩盘，以后可能会换用别的 ip 来爬也说不准，先到此为止吧。

***

## 现象

今早打开我的流量统计网站，发现我的博客有一个神奇的 referer

![](https://r2-reverse.5435486.xyz/uploads/2024/08/12/66989d79e740c.webp)

顶着我博客用的 favicon，但竟然不是我的域名。点进去一看，发现我的博客被翻译成了繁体中文，而且语句读上去也不是很通畅。[Archived here.](https://web.archive.org/web/20240718015038/https://theodorelobas.com/)![](https://r2-reverse.5435486.xyz/uploads/2024/08/12/66ab4ffa4eda3.webp)

再打开关于页一看，把我的博客域名给干掉了，只留下一个反代域名。[Archived here.](http://web.archive.org/web/20240718034705/https://theodorelobas.com/?about/)

![](https://r2-reverse.5435486.xyz/uploads/2024/08/12/66989f7f73b90.webp)

随机打开一个幸运页面，使用 F12 控制台查看流量情况，发现 umami 统计和 waline 评论都用的我个人部署的

![](https://r2-reverse.5435486.xyz/uploads/2024/08/12/6698a0bf39f8d.webp)

查询 ip 归属地，是老朋友 Cloudflare 泛播

![](https://r2-reverse.5435486.xyz/uploads/2024/08/12/6698a101845a2.webp)

![url 上不明所以的问号](https://r2-reverse.5435486.xyz/uploads/2024/08/12/6698a2dd3d78a.webp)

结合 url 上不明所以的问号，推测应该是 cloudflare workers 反向代理 + 调用翻译 api + 关键词替换。我小小更新了某个页面，发现对方站点也立马更新了，基本可以确定是反向代理。

whois 查询没有获得任何有用信息，一眼望去全是隐私保护。

![whois 信息](https://r2-reverse.5435486.xyz/uploads/2024/08/12/6698a2deaa9d0.webp)

***

事先声明，我的博客采用`CC BY-NC-SA 4.0`，我个人是非常欢迎任何人注明出处的情况下搬运甚至翻译我的文章的，甚至允许搬运到 csdn——只要你不开收费访问。但这种反代行为我是非常抵触的。

1. 文章被翻译成了繁体中文，但没有注明是翻译稿，直接把我本人的网名用繁体写了上去，这并不符合 `CC BY-NC-SA 4.0` 的要求。![如果修改了原文需要做出说明](https://r2-reverse.5435486.xyz/uploads/2024/08/12/669929695144b.webp)
2. 翻译质量很差，就连机翻都不应有这种奇怪的同义词替换，问了问熟悉繁中的朋友说是港台也没有这种用法，像是故意洗稿。![](https://r2-reverse.5435486.xyz/uploads/2024/08/12/6699bdbab5f0a.webp)
3. 反向代理了我的整个网站，但把我关于页上的博客链接给去掉了，我不认为这是善意的反代行为。[Archived here.](http://web.archive.org/web/20240718034705/https://theodorelobas.com/?about/)
4. 仍然在使用我的 waline 评论和 umami 统计。
5. 没有给我任何事先的邮件说明或者评论留言，whois 开隐私保护的情况下，我找不到任何方法去联系这位域名的持有者。

## 怎么办？

### 植入 js 进行跳转

因为对方同步的及时性很强，高度怀疑是 cloudflare workers 反向代理，且评论和流量统计都直接原模原样用的是我的 js，我就注入一个 js 检测 host，如果不是我的域名或者本地调试时使用的 `127.0.0.1` or `localhost`，则清空页面内容，给出文字提示，五秒后跳转到我的博客。代码如下:

```javascript
const host = window.location.host
if (host !== 'zhul.in' && ! host.startsWith('localhost') && ! host.startsWith('127.0.0.1')) {
    document.body.innerHTML = [
        '<div style="margin: auto;">',
        '<h1>当前页面并非本文作者的主页，将在五秒后跳转。</h1>',
        '<br />',
        '<h1>请此站点持有者联系我: zhullyb@outlook.com</h1>',
        '</div>',
    ].join('')
    document.body.style = [
        'background-color: white;',
        'color: black;',
        'text-align: center;',
        'font-size: 50px;',
        'width: 100vw;',
        'height: 100vh;',
        'display: flex;',
    ].join('')
    setTimeout(() => {
        window.location.href = 'https://zhul.in'
    }, 5000)
}
```

### 给 waline 和 umami 设置限制

我博客使用的 waline 和 umami 均是我自己在 vercel 上架设的，我自然可以根据访客的 referer 来判断请求的来源。不过看了下，vercel.json 文件并不能直接实现这个需求，可能需要我们自己来编写一些简易的中间件。

#### Waline

waline 文档中有明确提到，waline 基于 Koa 框架开发，可以[自行编写中间件](https://waline.js.org/reference/server/plugin.html#%E5%9F%BA%E4%BA%8E%E4%B8%AD%E9%97%B4%E4%BB%B6%E5%88%B6%E4%BD%9C)。

```js
// example/index.cjs
const Application = require('@waline/vercel');

module.exports = Application({
    plugins: [
        {
            middlewares: [
                async (ctx, next) => {
                    const referer = ctx.request.headers['referer'];
                    if (referer) {
                        if (
                            !referer.include('localhost') &&
                            !referer.include('127.0.0.1') &&
                            !referer.include('zhul.in')
                        ) {
                            ctx.status = 403
                            ctx.body = 'Forbidden'
                            return
                        }
                    }
                    await next();
                },
            ]
        }
    ],
    async postSave(comment) {
        // do what ever you want after comment saved
    },
});
```

成效立竿见影

![效果图](https://r2-reverse.5435486.xyz/uploads/2024/08/12/6698d6570a780.webp)

#### umami

对 umami 的第一次请求是 script.js，这个请求是因为 html 头部添加了 umami 的 script 链接，这一次请求是不带有 referer 的，因此，对方站点使用我的 umami 统计并不会给我的博客访问统计造成错乱——umami 能够自行分辨对方的站点是否是当初添加网站时填写的站点。但我不能忍的地方在与 umami 的数据库会记录对方站点的流量情况，这占用了我的数据库空间。

![数据库导出文件](https://r2-reverse.5435486.xyz/uploads/2024/08/12/6698d9c326739.webp)

umami 使用 nextjs 开发，似乎并没有给我留可供自定义的接口，贸然修改源码则可能会在下次 merge 官方代码时遇到麻烦。为了给自己省点事，我选择不再让博客加载 `https://umami.zhul.in/script.js` ，而是将其中的内容复制保存下来，添加基于 host 的判断条件来决定是否向自建的 umami 服务发起请求。

### 尝试向 cloudflare 举报滥用行为

cloudflare 是允许提交滥用举报的，这个域名正在使用 cloudflare 提供服务，因此我可以尝试举报，链接在这里: https://www.cloudflare.com/zh-cn/trust-hub/reporting-abuse/

![](https://r2-reverse.5435486.xyz/uploads/2024/08/12/669926eddb16e.webp)

类别就可以选 DCMA，因为对方没有遵守 `CC BY-NC-SA 4.0` 协议给我的文章做出合理的署名，且我的博客关于页面不属于 `CC BY-NC-SA 4.0` 的范畴，对方是没有理由去对这一页做出二次分发的行为的。

不过我暂时还没这么做，我期待着我前面的几个方案能够奏效，我仍寄希望于对方会及时和我沟通，我也不太想为此去填一张额外的烦人的表单。

## 最终效果

![](https://r2-reverse.5435486.xyz/uploads/2024/08/12/66992ad0d2890.gif)