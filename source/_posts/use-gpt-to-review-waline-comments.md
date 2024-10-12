---
title: 使用 GPT 对 waline 的评论进行审查
date: 2024-10-12 16:11:06
sticky:
execrpt:
tags:
- waline
- GPT
---

前一阵子收到了这么一条来自 waline 的评论提醒。

> New comment on 竹林里有冰的博客
> 【网站名称】：竹林里有冰的博客 
> 【评论者昵称】：专业数据库
> 【评论者邮箱】：rakhiranijhhg@gmail.com
> 【内容】：总之，优化专业数据库对于保持数据准确性、提高系统性能和推动业务成功至关重要。通过遵循本文中概述的策略，您可以提高数据库操作的效率并释放新的增长机会。
> 【地址】：https://zhul.in/2021/04/04/yay-more/#66f7a8889ab78865d5f5ae19

评论的内容不仅透露着一股 AI 味，还和文章内容可谓是一点关系都没有，点开评论者的网站一看，一股塑料机翻味，怕是又是个来蹭 SEO 的广告哥。

![广告哥留下的网站](https://cdn.zhullyb.top/uploads/2024/10/07/4673580090861.webp)

根据 [waline 的官方文档](https://waline.js.org/advanced/faq.html#%E5%8F%91%E5%B8%83%E8%AF%84%E8%AE%BA%E5%BE%88%E6%85%A2%E6%80%8E%E4%B9%88%E5%8A%9E)所言，waline 是使用了 Akismet 提供的垃圾内容检测服务的。可惜它似乎对 AI 生成的垃圾没有分辨能力。因此我计划使用 GPT 代替 Akismet 对 waline 的新评论进行审核。

walinejs/plugin 提供了一个 [tencent-cms](https://github.com/walinejs/plugins/blob/master/packages/tencent-tms/index.js) 的插件，功能是使用腾讯云的内容审查接口审查评论内容，这和我们需要的功能很像，主体部分和调用方法可以直接借鉴。

```javascript
// index.js

const tencentcloud = require("tencentcloud-sdk-nodejs-tms");
const TmsClient = tencentcloud.tms.v20201229.Client;


module.exports = function({secretId, secretKey, region}) {
  if (!secretId || !secretKey || !region) {
    return {};
  }

  const clientConfig = {
    credential: {
      secretId,
      secretKey,
    },
    region,
    profile: {
      httpProfile: {
        endpoint: "tms.tencentcloudapi.com",
      },
    },
  };
  
  return {
    hooks: {
      async preSave(data) {
        const { userInfo } = this.ctx.state;
        const isAdmin = userInfo.type === 'administrator';
        // ignore admin comment
        if (isAdmin) {
          return;
        }

        const client = new TmsClient(clientConfig);
        try {
          const resp = await client.TextModeration({ Content: data.comment });
          if (!resp.Suggestion) {
            throw new Error('Suggestion is empty. Tencent Cloud TMS info:', resp);
          }

          switch(resp.Suggestion) {
            case 'Pass':
              data.status = 'approved';
              break;
            case 'Block':
              data.status = 'spam';
              break;
              case 'Review':
              default:
                data.status = 'waiting';
                break;
          }
        } catch(e) {
          console.log(e);
          data.status = 'waiting';
        }
      },
    },
  };
}
```

可以看到，我们需要在这个被 module.exports 导出的函数中，return 一个对象，如果使用 hooks 编写的话可以调用[一些生命周期 hook](https://waline.js.org/reference/server/config.html#%E8%AF%84%E8%AE%BA-hooks): 在 preSave 阶段，我们可以通过标注 data.status 参数来反馈评论类型。approved 为接受，spam 为垃圾邮件，waiting 为等待人工审核；除此之外，还可以[基于 Koa 中间件制作插件](https://waline.js.org/reference/server/plugin.html#%E5%9F%BA%E4%BA%8E%E4%B8%AD%E9%97%B4%E4%BB%B6%E5%88%B6%E4%BD%9C)，文档中有具体的描述。

index.js 顶部是需要引入的依赖。当然，如果需要引入外部的第三方包的话，需要在 packages.json 中加入需要的依赖（使用包管理器的命令进行安装）。

有了这些基础知识，就能手搓一个基于 GPT 的评论审查插件。

OpenAI 提供的是标准的 Restful API，本身的鉴权逻辑也不复杂，其实没必要调用 SDK，直接使用 fetch 调用就行。

```javascript
const doReview = async (comment) => {
  const response = await fetch(openaiBaseUrl + '/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: openaiModel,
      messages: [
        {
          role: 'system',
          content: prompt
        },
        {
          role: 'user',
          content: comment,
        },
      ],
    }),
  });
  const data = await response.json();
  if (data && data.choices && data.choices.length > 0) {
    return data.choices[0].message.content;
  } else {
    return 'waiting';
  }
}
```

再配合相应的封装，一款基于 GPT 的 waline 评论审核插件就完成了

- [zhullyb/waline-plugin-llm-reviewer](https://github.com/zhullyb/waline-plugin-llm-reviewer)

**如何安装**

```bash
npm install waline-plugin-llm-reviewer
```

**如何使用**

```javascript
// index.js
const Waline = require('@waline/vercel');
const GPTReviewer = require('waline-plugin-llm-reviewer');

module.exports = Waline({
  plugins: [
    GptReviewer({
        openaiBaseUrl: process.env.OPENAI_BASE_URL,
        openaiModel: process.env.OPENAI_MODEL,
        openaiApiKey: process.env.OPENAI_API_KEY,
        openaiPrompt: process.env.OPENAI_PROMPT,
    })
  ]
});
```

**环境变量**

- `ASISMET_KEY`: Waline 使用的反垃圾评论服务，**建议设置为 `false` 以禁用**。
- `OPENAI_BASE_URL`: API 基础 URL。例如 `https://api.openai.com`
- `OPENAI_MODEL`: 模型名称。例如 `gpt-4o-mini`
- `OPENAI_API_KEY`: API 密钥。例如 `ak-xxxxxx`
- `OPENAI_PROMPT`(可选): 模型的提示。例如 `这是一个评论审查: `

在 waline 中设置好对应的环境变量，使用 npm 安装好对应的包，就算大功告成了。

![](https://cdn.zhullyb.top/uploads/2024/10/12/45f06a78286de.webp)
