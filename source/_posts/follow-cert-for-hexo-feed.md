---
title: 为 Hexo 添加 follow 认证
date: 2024-10-23 23:11:32
sticky:
index_img: https://r2-reverse.5435486.xyz/uploads/2024/10/24/a93fd67a5419d.png
tags:
- Hexo
- Follow
---

## 前言

Follow 从今天开始不需要邀请码就可以开始使用部分功能了，除了只能订阅五个订阅源、成就系统没开放、签到不能获得 power 以外，还有部分功能没有解锁（如下图）

![](https://r2-reverse.5435486.xyz/uploads/2024/10/23/d3a69a7bcde58.webp)

我注意到 Follow 的认证机制目前对于 Hexo 用户还是相对不友好的，起码对于 Hexo 用户来说。

「内容」方案要我们在网页（也可能是 rss，follow 没有给出非常明确的指示）上添加非常明显的一段文本，我并不是很喜欢这种行为。

```
This message is used to verify that this feed (feedId:56144913816835091) belongs to me (userId:70410173045150720). Join me in enjoying the next generation information browser https://follow.is.
```

「描述」方案要求我们在 rss 的 xml 文件的 `<description />` 字段添加一段丑丑的代码。无论是使用 follow 的读者还是其他 rss reader 的读者都会看到博客的 description 中含有一段丑丑的代码，这对于强迫症的我来说是无法忍受的，更别提 atom 类型的订阅根本没有这个字段。

```
feedId:56144913816835091+userId:70410173045150720
```

![即使是在 follow 中，这样的文字也是非常眨眼](https://r2-reverse.5435486.xyz/uploads/2024/10/23/10dfda54f4dcc.webp)

「RSS 标签」方案是我唯一能接受的方案，这个方案需要我们在 rss 的 xml 文件中添加一个名为 `<follow_challenge>` 的标签，或者是 json 文件中的一个 `follow_challenge` 对象。虽然具有一定的侵入性，但对于读者来说不会受到影响——应该没有除了 follow 以外的 rss reader 对这个字段进行解析。

```xml
<follow_challenge>
    <feedId>56144913816835091</feedId>
    <userId>70410173045150720</userId>
</follow_challenge>
```

```json
{
  "follow_challenge": {
    "feed_id": "56144913816835091",
    "user_id": "70410173045150720"
  }
}
```

## 正篇

那么问题来了，Hexo 用户应该如何使用「RSS 标签」的方案给我们的博客进行 Follow 认证呢？

首先确认前提，我在使用 [hexo-generator-feed](https://github.com/hexojs/hexo-generator-feed) 这个 npm 库来生成 Hexo 博客的 rss 订阅文件。

在项目的 README 文件中，我们知道可以在 `_config.yml` 文件中指定 rss 生成时使用的模板文件。模板文件位于 `./node_modules/hexo-generator-feed` 路径下，atom.xml 和 rss2.xml 就是这个库所使用的模板文件。我正在使用 atom，所以我把 atom.xml 复制一份放到博客的根目录下魔改模板。下面是 _config.yml 的 feed 配置，你可以看到我在最后两行指定了 template 模板文件。

```yml
feed:
    type: atom
    path: rss.xml
    limit: 0
    hub:
    content: true
    content_limit:
    content_limit_delim: ' '
    template:
      - atom.xml
```

如果是个人用途，其实可以直接硬编码，在文件的倒数第二行把我们复制的 `<follow_challenge>` 放进去。

![](https://r2-reverse.5435486.xyz/uploads/2024/10/23/fae341d7985ea.webp)

或者如果我们想要写得考究一些，那么可以是下面这个样子的

```yml
feed:
  template:
    - atom.xml
  follow_challenge:
    feedId: 56144913816835091
    userId: 70410173045150720
```

```xml
<!-- //... -->
  {% endfor %}
  {% if config.feed.follow_challenge %}
    <follow_challenge>
      <feedId>{{ config.feed.follow_challenge.feedId }}</feedId>
      <userId>{{ config.feed.follow_challenge.userId }}</userId>
    </follow_challenge>
  {% endif %}
</feed>
```

***

（说起来，这两个小改动一改，其实完全可以上传 npmjs.com 作为一个新的插件，不过我有点懒了）

***

文末附一个 follow 邀请码: <span class="heimu">6O0oBazB9s</span>

