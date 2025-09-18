---
title: 创建 b23.tv 追踪参数移除 bot
date: 2023-10-29 00:35:48
description: 本文介绍了如何通过Python开发QQ和Telegram机器人，自动移除b23.tv短链接中的追踪参数以保护隐私。文章详细解析了b23短链接可能泄露的个人信息（如用户ID、设备信息和时间戳等），并提供了完整的代码实现，包括处理普通消息和QQ小程序分享的两种场景。通过这个机器人，用户可以自动获得无追踪参数的干净链接，防止大数据算法关联群组成员，但需注意无法防止人为信息倒查。适合关注隐私保护、对Python和机器人开发感兴趣的读者阅读。
sticky:
tags:
- Python
- Bot
- Privacy
---

> 前两天似乎有人高调宣称自己发 b23.tv 没问题，结果过两天就被拿下的消息。我自己并不是他的粉丝，但这个戏剧性的流言也又一次说明了注重隐私保护的重要性。

早前就有 b23.tf 和 b23.wtf 两个域名专门在做移除追踪参数的事情。只要将短链接中的 b23.tv 改成 b23.tf ，别人访问链接时就会被转到移除了追踪参数的链接。但这需要发送者在分享时手动更改域名。

因此，我也开始为自己的 bot 添加了 b23.tv 的 track id 移除功能。当用户的信息中包含 b23.tv 短链接，将会自动发送一条移除了 track id 的信息，用户就可以直接点击无追踪参数的链接。

当然，这两种方案并不能保护链接分享者的个人信息泄漏，因为 b23.tv 后面的参数是可以被别人看到的，通过这些参数就可以定位到链接分享者的个人信息，所以不能防止群里的内鬼倒查分享者的个人信息，但起码可以阻止大数据算法对群里的几个人产生关联。

## b23 短链接将会泄漏哪些个人信息？

通过 curl 命令，我们就可以看到 b23.tv 短链接重定向到了哪个页面。

![](https://static.031130.xyz/uploads/2024/08/12/653d49fe955f7.webp)

这是所携带的 GET 请求参数

```
 'buvid': ['*************************************'],
 'from_spmid': ['tm.recommend.0.0'],
 'is_story_h5': ['false'],
 'mid': ['************************'],
 'p': ['1'],
 'plat_id': ['116'],
 'share_from': ['ugc'],
 'share_medium': ['android'],
 'share_plat': ['android'],
 'share_session_id': ['************************************'],
 'share_source': ['GENERIC'],
 'share_tag': ['s_i'],
 'spmid': ['united.player-video-detail.0.0'],
 'timestamp': ['**********'],
 'unique_k': ['*******'],
 'up_id': ['*********']
```

其中，我替换成星号的部分都是有可能涉及到信息泄漏的部分，甚至没打码的部分也可以用来推测你的平台信息。

## QQ Bot

尽管目前腾讯针对 go-cqhttp 的封杀力度挺大的，但我还在用。

在 QQ 中的 b23.tv 追踪参数移除主要有两个方面。一是用户发送的消息中可能含有 b23.tv 短链接，二是用户在手机端直接调用 bilibili 自带的「分享到QQ」的功能，这样的话在 QQ 中会显示为小程序，go-cqhttp 接收到的是一个 json 的 CQ Code。

针对第一种情况，处理起来就相对简单，首先判断用户的信息中是否存在 `b23.tv` 这一关键词，然后用正则表达式获取完整的 b23 链接，再使用 python 的 requests 库去请求对应链接，返回带有明文追踪参数的 url 后去除 GET 参数即可。

参考代码如下

```python
if 'https://b23.tv' in message:
	pattern = r'https://b23\.tv/[^\s]+'
	urls = re.findall(pattern, message)
    ret = 'TrackID removed:'
	for i in urls:
	ret = ret + '\n' + b23_to_bvid(i)
    
def b23_to_bvid(url):
    tracked_url = requests.get(url,allow_redirects=False).headers['location']
    return tracked_url.split('?', 1)[0]
```

而针对第二种情况，则需要先解析对应的 json 信息，再参考第一种方法获取无追踪参数的链接。

参考代码如下

```python
if message.startswith('[CQ:json,data') and 'b23.tv' in message:
    decoded_data = html.unescape(message)
    match = re.search(r'\[CQ:json,data=(\{.*?\})\]', decoded_data)
    json_str = match.group(1)
    json_data = json.loads(json_str)
    if json_data['meta'].get('detail_1') is not None:
		raw_url = json_data['meta'].get('detail_1').get('qqdocurl')
	elif json_data['meta'].get('news') is not None:
		raw_url = json_data['meta'].get('news').get('jumpUrl')
    clean_url = b23_to_bvid(raw_url)
    
def b23_to_bvid(url):
    tracked_url = requests.get(url,allow_redirects=False).headers['location']
    return tracked_url.split('?', 1)[0]
```

## TG Bot

这个平台是提供了 Bot 的 API 的，所以也不用担心会被官方封杀，可惜用户访问起来可能相对困难，也不能要求所有联系人都迁移到这个平台上。思路也是一样的，用 requests 去请求 b23 短链，返回去除跟踪参数的 url。

参考代码如下

```python
from telegram import Update
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler, MessageHandler, filters
import requests
import re

ua = 'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0'

async def start(update: Update, context):
    await context.bot.send_message(chat_id=update.effective_chat.id, text="Hello World!")
    
async def b23_remover(update: Update, context):
    seng_msg = 'TrackID removed:'
    if 'https://b23.tv' in update.message.text:
        pattern = r'https://b23\.tv/[^\s]+'
        urls = re.findall(pattern, update.message.text)
        for i in urls:
            seng_msg += '\n' + await b23_to_bvid(i)
        await context.bot.send_message(chat_id=update.effective_chat.id, text=seng_msg)
        
async def b23_to_bvid(url):
    tracked_url = requests.get(url,allow_redirects=False,headers={'User-Agent': ua}).headers['Location']
    return tracked_url.split('?', 1)[0]
    
start_handler = CommandHandler("start", start)
b23_remove_handler = MessageHandler(filters.TEXT, b23_remover)

if __name__ == '__main__':
    TOKEN='**********************************************'
    application = ApplicationBuilder().token(TOKEN).build()
    application.add_handler(start_handler)
    application.add_handler(b23_remove_handler)
    application.run_polling()

```

代码编写参考了 [柯罗krau的博客 | krau's blog](https://krau.top/posts/tg-bot-dev-note-kmua)，使用时请注意以下问题:

- 你的机子是否拥有能访问到对应的 api 的网络环境
- botfather 那边是否打开了 allow group
- botfather 那边是否关闭了 privacy mode
