---
title: 构建部署在 Cloudflare Workers 上的 TG Bot
date: 2024-12-30 19:45:43
sticky:
tags:
- Bot
- Cloudflare
---

## 起因

早在去年 10 月，我就写过一篇[《创建 b23.tv 追踪参数移除 bot》](/2023/10/29/create-b23tv-remover-bot/)。记录了部署 b23.tv 的追踪参数移除 Bot 的部署方案。其中提到的 TG Bot 随着服务器到期不再续费也一同落灰了——**公益服务总是这样，开始时满腔热血，随着时间散去没有多少人能坚持投入成本，徒留下一地鸡毛。**

大概半个月前，我在群里看见 [Asuka Minato](https://asukaminato.eu.org/) 开发的群消息总结 Bot，整体部署在 Cloudflare Workers 上，在保证零运营成本的情况下有着相当非常不错的在线率保证，因此便考虑将这个 Bot 迁移到 Cloudflare Workers 上。**选用免费的 serverless 能够有效延长服务的可持续性，它不需要额外投入时间精力和财力进行维护，通常可以活很久。**

之所以可以把 TG Bot 部署到 Cloudflare Workers 上，主要是得益于 TG 平台支持 webhook 的方式让 Bot 程序提供服务。我们所需要提供的是一个公网能访问的 http 地址，在成功注册 webhook 服务后，TG 的官方服务器会将所有 Bot 所在群或者和所有对个人的对话以 http 请求的方式打到这个 url 上，而 Cloudflare Workers 平台就能提供一个 workers.dev 结尾的公网 url 作为 webhook 提供给 TG 服务器。

## 怎么做？

[在这个 Github 仓库中](https://github.com/cvzi/telegram-bot-cloudflare)，给出了不少例子，用以讲述如何利用 Cloudflare Workers 构建 TG Bot。

在 [bot.js](https://github.com/cvzi/telegram-bot-cloudflare/blob/main/bot.js) 这个文件中编写了一个最简单的 TG Bot，其功能是: 将受到的所有消息在头部添加「Echo:」字符串，并发送回刚才的对话。

例: 用户发送 「Hello」，bot 回复 「Echo: Hello」

***

## 代码分析

代码整体分为四个部分

### 顶部变量

文件顶部定义了 Bot 的 token、webhook 的 url 路径以及一个简易的 webhook 密码。

TOKEN 是从 botfather 那里获得的 bot token，SECRET 是自己设置的 webhook 密码，TG 的 webhook 服务器会通过把这个字段添加到名为 `X-Telegram-Bot-Api-Secret-Token` 的请求头中来证明自己的官方身份。

```javascript
const TOKEN = ENV_BOT_TOKEN // Get it from @BotFather https://core.telegram.org/bots#6-botfather
const WEBHOOK = '/endpoint'
const SECRET = ENV_BOT_SECRET // A-Z, a-z, 0-9, _ and -
```

### 简易路由

紧接着定义了一个简易的路由

```javascript
addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  if (url.pathname === WEBHOOK) {
    event.respondWith(handleWebhook(event))
  } else if (url.pathname === '/registerWebhook') {
    event.respondWith(registerWebhook(event, url, WEBHOOK, SECRET))
  } else if (url.pathname === '/unRegisterWebhook') {
    event.respondWith(unRegisterWebhook(event))
  } else {
    event.respondWith(new Response('No handler for this request'))
  }
})
```

### 核心功能

随后的三个函数，会先进行 SECRET 的校验，并将 message 类型消息从 TG 的所有消息类型中分离开单独处理

```javascript
/**
 * Handle requests to WEBHOOK
 * https://core.telegram.org/bots/api#update
 */
async function handleWebhook (event) {
  // Check secret
  if (event.request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== SECRET) {
    return new Response('Unauthorized', { status: 403 })
  }

  // Read request body synchronously
  const update = await event.request.json()
  // Deal with response asynchronously
  event.waitUntil(onUpdate(update))

  return new Response('Ok')
}

/**
 * Handle incoming Update
 * https://core.telegram.org/bots/api#update
 */
async function onUpdate (update) {
  if ('message' in update) {
    await onMessage(update.message)
  }
}

/**
 * Handle incoming Message
 * https://core.telegram.org/bots/api#message
 */
function onMessage (message) {
  return sendPlainText(message.chat.id, 'Echo:\n' + message.text)
}

/**
 * Send plain text message
 * https://core.telegram.org/bots/api#sendmessage
 */
async function sendPlainText (chatId, text) {
  return (await fetch(apiUrl('sendMessage', {
    chat_id: chatId,
    text
  }))).json()
```

我们需要更改的就是这个 onMessage 函数，用户输入的文本信息通过 message.text 获取，我们可以很轻易的把 b23 remover 的逻辑用 js 实现

```javascript
async function onMessage(message) {
    if (!message.text) {
        return;
    }
    const b23Reg = /b23\.tv\/[a-zA-Z0-9]+/g;
    if (!b23Reg.test(message.text)) {
        console.log('No match found');
    }
    const b23Links = message.text.match(b23Reg);
    const cleanLinks = [];
    await Promise.all(
        b23Links.map(link => b23Remover('https://' + link))
    ).then(result => {
        cleanLinks.push(...result);
    });

    const text2Send = "Track ID removed:\n" + cleanLinks.join("\n");
    return sendPlainText(message.chat.id, text2Send);
}

async function b23Remover (url) {
    const r = await fetch(url)
    const v = r.url
    const u = new URL(v)
    return u.origin + u.pathname
}
```

### webhook 注册相关

后面的 registerWebhook、unRegisterWebhook、apiUrl 在没有特定需求的情况下不需要变动。

在 Cloudflare 部署后，就可以访问 aaa.bbb.workers.dev/registerWebhook 这个 url 注册 TG 的 webhook 服务。收到 Ok 就代表注册好了。

![](https://static.031130.xyz/uploads/2024/12/30/5fd442bb18064.webp)

## 成果展示

![](https://static.031130.xyz/uploads/2024/12/30/3b0b929960840.webp)
